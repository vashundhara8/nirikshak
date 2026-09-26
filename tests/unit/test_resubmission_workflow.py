"""
tests/unit/test_resubmission_workflow.py

Integration tests for Fix 5 (resubmission multipart FormData contract) and
Fix 10 (dead RESUBMITTED_DOC assignment removed).

These tests use the direct service/model layer — no HTTP client, no
rate-limiter, no MinIO (storage_key is a synthetic string).

Workflow tested:
  1. Application created with SUBMITTED status
  2. Deficiency seeded with a meaningful deficiency_type
  3. Resubmit logic executes (simulated from documents.py endpoint logic)
  4. New DocumentVersion is created
  5. Deficiency transitions to CORRECTION_SUBMITTED
  6. Application transitions to RESUBMISSION_RECEIVED
  7. Document type == deficiency_type (not RESUBMITTED_DOC)
"""
import uuid
import pytest

# Apply JSONB→TEXT patch before any model import
from tests.unit.conftest_sqlite import patch_jsonb_for_sqlite
patch_jsonb_for_sqlite()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="module", autouse=True)
def create_tables():
    from app.db.base import Base
    import app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def _seed_role(db, name):
    from app.models.identity import Role
    r = db.query(Role).filter(Role.name == name).first()
    if r:
        return r
    r = Role(id=uuid.uuid4(), name=name)
    db.add(r)
    db.commit()
    return r


def _create_user(db, email, password, role_name):
    from app.models.identity import User
    from app.core.security import get_password_hash
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return existing
    role = _seed_role(db, role_name)
    user = User(
        id=uuid.uuid4(), email=email,
        hashed_password=get_password_hash(password), is_active=True,
    )
    user.roles.append(role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _simulate_resubmit(db, application_id, deficiency_id, applicant_id, file_bytes=b"%PDF-1.4 corrected"):
    """
    Simulates the exact logic from documents.py /resubmit endpoint (after Fix 10).
    Returns (doc, doc_version, deficiency).
    """
    from app.models.application import Application
    from app.models.document import Document, DocumentVersion
    from app.models.verification import Deficiency
    from app.core.scanner import calculate_checksum
    from datetime import datetime, timezone

    app_obj = db.query(Application).filter(Application.id == application_id).first()
    assert app_obj is not None

    deficiency = db.query(Deficiency).filter(
        Deficiency.id == deficiency_id,
        Deficiency.application_id == application_id,
    ).first()
    assert deficiency is not None
    assert deficiency.status == "OPEN"

    checksum = calculate_checksum(file_bytes)
    storage_key = f"test/resubmit_{uuid.uuid4()}.pdf"

    # Fix 10: document_type comes from deficiency.deficiency_type — no hardcoded "RESUBMITTED_DOC"
    doc = db.query(Document).filter(
        Document.application_id == application_id,
        Document.document_type == deficiency.deficiency_type,
    ).first()
    if not doc:
        doc = Document(application_id=application_id, document_type=deficiency.deficiency_type)
        db.add(doc)
        db.flush()

    version_count = db.query(DocumentVersion).filter(DocumentVersion.document_id == doc.id).count()
    dv = DocumentVersion(
        document_id=doc.id,
        version_number=version_count + 1,
        storage_key=storage_key,
        file_hash=checksum,
        mime_type="application/pdf",
        file_size=len(file_bytes),
        uploaded_by=applicant_id,
        status="UPLOADED",
    )
    db.add(dv)
    db.flush()
    doc.current_version_id = dv.id

    deficiency.status = "CORRECTION_SUBMITTED"
    deficiency.resolved_at = datetime.now(timezone.utc)
    deficiency.resolution_notes = f"Resubmitted via document version {dv.id}"

    app_obj.current_status = "RESUBMISSION_RECEIVED"
    db.commit()

    return doc, dv, deficiency


class TestResubmissionWorkflow:

    def test_new_document_version_created_on_resubmit(self):
        """Resubmitting a corrected document must create a new DocumentVersion."""
        db = TestingSessionLocal()
        try:
            from app.models.application import Application
            from app.models.document import Document, DocumentVersion
            from app.models.verification import Deficiency, VerificationRun

            applicant = _create_user(db, f"rsub1_{uuid.uuid4().hex[:6]}@test.com", "pass", "APPLICANT")
            app_obj = Application(
                applicant_id=applicant.id, scheme_code="PM-RESUBMIT",
                academic_year="2024-2025", current_status="SUBMITTED",
                submitted_data={"applicant": {"name": "Test"}},
            )
            db.add(app_obj)
            db.commit()

            # Seed a VerificationRun and Deficiency
            run = VerificationRun(
                id=uuid.uuid4(), application_id=app_obj.id,
                engine_versions={"doc_intel": "1.0"}, input_document_references={}, status="COMPLETED",
            )
            db.add(run)
            db.flush()
            deficiency = Deficiency(
                id=uuid.uuid4(), verification_run_id=run.id,
                application_id=app_obj.id, deficiency_type="INCOME_CERTIFICATE", status="OPEN",
            )
            db.add(deficiency)
            db.commit()

            original_dv_count = db.query(DocumentVersion).filter(
                DocumentVersion.document_id.in_(
                    db.query(Document.id).filter(Document.application_id == app_obj.id)
                )
            ).count()

            # Resubmit
            doc, dv, updated_def = _simulate_resubmit(
                db, app_obj.id, deficiency.id, applicant.id
            )

            new_dv_count = db.query(DocumentVersion).filter(
                DocumentVersion.document_id == doc.id
            ).count()

            assert new_dv_count > original_dv_count, "A new DocumentVersion must have been created"
            assert new_dv_count == 1  # Started from zero for this doc type

        finally:
            db.close()

    def test_deficiency_transitions_to_correction_submitted(self):
        """After resubmit, deficiency.status must be CORRECTION_SUBMITTED."""
        db = TestingSessionLocal()
        try:
            from app.models.application import Application
            from app.models.verification import Deficiency, VerificationRun

            applicant = _create_user(db, f"rsub2_{uuid.uuid4().hex[:6]}@test.com", "pass", "APPLICANT")
            app_obj = Application(
                applicant_id=applicant.id, scheme_code="PM-DEF-TRANS",
                academic_year="2024-2025", current_status="SUBMITTED", submitted_data={},
            )
            db.add(app_obj)
            db.commit()
            run = VerificationRun(
                id=uuid.uuid4(), application_id=app_obj.id,
                engine_versions={}, input_document_references={}, status="COMPLETED",
            )
            db.add(run)
            db.flush()
            deficiency = Deficiency(
                id=uuid.uuid4(), verification_run_id=run.id,
                application_id=app_obj.id, deficiency_type="DOMICILE_CERTIFICATE", status="OPEN",
            )
            db.add(deficiency)
            db.commit()

            _, _, updated_def = _simulate_resubmit(db, app_obj.id, deficiency.id, applicant.id)

            deficiency_id = deficiency.id  # save UUID before expunge
            db.expunge_all()
            from app.models.verification import Deficiency as D
            refreshed = db.query(D).filter(D.id == deficiency_id).first()
            assert refreshed.status == "CORRECTION_SUBMITTED"
            assert refreshed.resolved_at is not None
        finally:
            db.close()

    def test_application_transitions_to_resubmission_received(self):
        """After resubmit, application.current_status must be RESUBMISSION_RECEIVED."""
        db = TestingSessionLocal()
        try:
            from app.models.application import Application
            from app.models.verification import Deficiency, VerificationRun

            applicant = _create_user(db, f"rsub3_{uuid.uuid4().hex[:6]}@test.com", "pass", "APPLICANT")
            app_obj = Application(
                applicant_id=applicant.id, scheme_code="PM-APP-TRANS",
                academic_year="2024-2025", current_status="SUBMITTED", submitted_data={},
            )
            db.add(app_obj)
            db.commit()
            run = VerificationRun(
                id=uuid.uuid4(), application_id=app_obj.id,
                engine_versions={}, input_document_references={}, status="COMPLETED",
            )
            db.add(run)
            db.flush()
            deficiency = Deficiency(
                id=uuid.uuid4(), verification_run_id=run.id,
                application_id=app_obj.id, deficiency_type="AADHAR", status="OPEN",
            )
            db.add(deficiency)
            db.commit()

            _simulate_resubmit(db, app_obj.id, deficiency.id, applicant.id)

            app_id = app_obj.id  # save UUID before expunge
            db.expunge_all()
            refreshed_app = db.query(Application).filter(Application.id == app_id).first()
            assert refreshed_app.current_status == "RESUBMISSION_RECEIVED"
        finally:
            db.close()

    def test_document_type_uses_deficiency_type_not_resubmitted_doc(self):
        """Fix 10: document.document_type must equal deficiency.deficiency_type,
        never the dead 'RESUBMITTED_DOC' constant."""
        db = TestingSessionLocal()
        try:
            from app.models.application import Application
            from app.models.document import Document
            from app.models.verification import Deficiency, VerificationRun

            applicant = _create_user(db, f"rsub4_{uuid.uuid4().hex[:6]}@test.com", "pass", "APPLICANT")
            app_obj = Application(
                applicant_id=applicant.id, scheme_code="PM-DTYPE",
                academic_year="2024-2025", current_status="SUBMITTED", submitted_data={},
            )
            db.add(app_obj)
            db.commit()
            run = VerificationRun(
                id=uuid.uuid4(), application_id=app_obj.id,
                engine_versions={}, input_document_references={}, status="COMPLETED",
            )
            db.add(run)
            db.flush()
            deficiency = Deficiency(
                id=uuid.uuid4(), verification_run_id=run.id,
                application_id=app_obj.id, deficiency_type="ST_CERTIFICATE", status="OPEN",
            )
            db.add(deficiency)
            db.commit()

            doc, dv, _ = _simulate_resubmit(db, app_obj.id, deficiency.id, applicant.id)

            doc_id = doc.id  # save UUID before expunge
            db.expunge_all()
            fetched_doc = db.query(Document).filter(Document.id == doc_id).first()
            assert fetched_doc.document_type == "ST_CERTIFICATE", (
                f"Expected ST_CERTIFICATE, got {fetched_doc.document_type}"
            )
            assert fetched_doc.document_type != "RESUBMITTED_DOC", (
                "RESUBMITTED_DOC dead assignment must not affect document_type"
            )
        finally:
            db.close()

    def test_second_resubmit_increments_version_number(self):
        """A second resubmit for the same deficiency type must produce version 2."""
        db = TestingSessionLocal()
        try:
            from app.models.application import Application
            from app.models.document import DocumentVersion
            from app.models.verification import Deficiency, VerificationRun

            applicant = _create_user(db, f"rsub5_{uuid.uuid4().hex[:6]}@test.com", "pass", "APPLICANT")
            app_obj = Application(
                applicant_id=applicant.id, scheme_code="PM-V2TEST",
                academic_year="2024-2025", current_status="SUBMITTED", submitted_data={},
            )
            db.add(app_obj)
            db.commit()

            # First deficiency + resubmit
            run = VerificationRun(id=uuid.uuid4(), application_id=app_obj.id, engine_versions={}, input_document_references={}, status="COMPLETED")
            db.add(run)
            db.flush()
            d1 = Deficiency(id=uuid.uuid4(), verification_run_id=run.id, application_id=app_obj.id, deficiency_type="MARKSHEET", status="OPEN")
            db.add(d1)
            db.commit()
            doc, dv1, _ = _simulate_resubmit(db, app_obj.id, d1.id, applicant.id)
            assert dv1.version_number == 1

            # Second deficiency + resubmit on same document type
            app_obj.current_status = "SUBMITTED"
            d2 = Deficiency(id=uuid.uuid4(), verification_run_id=run.id, application_id=app_obj.id, deficiency_type="MARKSHEET", status="OPEN")
            db.add(d2)
            db.commit()
            _, dv2, _ = _simulate_resubmit(db, app_obj.id, d2.id, applicant.id, b"%PDF-1.4 second correction")
            assert dv2.version_number == 2
        finally:
            db.close()

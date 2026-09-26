"""
tests/unit/test_verification_finding_import.py

Issue 2: VerificationFinding was referenced in applications.py line 210
but missing from the import statement. This test confirms:
  1. The import is resolvable (ImportError would previously crash at startup)
  2. The /applications/{id}/verification endpoint logic runs without NameError
  3. VerificationFinding is queryable on the test DB schema

Uses SQLite in-memory + JSONB compat.
"""
import uuid
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from tests.unit.conftest_sqlite import patch_jsonb_for_sqlite
patch_jsonb_for_sqlite()

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


class TestVerificationFindingImport:

    def test_verification_finding_importable_from_models(self):
        """VerificationFinding must be importable from app.models.verification."""
        from app.models.verification import VerificationFinding  # noqa: F401
        assert VerificationFinding.__tablename__ == "verification_findings"

    def test_applications_api_module_imports_without_error(self):
        """applications.py must import cleanly (no NameError on VerificationFinding)."""
        import importlib
        mod = importlib.import_module("app.api.applications")
        # If the import was missing, this would raise ImportError or NameError at module level
        assert hasattr(mod, "router"), "applications.py must expose a FastAPI router"

    def test_verification_finding_in_applications_module_namespace(self):
        """After the fix, VerificationFinding must be in the applications module namespace."""
        import app.api.applications as apps_mod
        assert hasattr(apps_mod, "VerificationFinding"), (
            "VerificationFinding must be imported in app.api.applications after the fix"
        )

    def test_get_verification_status_logic_uses_finding_count(self):
        """
        Simulate the /{application_id}/verification status endpoint logic.
        The query `db.query(VerificationFinding).filter(...)` must execute
        without NameError now that the import is present.
        """
        db = TestingSessionLocal()
        try:
            from app.models.identity import User, Role
            from app.core.security import get_password_hash
            from app.models.application import Application
            from app.models.verification import VerificationRun, VerificationFinding

            # Seed a role + user + application + run
            role = db.query(Role).filter(Role.name == "APPLICANT").first()
            if not role:
                role = Role(id=uuid.uuid4(), name="APPLICANT")
                db.add(role)
                db.commit()
            user = User(
                id=uuid.uuid4(), email=f"vf_{uuid.uuid4().hex[:6]}@test.com",
                hashed_password=get_password_hash("pass"), is_active=True,
            )
            user.roles.append(role)
            db.add(user)
            db.commit()

            app_obj = Application(
                applicant_id=user.id, scheme_code="PM-VF-TEST",
                academic_year="2024-2025", current_status="VERIFICATION",
                submitted_data={},
            )
            db.add(app_obj)
            db.commit()

            run = VerificationRun(
                id=uuid.uuid4(), application_id=app_obj.id,
                engine_versions={"doc_intel": "1.0"}, input_document_references={},
                status="COMPLETED",
            )
            db.add(run)
            db.commit()

            # Seed one VerificationFinding
            finding = VerificationFinding(
                id=uuid.uuid4(), verification_run_id=run.id,
                finding_type="DOCUMENT_VALIDATION",
                status="PASS",
                source_identifier="DOB_CONSISTENCY",
                details={"checked": True},
            )
            db.add(finding)
            db.commit()

            # This is the exact query from applications.py line 210 (after fix)
            finding_count = db.query(VerificationFinding).filter(
                VerificationFinding.verification_run_id == run.id
            ).count()

            assert finding_count == 1, f"Expected 1 finding, got {finding_count}"
        finally:
            db.close()

    def test_verification_status_endpoint_returns_finding_count(self):
        """Full endpoint-logic simulation: GET /{application_id}/verification
        must return correct finding_count after the import fix."""
        db = TestingSessionLocal()
        try:
            from app.models.identity import User, Role
            from app.core.security import get_password_hash
            from app.models.application import Application
            from app.models.verification import VerificationRun, VerificationFinding, Deficiency

            role = db.query(Role).filter(Role.name == "APPLICANT").first()
            if not role:
                role = Role(id=uuid.uuid4(), name="APPLICANT")
                db.add(role)
                db.commit()

            user = User(
                id=uuid.uuid4(), email=f"vf2_{uuid.uuid4().hex[:6]}@test.com",
                hashed_password=get_password_hash("pass"), is_active=True,
            )
            user.roles.append(role)
            db.add(user)
            db.commit()

            app_obj = Application(
                applicant_id=user.id, scheme_code="PM-VF2",
                academic_year="2024-2025", current_status="VERIFICATION",
                submitted_data={},
            )
            db.add(app_obj)
            db.commit()

            run = VerificationRun(
                id=uuid.uuid4(), application_id=app_obj.id,
                engine_versions={}, input_document_references={}, status="COMPLETED",
            )
            db.add(run)
            db.flush()

            # Two findings
            for source in ["DOB_CHECK", "INCOME_CHECK"]:
                db.add(VerificationFinding(
                    id=uuid.uuid4(), verification_run_id=run.id,
                    finding_type="POLICY_EVALUATION", status="PASS",
                    source_identifier=source, details={},
                ))
            db.commit()

            # Replicate endpoint logic from applications.py lines 206-222
            latest_run = db.query(VerificationRun).filter(
                VerificationRun.application_id == app_obj.id
            ).order_by(VerificationRun.started_at.desc()).first()
            assert latest_run is not None

            finding_count = db.query(VerificationFinding).filter(
                VerificationFinding.verification_run_id == latest_run.id
            ).count()
            def_count = db.query(Deficiency).filter(
                Deficiency.verification_run_id == latest_run.id
            ).count()

            assert finding_count == 2
            assert def_count == 0
        finally:
            db.close()

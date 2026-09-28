import pytest
import uuid
import json
import os
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.identity import User
from app.models.application import Application
from app.models.document import Document, DocumentVersion
from app.models.verification import VerificationRun, VerificationFinding, Deficiency, EvidenceRecord
from app.core.celery_app import run_verification_task
from app.services.verification_service import VerificationService
from datetime import datetime, timezone

@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from unittest.mock import patch

@patch('ai.document_intelligence.ocr_engine.OCREngine.extract')
def test_real_pipeline_end_to_end(mock_extract, db_session: Session):
    mock_extract.return_value = "Mocked OCR text for income 100000. Name TEST USER."
    # Setup test user and application
    user = User(email=f"test_{uuid.uuid4()}@example.com", hashed_password="hashed")
    db_session.add(user)
    db_session.commit()

    app = Application(
        applicant_id=user.id,
        scheme_code="PM-2022",
        academic_year="2026-2027",
        current_status="SUBMITTED",
        submitted_data={
            "applicant": {"name": "TEST USER", "dob": "2000-01-01"},
            "demographic": {"category": "ST", "annual_family_income": 100000},
            "academic": {"institution_id": "INST-123", "course_id": "CRS-456"}
        }
    )
    db_session.add(app)
    db_session.commit()

    # Create a Document and DocumentVersion
    doc = Document(application_id=app.id, document_type="INCOME_CERTIFICATE")
    db_session.add(doc)
    db_session.commit()

    storage_key = f"test_{uuid.uuid4()}.pdf"
    storage_dir = os.path.join(os.getcwd(), "scratch", "dev_storage")
    os.makedirs(storage_dir, exist_ok=True)
    with open(os.path.join(storage_dir, storage_key), "wb") as f:
        f.write(b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n108\n%%EOF\n")

    doc_version = DocumentVersion(
        document_id=doc.id,
        version_number=1,
        storage_key=storage_key,
        file_hash="dummy_hash",
        mime_type="application/pdf",
        file_size=120,
        uploaded_by=user.id
    )
    db_session.add(doc_version)
    db_session.commit()

    doc.current_version_id = doc_version.id
    db_session.commit()

    # Trigger Verification (creates run)
    service = VerificationService(db_session)
    run = service.trigger_verification(app.id, user.id, "APPLICANT")
    db_session.commit()

    assert run.status == "PROCESSING"

    # Execute the Celery task synchronously
    run_verification_task(str(run.id), str(user.id), "APPLICANT")

    db_session.refresh(run)
    db_session.refresh(app)

    assert run.status in ["COMPLETED", "FAILED"]
    
    findings = db_session.query(VerificationFinding).filter(VerificationFinding.verification_run_id == run.id).all()
    assert len(findings) > 0, "No findings were generated. The pipeline might have bypassed AI layers."

    print(f"Run Status: {run.status}")
    print(f"App Status: {app.current_status}")
    print(f"Findings: {len(findings)}")

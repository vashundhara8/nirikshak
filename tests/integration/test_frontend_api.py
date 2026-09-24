import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import uuid
import json
from datetime import datetime, timezone
import io

from app.main import app
from app.db.session import get_db, SessionLocal
from app.models.identity import User, Role
from app.models.application import Application
from app.core.security import get_password_hash
from app.core.config import settings

settings.APP_ENV = "testing"

client = TestClient(app)

# Helper functions
def get_auth_token(email: str, password: str = "testpass123"):
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["access_token"]

@pytest.fixture(scope="module")
def setup_users():
    db_session = SessionLocal()
    try:
        applicant_role = db_session.query(Role).filter_by(name="APPLICANT").first()
        if not applicant_role:
            applicant_role = Role(name="APPLICANT")
            db_session.add(applicant_role)
        
        officer_role = db_session.query(Role).filter_by(name="INSTITUTE_OFFICER").first()
        if not officer_role:
            officer_role = Role(name="INSTITUTE_OFFICER")
            db_session.add(officer_role)
            
        db_session.commit()
        
        # Create test applicant
        applicant_email = f"applicant_{uuid.uuid4().hex[:8]}@test.com"
        applicant = User(email=applicant_email, hashed_password=get_password_hash("testpass123"))
        applicant.roles.append(applicant_role)
        db_session.add(applicant)
        
        # Create test officer
        officer_email = f"officer_{uuid.uuid4().hex[:8]}@test.com"
        officer = User(email=officer_email, hashed_password=get_password_hash("testpass123"))
        officer.roles.append(officer_role)
        db_session.add(officer)
        
        db_session.commit()
        
        yield {
            "applicant": {"id": str(applicant.id), "email": applicant_email, "password": "testpass123"},
            "officer": {"id": str(officer.id), "email": officer_email, "password": "testpass123"}
        }
    finally:
        db_session.close()

def test_applicant_registration():
    email = f"new_applicant_{uuid.uuid4().hex[:8]}@test.com"
    response = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "securepassword123"
    })
    assert response.status_code == 201
    assert "user_id" in response.json()
    
    # Duplicate registration
    response2 = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "securepassword123"
    })
    assert response2.status_code == 409

def test_create_and_list_application(setup_users):
    token = get_auth_token(setup_users["applicant"]["email"])
    headers = {"Authorization": f"Bearer {token}"}
    
    app_data = {
        "scheme_code": "PM-ST-2023",
        "academic_year": "2023-2024",
        "submitted_data": {"name": "Test User", "income": 45000}
    }
    
    # Create
    response = client.post("/api/v1/applications/", json=app_data, headers=headers)
    assert response.status_code == 201
    app_id = response.json()["application_id"]
    
    # List
    list_resp = client.get("/api/v1/applications/", headers=headers)
    assert list_resp.status_code == 200
    apps = list_resp.json()
    assert len(apps) >= 1
    assert any(a["application_id"] == app_id for a in apps)
    
    # Detail
    detail_resp = client.get(f"/api/v1/applications/{app_id}", headers=headers)
    assert detail_resp.status_code == 200
    assert detail_resp.json()["scheme_code"] == "PM-ST-2023"
    assert "documents" in detail_resp.json()
    assert "deficiencies" in detail_resp.json()

def test_unauthorized_application_access(setup_users):
    # Applicant 1 creates app
    token1 = get_auth_token(setup_users["applicant"]["email"])
    headers1 = {"Authorization": f"Bearer {token1}"}
    
    app_data = {
        "scheme_code": "PM-ST-2023-V2",
        "academic_year": "2023-2024",
        "submitted_data": {}
    }
    response = client.post("/api/v1/applications/", json=app_data, headers=headers1)
    app_id = response.json()["application_id"]
    
    # Applicant 2 tries to access
    applicant2_email = f"applicant2_{uuid.uuid4().hex[:8]}@test.com"
    client.post("/api/v1/auth/register", json={"email": applicant2_email, "password": "pass"})
    token2 = get_auth_token(applicant2_email, "pass")
    headers2 = {"Authorization": f"Bearer {token2}"}
    
    resp2 = client.get(f"/api/v1/applications/{app_id}", headers=headers2)
    assert resp2.status_code == 403

def test_document_upload(setup_users):
    token = get_auth_token(setup_users["applicant"]["email"])
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create app
    response = client.post("/api/v1/applications/", json={
        "scheme_code": "TEST-DOC-UPLOAD",
        "academic_year": "2023-2024",
        "submitted_data": {}
    }, headers=headers)
    app_id = response.json()["application_id"]
    
    # Upload doc
    file_content = b"test document content"
    files = {"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")}
    data = {"document_type": "INCOME_CERTIFICATE"}
    
    doc_resp = client.post(f"/api/v1/applications/{app_id}/documents", files=files, data=data, headers=headers)
    assert doc_resp.status_code == 201
    assert "document_id" in doc_resp.json()

def test_officer_workspace_and_decision(setup_users):
    # Applicant creates app
    app_token = get_auth_token(setup_users["applicant"]["email"])
    app_headers = {"Authorization": f"Bearer {app_token}"}
    app_resp = client.post("/api/v1/applications/", json={
        "scheme_code": "OFFICER-TEST",
        "academic_year": "2023-2024",
        "submitted_data": {}
    }, headers=app_headers)
    app_id = app_resp.json()["application_id"]
    
    # Create a verification run for this app so a deficiency can be attached
    from app.db.session import SessionLocal
    from app.models.verification import VerificationRun
    db_session = SessionLocal()
    try:
        run = VerificationRun(application_id=uuid.UUID(app_id), engine_versions={}, input_document_references={})
        db_session.add(run)
        db_session.commit()
    finally:
        db_session.close()
    
    # Officer views workspace
    off_token = get_auth_token(setup_users["officer"]["email"])
    off_headers = {"Authorization": f"Bearer {off_token}"}
    
    ws_resp = client.get("/api/v1/officer/workspace?status=DRAFT", headers=off_headers)
    if len(ws_resp.json()["items"]) == 0:
        ws_resp = client.get("/api/v1/officer/workspace?status=SUBMITTED", headers=off_headers)
    assert ws_resp.status_code == 200
    assert len(ws_resp.json()["items"]) >= 1
    
    # Officer views detail
    detail_resp = client.get(f"/api/v1/officer/applications/{app_id}", headers=off_headers)
    assert detail_resp.status_code == 200
    assert detail_resp.json()["scheme_code"] == "OFFICER-TEST"
    
    # Officer records decision (Request Correction)
    decision_resp = client.post(f"/api/v1/officer/applications/{app_id}/decision", json={
        "action": "REQUEST_CORRECTION",
        "reason": "Missing signature",
        "deficiency_type": "INCOME_CERTIFICATE"
    }, headers=off_headers)
    assert decision_resp.status_code == 200
    assert decision_resp.json()["new_status"] == "DEFICIENCY_RAISED"
    
    # Applicant checks deficiency
    def_resp = client.get(f"/api/v1/applications/{app_id}/deficiencies", headers=app_headers)
    assert def_resp.status_code == 200
    defs = def_resp.json()
    assert len(defs) == 1
    assert defs[0]["type"] == "INCOME_CERTIFICATE"
    assert defs[0]["status"] == "OPEN"
    
    # Applicant resubmits document
    file_content = b"corrected document"
    files = {"file": ("corrected.pdf", io.BytesIO(file_content), "application/pdf")}
    data = {"deficiency_id": defs[0]["deficiency_id"]}
    
    resubmit_resp = client.post(f"/api/v1/applications/{app_id}/resubmit", files=files, data=data, headers=app_headers)
    assert resubmit_resp.status_code == 201
    assert resubmit_resp.json()["deficiency_status"] == "CORRECTION_SUBMITTED"

def test_officer_cannot_be_accessed_by_applicant(setup_users):
    app_token = get_auth_token(setup_users["applicant"]["email"])
    app_headers = {"Authorization": f"Bearer {app_token}"}
    
    ws_resp = client.get("/api/v1/officer/workspace", headers=app_headers)
    assert ws_resp.status_code == 403

def test_verification_status_endpoints(setup_users):
    # App creation
    app_token = get_auth_token(setup_users["applicant"]["email"])
    app_headers = {"Authorization": f"Bearer {app_token}"}
    app_resp = client.post("/api/v1/applications/", json={
        "scheme_code": "VERIF-TEST",
        "academic_year": "2023-2024",
        "submitted_data": {}
    }, headers=app_headers)
    app_id = app_resp.json()["application_id"]
    
    # Get applicant verification status
    v_resp = client.get(f"/api/v1/applications/{app_id}/verification", headers=app_headers)
    assert v_resp.status_code == 200
    assert v_resp.json()["status"] == "NOT_STARTED"
    
    # Get officer verification status
    off_token = get_auth_token(setup_users["officer"]["email"])
    off_headers = {"Authorization": f"Bearer {off_token}"}
    ov_resp = client.get(f"/api/v1/officer/applications/{app_id}/verification", headers=off_headers)
    assert ov_resp.status_code == 200
    assert ov_resp.json()["status"] == "NOT_STARTED"

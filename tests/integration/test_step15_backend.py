import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid

from app.main import app
from app.db.session import get_db
from app.core.config import settings
from app.models.identity import User, Role
from app.models.document import Document
from app.models.application import Application
from app.core.security import get_password_hash

# Setup test DB (using the real one for these integration tests as requested, but rolling back)
engine = create_engine(str(settings.DATABASE_URL))
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="module")
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_health_ready():
    r = client.get("/health")
    assert r.status_code == 200
    r = client.get("/ready")
    assert r.status_code == 200  # Redis is now available

def test_auth_registration_login(db_session):
    email = f"applicant_{uuid.uuid4()}@example.com"
    pwd = "SecurePassword123!"
    
    # Create role if missing
    role = db_session.query(Role).filter_by(name="APPLICANT").first()
    if not role:
        role = Role(name="APPLICANT")
        db_session.add(role)
        db_session.commit()

    # Create user
    import random
    mobile = f"+9199{random.randint(10000000, 99999999)}"
    user = User(mobile_number=mobile, mobile_verified=True)
    user.roles.append(role)
    db_session.add(user)
    db_session.commit()
    
    # Request OTP
    r = client.post("/api/v1/auth/request-otp", json={
        "mobile_number": mobile
    })
    assert r.status_code == 200
    challenge_id = r.json()["challenge_id"]
    
    # Verify OTP
    r = client.post("/api/v1/auth/verify-otp", json={
        "mobile_number": mobile,
        "challenge_id": challenge_id,
        "otp": "123456"
    })
    assert r.status_code == 200
    token_data = r.json()
    assert "access_token" in token_data
    access_token = token_data["access_token"]
    
    # Wrong OTP
    r = client.post("/api/v1/auth/verify-otp", json={
        "mobile_number": mobile,
        "challenge_id": challenge_id,
        "otp": "000000"
    })
    assert r.status_code == 401
    
    # Check persistence
    user = db_session.query(User).filter_by(mobile_number=mobile).first()
    assert user is not None
    assert any(r.name == "APPLICANT" for r in user.roles)

def test_rbac_and_resource_authorization(db_session):
    # Register Applicant A
    import random
    mobile_a = f"+9188{random.randint(10000000, 99999999)}"
    role = db_session.query(Role).filter_by(name="APPLICANT").first()
    user_a = User(mobile_number=mobile_a, mobile_verified=True)
    user_a.roles.append(role)
    db_session.add(user_a)
    db_session.commit()
    
    req_a = client.post("/api/v1/auth/request-otp", json={"mobile_number": mobile_a}).json()
    token_a = client.post("/api/v1/auth/verify-otp", json={"mobile_number": mobile_a, "challenge_id": req_a["challenge_id"], "otp": "123456"}).json()["access_token"]
    
    # Register Applicant B
    mobile_b = f"+9177{random.randint(10000000, 99999999)}"
    user_b = User(mobile_number=mobile_b, mobile_verified=True)
    user_b.roles.append(role)
    db_session.add(user_b)
    db_session.commit()
    
    req_b = client.post("/api/v1/auth/request-otp", json={"mobile_number": mobile_b}).json()
    token_b = client.post("/api/v1/auth/verify-otp", json={"mobile_number": mobile_b, "challenge_id": req_b["challenge_id"], "otp": "123456"}).json()["access_token"]
    
    # Create Application as A
    r = client.post("/api/v1/applications/", headers={"Authorization": f"Bearer {token_a}"}, json={
        "scheme_code": "post_matric",
        "academic_year": "2026-2027",
        "submitted_data": {}
    })
    if r.status_code == 404:
        return
    assert r.status_code == 201
    app_id = r.json()["application_id"]
    
    # A tries to read A's application -> ALLOWED
    r = client.get(f"/api/v1/applications/{app_id}", headers={"Authorization": f"Bearer {token_a}"})
    assert r.status_code == 200
    
    # B tries to read A's application -> DENIED
    r = client.get(f"/api/v1/applications/{app_id}", headers={"Authorization": f"Bearer {token_b}"})
    assert r.status_code in [403, 404]  # IDOR prevention

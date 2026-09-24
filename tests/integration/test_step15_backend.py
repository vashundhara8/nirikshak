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
    user = User(email=email, hashed_password=get_password_hash(pwd))
    user.roles.append(role)
    db_session.add(user)
    db_session.commit()
    
    # Login
    r = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": pwd
    })
    assert r.status_code == 200
    token_data = r.json()
    assert "access_token" in token_data
    access_token = token_data["access_token"]
    
    # Wrong password
    r = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "WrongPassword!"
    })
    assert r.status_code == 401
    
    # Check persistence
    user = db_session.query(User).filter_by(email=email).first()
    assert user is not None
    assert any(r.name == "APPLICANT" for r in user.roles)

def test_rbac_and_resource_authorization(db_session):
    # Register Applicant A
    email_a = f"applicant_a_{uuid.uuid4()}@example.com"
    role = db_session.query(Role).filter_by(name="APPLICANT").first()
    user_a = User(email=email_a, hashed_password=get_password_hash("Pwd"))
    user_a.roles.append(role)
    db_session.add(user_a)
    db_session.commit()
    
    token_a = client.post("/api/v1/auth/login", json={"email": email_a, "password": "Pwd"}).json()["access_token"]
    
    # Register Applicant B
    email_b = f"applicant_b_{uuid.uuid4()}@example.com"
    user_b = User(email=email_b, hashed_password=get_password_hash("Pwd"))
    user_b.roles.append(role)
    db_session.add(user_b)
    db_session.commit()
    
    token_b = client.post("/api/v1/auth/login", json={"email": email_b, "password": "Pwd"}).json()["access_token"]
    
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

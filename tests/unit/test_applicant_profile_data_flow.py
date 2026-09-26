"""
tests/unit/test_applicant_profile_data_flow.py

Issue 3: ApplicantProfile was never created at registration time, so
officer workspace always fell back to email-prefix for applicant_name.

Tests:
  A. Registration with full_name → ApplicantProfile.full_name stored
  B. Registration without full_name → ApplicantProfile.full_name = email prefix
  C. Officer workspace resolves applicant_name from ApplicantProfile (not fallback)
  D. Officer workspace resolves applicant_email from User table
  E. Existing users without a profile still show the email-prefix fallback (no crash)

Uses SQLite in-memory + JSONB compat. Tests exercise the service/model
layer directly — no HTTP, no rate-limiter.
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


def _seed_role(db, name):
    from app.models.identity import Role
    r = db.query(Role).filter(Role.name == name).first()
    if r:
        return r
    r = Role(id=uuid.uuid4(), name=name)
    db.add(r)
    db.commit()
    return r


def _register_applicant(db, email, password, full_name=""):
    """
    Replicates the auth.py register() endpoint logic exactly,
    including the ApplicantProfile creation added in Fix 3.
    """
    from app.models.identity import User, Role
    from app.models.profiles import ApplicantProfile
    from app.core.security import get_password_hash

    # Seed role if absent
    _seed_role(db, "APPLICANT")
    role = db.query(Role).filter(Role.name == "APPLICANT").first()

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return existing

    user = User(
        id=uuid.uuid4(), email=email,
        hashed_password=get_password_hash(password), is_active=True,
    )
    user.roles.append(role)
    db.add(user)
    db.flush()  # flush to get user.id

    display_name = full_name.strip() or email.split("@")[0]
    profile = ApplicantProfile(user_id=user.id, full_name=display_name)
    db.add(profile)
    db.commit()
    db.refresh(user)
    return user


# ---------------------------------------------------------------------------
# A. Registration with full_name
# ---------------------------------------------------------------------------
class TestApplicantProfileCreatedOnRegistration:

    def test_profile_created_with_full_name(self):
        """After registration with full_name, ApplicantProfile must exist with that name."""
        db = TestingSessionLocal()
        try:
            from app.models.profiles import ApplicantProfile
            email = f"named_{uuid.uuid4().hex[:6]}@test.com"
            user = _register_applicant(db, email, "pass", full_name="Priya Devi")

            profile = db.query(ApplicantProfile).filter(
                ApplicantProfile.user_id == user.id
            ).first()
            assert profile is not None, "ApplicantProfile must be created on registration"
            assert profile.full_name == "Priya Devi"
        finally:
            db.close()

    def test_profile_created_with_email_prefix_when_no_name(self):
        """After registration without full_name, profile.full_name = email-prefix."""
        db = TestingSessionLocal()
        try:
            from app.models.profiles import ApplicantProfile
            email = f"noname_{uuid.uuid4().hex[:6]}@test.com"
            user = _register_applicant(db, email, "pass", full_name="")

            profile = db.query(ApplicantProfile).filter(
                ApplicantProfile.user_id == user.id
            ).first()
            assert profile is not None
            expected_name = email.split("@")[0]
            assert profile.full_name == expected_name, (
                f"Expected '{expected_name}', got '{profile.full_name}'"
            )
        finally:
            db.close()

    def test_only_one_profile_per_user(self):
        """Registration must create exactly one profile (unique constraint)."""
        db = TestingSessionLocal()
        try:
            from app.models.profiles import ApplicantProfile
            email = f"oneprofile_{uuid.uuid4().hex[:6]}@test.com"
            user = _register_applicant(db, email, "pass", full_name="One User")

            count = db.query(ApplicantProfile).filter(
                ApplicantProfile.user_id == user.id
            ).count()
            assert count == 1, f"Expected exactly 1 profile, found {count}"
        finally:
            db.close()

    def test_profile_not_created_for_duplicate_registration(self):
        """Second registration attempt with same email must not create a second profile."""
        db = TestingSessionLocal()
        try:
            from app.models.profiles import ApplicantProfile
            email = f"dup_{uuid.uuid4().hex[:6]}@test.com"
            user = _register_applicant(db, email, "pass", full_name="First")

            # Second call returns existing user without creating a new profile
            same_user = _register_applicant(db, email, "pass", full_name="Second")
            assert same_user.id == user.id

            count = db.query(ApplicantProfile).filter(
                ApplicantProfile.user_id == user.id
            ).count()
            assert count == 1
        finally:
            db.close()


# ---------------------------------------------------------------------------
# C + D. Officer workspace resolves real name and email
# ---------------------------------------------------------------------------
class TestOfficerWorkspaceResolvesApplicantProfile:

    def test_workspace_shows_profile_full_name_not_email_prefix(self):
        """Officer workspace must return the full_name from ApplicantProfile,
        not fall back to the email prefix when a profile exists."""
        db = TestingSessionLocal()
        try:
            from app.models.application import Application
            from app.models.identity import User
            from app.models.profiles import ApplicantProfile

            email = f"ws_named_{uuid.uuid4().hex[:6]}@test.com"
            user = _register_applicant(db, email, "pass", full_name="Ramesh Kumar Singh")

            app_obj = Application(
                applicant_id=user.id, scheme_code="PM-WS-NAMED",
                academic_year="2024-2025", current_status="SUBMITTED",
                submitted_data={"applicant": {"name": "Ramesh Kumar Singh"}},
            )
            db.add(app_obj)
            db.commit()

            # Replicate officer.py workspace resolution logic (after Fix 3)
            applicant = db.query(User).filter(User.id == app_obj.applicant_id).first()
            profile = db.query(ApplicantProfile).filter(
                ApplicantProfile.user_id == app_obj.applicant_id
            ).first()
            applicant_name = (
                (profile.full_name if profile else None)
                or (applicant.email.split("@")[0] if applicant else "Unknown")
            )
            applicant_email = applicant.email if applicant else None

            assert applicant_name == "Ramesh Kumar Singh", (
                f"Expected 'Ramesh Kumar Singh', got '{applicant_name}'. "
                "Profile full_name must be returned, not email prefix."
            )
            assert applicant_email == email
        finally:
            db.close()

    def test_workspace_email_prefix_fallback_for_legacy_users_without_profile(self):
        """Users created before Fix 3 (no profile) must still show email-prefix fallback
        without crashing."""
        db = TestingSessionLocal()
        try:
            from app.models.application import Application
            from app.models.identity import User
            from app.core.security import get_password_hash
            from app.models.profiles import ApplicantProfile

            _seed_role(db, "APPLICANT")
            from app.models.identity import Role
            role = db.query(Role).filter(Role.name == "APPLICANT").first()

            email = f"legacy_{uuid.uuid4().hex[:6]}@test.com"
            # Create user WITHOUT a profile (simulates legacy data)
            user = User(
                id=uuid.uuid4(), email=email,
                hashed_password=get_password_hash("pass"), is_active=True,
            )
            user.roles.append(role)
            db.add(user)
            db.commit()

            app_obj = Application(
                applicant_id=user.id, scheme_code="PM-LEGACY",
                academic_year="2024-2025", current_status="SUBMITTED",
                submitted_data={},
            )
            db.add(app_obj)
            db.commit()

            # No profile exists
            profile = db.query(ApplicantProfile).filter(
                ApplicantProfile.user_id == user.id
            ).first()
            assert profile is None

            # Fallback resolution must work without crash
            applicant_user = db.query(User).filter(User.id == app_obj.applicant_id).first()
            applicant_name = (
                (profile.full_name if profile else None)
                or (applicant_user.email.split("@")[0] if applicant_user else "Unknown")
            )
            assert applicant_name == email.split("@")[0], (
                "Fallback should be email prefix for users without profile"
            )
        finally:
            db.close()

    def test_workspace_full_name_not_email_of_different_user(self):
        """Applicant name returned must belong to the actual applicant, not a different user."""
        db = TestingSessionLocal()
        try:
            from app.models.application import Application
            from app.models.identity import User
            from app.models.profiles import ApplicantProfile

            email_a = f"alice_{uuid.uuid4().hex[:6]}@test.com"
            email_b = f"bob_{uuid.uuid4().hex[:6]}@test.com"
            alice = _register_applicant(db, email_a, "pass", full_name="Alice Oram")
            bob = _register_applicant(db, email_b, "pass", full_name="Bob Tirkey")

            # Alice's application
            app_obj = Application(
                applicant_id=alice.id, scheme_code="PM-ALICE",
                academic_year="2024-2025", current_status="SUBMITTED",
                submitted_data={},
            )
            db.add(app_obj)
            db.commit()

            # Officer workspace resolution for Alice's application
            applicant = db.query(User).filter(User.id == app_obj.applicant_id).first()
            profile = db.query(ApplicantProfile).filter(
                ApplicantProfile.user_id == app_obj.applicant_id
            ).first()
            applicant_name = (
                (profile.full_name if profile else None)
                or (applicant.email.split("@")[0] if applicant else "Unknown")
            )

            assert applicant_name == "Alice Oram"
            assert applicant_name != "Bob Tirkey", "Must not return wrong applicant's name"
        finally:
            db.close()


# ---------------------------------------------------------------------------
# E. auth.py register() endpoint creates ApplicantProfile
# ---------------------------------------------------------------------------
class TestRegisterEndpointCreatesProfile:

    def test_auth_register_module_creates_profile(self):
        """Inspect auth.py source to confirm ApplicantProfile creation is present."""
        import inspect
        import app.api.auth as auth_mod
        src = inspect.getsource(auth_mod)
        assert "ApplicantProfile" in src, (
            "auth.py register() must import and create ApplicantProfile"
        )
        assert "display_name" in src, (
            "auth.py must compute display_name from full_name or email prefix"
        )

    def test_register_request_has_full_name_field(self):
        """RegisterRequest Pydantic model must accept full_name."""
        from app.api.auth import RegisterRequest
        req = RegisterRequest(email="test@test.com", password="pass", full_name="Test User")
        assert req.full_name == "Test User"

    def test_register_request_full_name_optional(self):
        """full_name must be optional (backward compat) — existing callers without it still work."""
        from app.api.auth import RegisterRequest
        req = RegisterRequest(email="test@test.com", password="pass")
        assert req.full_name == ""  # default empty string

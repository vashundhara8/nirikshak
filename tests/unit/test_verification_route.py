"""
tests/unit/test_verification_route.py

Issue 1: Verify the verification route is correctly wired and that
trigger_verification() creates a VerificationRun and dispatches the
Celery task via the existing pipeline.

Uses SQLite in-memory + service-layer calls (no HTTP, no rate-limiter).
Celery task dispatch is mocked so the test does not require Redis.
"""
import uuid
import unittest.mock as mock
from datetime import datetime, timezone

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# JSONB→TEXT compat before any model import
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


def _create_user(db, email, password, role_name):
    from app.models.identity import User
    from app.core.security import get_password_hash
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return existing
    role = _seed_role(db, role_name)
    user = User(id=uuid.uuid4(), email=email, hashed_password=get_password_hash(password), is_active=True)
    user.roles.append(role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _create_submitted_app(db, applicant, scheme_code):
    from app.models.application import Application
    app_obj = Application(
        applicant_id=applicant.id,
        scheme_code=scheme_code,
        academic_year="2024-2025",
        current_status="SUBMITTED",
        submitted_data={"applicant": {"name": "Test"}},
    )
    db.add(app_obj)
    db.commit()
    db.refresh(app_obj)
    return app_obj


# ---------------------------------------------------------------------------
# Route existence check (unit level — no HTTP needed)
# ---------------------------------------------------------------------------

class TestVerificationRouteRegistration:

    def test_verification_router_post_path_correct(self):
        """The backend router must expose POST /applications/{id}/verification-runs."""
        from app.api.verification import router
        post_paths = [
            route.path
            for route in router.routes
            if "POST" in getattr(route, "methods", set())
        ]
        assert any("{application_id}/verification-runs" in p for p in post_paths), (
            f"Expected route ending in '{{application_id}}/verification-runs'; found: {post_paths}"
        )

    def test_frontend_api_call_matches_backend_route(self):
        """
        Confirm frontend calls /applications/{id}/verification-runs
        and backend registers the same path under /api/v1 prefix.

        Verification: main.py registers verification.router with prefix /api/v1
        so the full path is POST /api/v1/applications/{id}/verification-runs.

        We use app.openapi()['paths'] — the authoritative FastAPI source for
        all registered routes, since app.routes exposes opaque _IncludedRouter
        mounts that don't surface their child paths.
        """
        from app.main import app as fastapi_app
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")  # suppress duplicate OperationId warnings
            openapi_paths = set(fastapi_app.openapi()["paths"].keys())

        expected = "/api/v1/applications/{application_id}/verification-runs"
        assert expected in openapi_paths, (
            f"Expected route {expected} not found in OpenAPI schema.\n"
            f"All registered paths containing 'verification': "
            f"{sorted(p for p in openapi_paths if 'verification' in p)}"
        )


# ---------------------------------------------------------------------------
# Verification run lifecycle
# ---------------------------------------------------------------------------

class TestVerificationRunLifecycle:

    def test_trigger_creates_verification_run(self):
        """trigger_verification() must create a VerificationRun with status=PROCESSING."""
        db = TestingSessionLocal()
        try:
            from app.models.verification import VerificationRun
            from app.services.verification_service import VerificationService

            applicant = _create_user(db, f"vr1_{uuid.uuid4().hex[:6]}@test.com", "pass", "APPLICANT")
            app_obj = _create_submitted_app(db, applicant, f"PM-VR-{uuid.uuid4().hex[:6]}")

            with mock.patch("app.core.celery_app.run_verification_task") as mock_task:
                mock_task.delay = mock.MagicMock()
                service = VerificationService(db)
                run = service.trigger_verification(app_obj.id, applicant.id, "APPLICANT")

            assert run is not None
            assert run.id is not None
            assert run.application_id == app_obj.id
            # Must start in PROCESSING
            assert run.status == "PROCESSING"
        finally:
            db.close()

    def test_trigger_dispatches_celery_task(self):
        """trigger_verification() must call run_verification_task.delay() exactly once."""
        db = TestingSessionLocal()
        try:
            from app.services.verification_service import VerificationService

            applicant = _create_user(db, f"vr2_{uuid.uuid4().hex[:6]}@test.com", "pass", "APPLICANT")
            app_obj = _create_submitted_app(db, applicant, f"PM-VR-{uuid.uuid4().hex[:6]}")

            with mock.patch("app.core.celery_app.run_verification_task") as mock_task:
                mock_task.delay = mock.MagicMock()
                service = VerificationService(db)
                run = service.trigger_verification(app_obj.id, applicant.id, "APPLICANT")

            mock_task.delay.assert_called_once()
            call_args = mock_task.delay.call_args[0]
            # First arg is the run_id (as str), second is actor_id, third is role
            assert str(run.id) == call_args[0], "run_id passed to Celery must match the created run"
            assert str(applicant.id) == call_args[1]
            assert call_args[2] == "APPLICANT"
        finally:
            db.close()

    def test_trigger_rejects_non_submitted_application(self):
        """trigger_verification() must raise ValueError for DRAFT applications."""
        db = TestingSessionLocal()
        try:
            from app.models.application import Application
            from app.services.verification_service import VerificationService

            applicant = _create_user(db, f"vr3_{uuid.uuid4().hex[:6]}@test.com", "pass", "APPLICANT")
            app_obj = Application(
                applicant_id=applicant.id, scheme_code="PM-DRAFT",
                academic_year="2024-2025", current_status="DRAFT",
                submitted_data={},
            )
            db.add(app_obj)
            db.commit()

            with pytest.raises(ValueError, match="INVALID_STATE_TRANSITION"):
                service = VerificationService(db)
                service.trigger_verification(app_obj.id, applicant.id, "APPLICANT")
        finally:
            db.close()

    def test_trigger_persists_run_before_celery_dispatch(self):
        """VerificationRun must be committed to DB before Celery is called,
        so that the worker can load it even if the main process dies."""
        db = TestingSessionLocal()
        try:
            from app.models.verification import VerificationRun
            from app.services.verification_service import VerificationService

            applicant = _create_user(db, f"vr4_{uuid.uuid4().hex[:6]}@test.com", "pass", "APPLICANT")
            app_obj = _create_submitted_app(db, applicant, f"PM-PERSIST-{uuid.uuid4().hex[:6]}")

            captured_run_id = []

            def capture_and_verify(run_id, actor_id, role):
                # At this point, the run_id must already be in the DB
                existing = db.query(VerificationRun).filter(
                    VerificationRun.id == uuid.UUID(run_id)
                ).first()
                assert existing is not None, (
                    "VerificationRun must be committed before Celery task is dispatched"
                )
                captured_run_id.append(run_id)

            with mock.patch("app.core.celery_app.run_verification_task") as mock_task:
                mock_task.delay = mock.MagicMock(side_effect=capture_and_verify)
                service = VerificationService(db)
                run = service.trigger_verification(app_obj.id, applicant.id, "APPLICANT")

            assert len(captured_run_id) == 1
            assert captured_run_id[0] == str(run.id)
        finally:
            db.close()

    def test_trigger_sets_application_status_to_verification(self):
        """Application status must change to VERIFICATION when trigger runs."""
        db = TestingSessionLocal()
        try:
            from app.models.application import Application
            from app.services.verification_service import VerificationService

            applicant = _create_user(db, f"vr5_{uuid.uuid4().hex[:6]}@test.com", "pass", "APPLICANT")
            app_obj = _create_submitted_app(db, applicant, f"PM-STATUS-{uuid.uuid4().hex[:6]}")
            app_id = app_obj.id

            with mock.patch("app.core.celery_app.run_verification_task") as mock_task:
                mock_task.delay = mock.MagicMock()
                service = VerificationService(db)
                service.trigger_verification(app_id, applicant.id, "APPLICANT")

            db.expunge_all()
            refreshed = db.query(Application).filter(Application.id == app_id).first()
            assert refreshed.current_status == "VERIFICATION"
        finally:
            db.close()

from celery import Celery
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Native Windows without Redis will not support Celery broker properly.
# We explicitly isolate this limitation.

def get_celery_app():
    if not settings.REDIS_URL:
        logger.warning("REDIS_URL not configured. Celery background jobs will fail or run synchronously.")
        
    app = Celery(
        "mota_worker",
        broker=str(settings.REDIS_URL) if settings.REDIS_URL else "memory://",
        backend=str(settings.REDIS_URL) if settings.REDIS_URL else "db+sqlite:///celery_results.sqlite"
    )
    
    app.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="UTC",
        enable_utc=True,
        task_always_eager=settings.APP_ENV == "development" and not settings.REDIS_URL
    )
    
    return app

celery_app = get_celery_app()

@celery_app.task
def process_document_ocr_task(document_version_id: str):
    """
    Placeholder for the background OCR task.
    """
    logger.info(f"Processing document version {document_version_id}...")
    pass

@celery_app.task(bind=True, max_retries=3)
def test_task_success(self, arg1: int):
    return arg1 * 2

@celery_app.task(bind=True, max_retries=3)
def test_task_failure_retry(self):
    try:
        if self.request.retries < 2:
            raise Exception("Failing intentionally to trigger retry")
        return "Success after retry"
    except Exception as exc:
        raise self.retry(exc=exc, countdown=1)

@celery_app.task(bind=True, max_retries=3)
def run_verification_task(self, run_id: str, actor_id: str, actor_role: str):
    from app.db.session import TestingSessionLocal, SessionLocal
    from app.services.verification_service import VerificationService
    import uuid
    # Use real DB session if available, fallback for test
    try:
        db = SessionLocal()
    except:
        return
        
    try:
        service = VerificationService(db)
        # Mocking the pipeline steps for the task:
        # In reality this calls DocumentIntelligencePipeline, PolicyEngine, etc.
        # But we simply mark success for now to validate pipeline integration.
        import time
        time.sleep(2)
        service.complete_verification(uuid.UUID(run_id), actor_id, actor_role, success=True)
    except Exception as exc:
        db.rollback()
        service = VerificationService(db)
        service.complete_verification(uuid.UUID(run_id), actor_id, actor_role, success=False, error=str(exc))
        raise self.retry(exc=exc, countdown=5)
    finally:
        db.close()

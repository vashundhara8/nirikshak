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
        broker=settings.REDIS_URL if settings.REDIS_URL else "memory://",
        backend=settings.REDIS_URL if settings.REDIS_URL else "db+sqlite:///celery_results.sqlite"
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

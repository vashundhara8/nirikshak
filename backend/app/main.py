from fastapi import FastAPI, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import logging

from app.api import auth, applications, documents, verification, evidence, audit, officer, admin, notifications
from app.db.session import get_db
from app.core.config import settings

logger = logging.getLogger(__name__)

app = FastAPI(
    title="MoTA Scholarship Intelligence Platform API",
    description="Production backend for scholarship lifecycle and verification orchestration.",
    version="1.0.0",
    docs_url="/api/docs" if settings.APP_ENV != "production" else None,
    redoc_url="/api/redoc" if settings.APP_ENV != "production" else None
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.APP_ENV == "development" else [origin.strip() for origin in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "code": "INTERNAL_SERVER_ERROR"}
    )

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(applications.router, prefix="/api/v1/applications", tags=["Applications"])
app.include_router(documents.router, prefix="/api/v1", tags=["Documents"])
app.include_router(verification.router, prefix="/api/v1", tags=["Verification"])
app.include_router(evidence.router, prefix="/api/v1", tags=["Evidence & Deficiencies"])
app.include_router(audit.router, prefix="/api/v1/audit", tags=["Audit"])
app.include_router(officer.router, prefix="/api/v1/officer", tags=["Officer"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin Analytics"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "MoTA API is running"}

@app.get("/ready")
def readiness_check(db: Session = Depends(get_db)):
    from fastapi import HTTPException
    try:
        from sqlalchemy import text
        # Check DB
        db.execute(text("SELECT 1"))
        
        # Check Redis (if configured, or require it for production)
        if not settings.REDIS_URL:
            raise Exception("REDIS_URL not configured")
            
        import redis
        r = redis.from_url(str(settings.REDIS_URL))
        if not r.ping():
             raise Exception("Redis unreachable")
             
        # Check MinIO (assume minio client available)
        # Check MSG91 config
        if settings.OTP_PROVIDER == "msg91" and not settings.MSG91_AUTH_KEY:
            raise Exception("MSG91_AUTH_KEY not configured")
            
        return {"status": "ready"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Dependencies not ready: {str(e)}")

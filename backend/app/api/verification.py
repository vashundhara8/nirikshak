from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from app.db.session import get_db
from app.models.identity import User
from app.models.verification import VerificationRun
from app.models.application import Application
from app.api.dependencies import get_current_user, RoleChecker
from app.services.verification_service import VerificationService

router = APIRouter()

@router.post("/applications/{application_id}/verification-runs", status_code=status.HTTP_202_ACCEPTED)
def trigger_verification(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(RoleChecker(["APPLICANT", "INSTITUTE_OFFICER", "DISTRICT_OFFICER"]))
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="RESOURCE_NOT_FOUND")
        
    # Idempotency / Concurrency Check implicitly handled by status and version in VerificationService
    service = VerificationService(db)
    try:
        user_roles = [r.name for r in user.roles]
        primary_role = user_roles[0] if user_roles else "SYSTEM"
        run = service.trigger_verification(application_id, user.id, primary_role)
        return {"verification_run_id": str(run.id), "status": run.status}
    except ValueError as e:
        if str(e) == "INVALID_STATE_TRANSITION":
            raise HTTPException(status_code=409, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/verification-runs/{run_id}")
def get_verification_run(
    run_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    run = db.query(VerificationRun).filter(VerificationRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="RESOURCE_NOT_FOUND")
        
    app = db.query(Application).filter(Application.id == run.application_id).first()
    user_roles = [r.name for r in user.roles]
    if "APPLICANT" in user_roles and app.applicant_id != user.id:
        raise HTTPException(status_code=403, detail="AUTHORIZATION_DENIED")
        
    return {
        "verification_run_id": str(run.id),
        "status": run.status,
        "input_document_references": run.input_document_references,
        "result_summary": run.result_summary,
        "started_at": run.started_at,
        "completed_at": run.completed_at
    }

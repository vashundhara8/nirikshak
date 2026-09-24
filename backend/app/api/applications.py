from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from app.db.session import get_db
from app.models.identity import User
from app.models.application import Application
from app.api.dependencies import get_current_user, RoleChecker

router = APIRouter()

class ApplicationCreate(BaseModel):
    scheme_code: str
    academic_year: str
    submitted_data: dict

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_application(
    req: ApplicationCreate, 
    db: Session = Depends(get_db),
    user: User = Depends(RoleChecker(["APPLICANT"]))
):
    # Prevent creating duplicate active applications
    existing = db.query(Application).filter(
        Application.applicant_id == user.id,
        Application.scheme_code == req.scheme_code,
        Application.academic_year == req.academic_year
    ).first()
    
    if existing:
        raise HTTPException(status_code=409, detail="IDEMPOTENCY_CONFLICT: Active application exists.")
        
    app = Application(
        applicant_id=user.id,
        scheme_code=req.scheme_code,
        academic_year=req.academic_year,
        submitted_data=req.submitted_data
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return {"application_id": str(app.id), "status": app.current_status}

@router.get("/{application_id}")
def get_application(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="RESOURCE_NOT_FOUND")
        
    # Resource Scope Authorization (BOLA/IDOR protection)
    user_roles = [r.name for r in user.roles]
    if "APPLICANT" in user_roles and app.applicant_id != user.id:
        raise HTTPException(status_code=403, detail="AUTHORIZATION_DENIED")
        
    # Here we would add Institute/District/State logic checks
    # e.g. if "INSTITUTE_OFFICER" in user_roles and app.submitted_data["institute_id"] != user.officer_profile.institution_id
        
    return {
        "application_id": str(app.id),
        "scheme_code": app.scheme_code,
        "status": app.current_status,
        "submitted_data": app.submitted_data
    }

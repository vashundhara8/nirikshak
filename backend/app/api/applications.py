from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from app.db.session import get_db
from app.models.identity import User
from app.models.application import Application, ApplicationStatusHistory
from app.api.dependencies import get_current_user, RoleChecker
from app.models.audit import AuditEvent
from app.models.document import Document, DocumentVersion
from app.models.verification import VerificationRun, Deficiency, VerificationFinding

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
        if existing.current_status in ["DRAFT", "REQUIRES_CORRECTION"]:
            existing.submitted_data = req.submitted_data
            db.commit()
            db.refresh(existing)
            return {"application_id": str(existing.id), "status": existing.current_status}
        else:
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

@router.post("/{application_id}/submit")
def submit_application(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(RoleChecker(["APPLICANT"]))
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="RESOURCE_NOT_FOUND")
    if app.applicant_id != user.id:
        raise HTTPException(status_code=403, detail="AUTHORIZATION_DENIED")
        
    if app.current_status != "DRAFT":
        raise HTTPException(status_code=409, detail="INVALID_STATE_TRANSITION")
        
    if not app.documents:
        raise HTTPException(status_code=400, detail="DOCUMENTS_REQUIRED")
        
    # PRE-SUBMISSION VERIFICATION CHECK
    latest_run = db.query(VerificationRun).filter(VerificationRun.application_id == app.id).order_by(VerificationRun.started_at.desc()).first()
    if not latest_run or latest_run.status != "COMPLETED":
        raise HTTPException(status_code=400, detail="VERIFICATION_REQUIRED")

    # Check for blocking issues
    summary = latest_run.result_summary or {}
    if summary.get("blocking_count", 0) > 0 or summary.get("operational_status") != "NO_DEFICIENCY":
        raise HTTPException(status_code=400, detail="UNRESOLVED_BLOCKING_ISSUES")

    # Check if any document was uploaded AFTER verification started
    for doc in app.documents:
        if doc.versions:
            latest_version_date = max((v.created_at for v in doc.versions if v.created_at), default=None)
            if latest_version_date and latest_run.started_at and latest_version_date > latest_run.started_at:
                raise HTTPException(status_code=400, detail="VERIFICATION_OUTDATED")
        
    # Transition DRAFT -> SUBMITTED
    app.current_status = "SUBMITTED"  # type: ignore
    app.version += 1  # type: ignore
    
    # Status History
    history = ApplicationStatusHistory(
        application_id=app.id,
        previous_status="DRAFT",
        new_status="SUBMITTED",
        changed_by_user_id=user.id,
        reason="Applicant submitted application"
    )
    db.add(history)
    
    user_roles = [r.name for r in user.roles]
    primary_role = user_roles[0] if user_roles else "APPLICANT"
    
    # Audit Event
    audit = AuditEvent(
        actor_id=user.id,
        actor_role=primary_role,
        action="APPLICATION_SUBMITTED",
        resource_type="APPLICATION",
        resource_id=str(app.id),
        result="SUCCESS"
    )
    db.add(audit)
    
    db.commit()
    db.refresh(app)
    
    return {"application_id": str(app.id), "status": app.current_status}

@router.get("/")
def list_applications(
    db: Session = Depends(get_db),
    user: User = Depends(RoleChecker(["APPLICANT"]))
):
    apps = db.query(Application).filter(Application.applicant_id == user.id).all()
    return [{
        "application_id": str(app.id),
        "scheme_code": app.scheme_code,
        "academic_year": app.academic_year,
        "status": app.current_status,
        "created_at": app.created_at,
        "updated_at": app.updated_at,
        "document_count": len(app.documents) if app.documents else 0,
        "open_deficiency_count": len([d for d in app.deficiencies if d.status == "OPEN"]) if app.deficiencies else 0
    } for app in apps]

@router.get("/{application_id}")
def get_application(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="RESOURCE_NOT_FOUND")
        
    user_roles = [r.name for r in user.roles]
    if "APPLICANT" in user_roles and app.applicant_id != user.id:
        raise HTTPException(status_code=403, detail="AUTHORIZATION_DENIED")
        
    documents = []
    for doc in app.documents:
        versions = []
        for v in doc.versions:
            versions.append({
                "version_id": str(v.id),
                "version_number": v.version_number,
                "status": v.status,
                "created_at": v.created_at,
                "file_hash": v.file_hash
            })
        documents.append({
            "document_id": str(doc.id),
            "document_type": doc.document_type,
            "current_version_id": str(doc.current_version_id) if doc.current_version_id else None,
            "versions": versions
        })

    runs = db.query(VerificationRun).filter(VerificationRun.application_id == app.id).order_by(VerificationRun.started_at.desc()).all()
    verification_runs = [{
        "run_id": str(run.id),
        "status": run.status,
        "started_at": run.started_at,
        "completed_at": run.completed_at,
        "result_summary": run.result_summary
    } for run in runs]

    deficiencies = db.query(Deficiency).filter(Deficiency.application_id == app.id).all()
    deficiencies_list = [{
        "deficiency_id": str(d.id),
        "type": d.deficiency_type,
        "status": d.status,
        "created_at": d.created_at,
        "details": d.source_finding.details if getattr(d, 'source_finding', None) else None
    } for d in deficiencies]

    return {
        "application_id": str(app.id),
        "scheme_code": app.scheme_code,
        "academic_year": app.academic_year,
        "status": app.current_status,
        "submitted_data": app.submitted_data,
        "created_at": app.created_at,
        "updated_at": app.updated_at,
        "documents": documents,
        "verification_runs": verification_runs,
        "deficiencies": deficiencies_list
    }

@router.get("/{application_id}/deficiencies")
def get_deficiencies(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(RoleChecker(["APPLICANT"]))
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="RESOURCE_NOT_FOUND")
    if app.applicant_id != user.id:
        raise HTTPException(status_code=403, detail="AUTHORIZATION_DENIED")
        
    defs = db.query(Deficiency).filter(Deficiency.application_id == app.id).all()
    return [{
        "deficiency_id": str(d.id),
        "type": d.deficiency_type,
        "status": d.status,
        "created_at": d.created_at,
        "details": d.source_finding.details if getattr(d, 'source_finding', None) else None
    } for d in defs]

@router.get("/{application_id}/verification")
def get_verification_status(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(RoleChecker(["APPLICANT"]))
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="RESOURCE_NOT_FOUND")
    if app.applicant_id != user.id:
        raise HTTPException(status_code=403, detail="AUTHORIZATION_DENIED")
        
    latest_run = db.query(VerificationRun).filter(VerificationRun.application_id == app.id).order_by(VerificationRun.started_at.desc()).first()
    if not latest_run:
        return {"status": "NOT_STARTED"}
        
    finding_count = db.query(VerificationFinding).filter(VerificationFinding.verification_run_id == latest_run.id).count()
    def_count = db.query(Deficiency).filter(Deficiency.verification_run_id == latest_run.id).count()
    
    is_outdated = False
    if latest_run and latest_run.started_at:
        # Check if application form data was updated
        if app.updated_at and app.updated_at > latest_run.started_at:
            is_outdated = True
            
        # Check if documents were updated
        if not is_outdated:
            for doc in app.documents:
                if doc.versions:
                    latest_version_date = max((v.created_at for v in doc.versions if v.created_at), default=None)
                    if latest_version_date and latest_version_date > latest_run.started_at:
                        is_outdated = True
                        break
    findings = db.query(VerificationFinding).filter(VerificationFinding.verification_run_id == latest_run.id).all()
    finding_list = [{
        "finding_id": str(f.id),
        "finding_type": f.finding_type,
        "status": f.status,
        "source_identifier": f.source_identifier,
        "details": f.details
    } for f in findings]

    return {
        "run_id": str(latest_run.id),
        "status": latest_run.status,
        "created_at": latest_run.started_at,
        "completed_at": latest_run.completed_at,
        "overall_operational_state": app.current_status,
        "finding_count": finding_count,
        "deficiency_count": def_count,
        "error_state": latest_run.result_summary.get("error") if latest_run.result_summary else None,
        "result_summary": latest_run.result_summary,
        "is_outdated": is_outdated,
        "findings": finding_list
    }

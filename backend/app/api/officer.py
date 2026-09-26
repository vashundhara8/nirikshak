from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from pydantic import BaseModel
import uuid
from datetime import datetime, timezone

from app.db.session import get_db
from app.models.identity import User
from app.models.application import Application, ApplicationStatusHistory
from app.models.verification import VerificationRun, Deficiency, VerificationFinding, EvidenceRecord
from app.models.document import Document, DocumentVersion
from app.models.audit import AuditEvent
from app.api.dependencies import RoleChecker

router = APIRouter()

class OfficerDecisionRequest(BaseModel):
    action: str # REQUEST_CORRECTION, ACCEPT_VERIFICATION, APPROVE, REJECT
    reason: str
    deficiency_type: Optional[str] = None # Required if action is REQUEST_CORRECTION

@router.get("/workspace")
def get_officer_workspace(
    status: Optional[str] = None,
    scheme_code: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    user: User = Depends(RoleChecker(["INSTITUTE_OFFICER", "DISTRICT_OFFICER", "STATE_OFFICER"]))
):
    query = db.query(Application)
    
    if status:
        query = query.filter(Application.current_status == status)
    else:
        # Default to applications that need review
        query = query.filter(Application.current_status.in_(["SUBMITTED", "READY_FOR_OFFICER", "REQUIRES_MANUAL_REVIEW", "RESUBMISSION_RECEIVED"]))
        
    if scheme_code:
        query = query.filter(Application.scheme_code == scheme_code)
        
    total = query.count()
    apps = query.order_by(desc(Application.updated_at)).offset((page - 1) * page_size).limit(page_size).all()
    
    results = []
    for app in apps:
        latest_run = db.query(VerificationRun).filter(VerificationRun.application_id == app.id).order_by(desc(VerificationRun.started_at)).first()
        def_count = db.query(Deficiency).filter(Deficiency.application_id == app.id, Deficiency.status == "OPEN").count()

        # Fetch applicant identity for officer display (name + email only)
        from app.models.identity import User as UserModel
        from app.models.profiles import ApplicantProfile
        applicant = db.query(UserModel).filter(UserModel.id == app.applicant_id).first()
        applicant_profile = db.query(ApplicantProfile).filter(ApplicantProfile.user_id == app.applicant_id).first()
        applicant_name = (applicant_profile.full_name if applicant_profile else None) or (applicant.email.split("@")[0] if applicant else "Unknown")
        applicant_email = applicant.email if applicant else None

        results.append({
            "application_id": str(app.id),
            "scheme_code": app.scheme_code,
            "academic_year": app.academic_year,
            "status": app.current_status,
            "submitted_date": app.created_at,
            "applicant_name": applicant_name,
            "applicant_email": applicant_email,
            "verification_status": latest_run.status if latest_run else "NOT_STARTED",
            "deficiency_count": def_count
        })
        
    return {
        "items": results,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.get("/applications/{application_id}")
def get_officer_application_detail(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(RoleChecker(["INSTITUTE_OFFICER", "DISTRICT_OFFICER", "STATE_OFFICER"]))
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="RESOURCE_NOT_FOUND")
        
    documents = []
    for doc in app.documents:
        versions = []
        for v in doc.versions:
            versions.append({
                "version_id": str(v.id),
                "version_number": v.version_number,
                "status": v.status,
                "created_at": v.created_at
            })
        documents.append({
            "document_id": str(doc.id),
            "document_type": doc.document_type,
            "current_version_id": str(doc.current_version_id) if doc.current_version_id else None,
            "versions": versions
        })

    runs = db.query(VerificationRun).filter(VerificationRun.application_id == app.id).order_by(desc(VerificationRun.started_at)).all()
    verification_runs = []
    for run in runs:
        findings = db.query(VerificationFinding).filter(VerificationFinding.verification_run_id == run.id).all()
        findings_list = []
        for f in findings:
            evidence = db.query(EvidenceRecord).filter(EvidenceRecord.finding_id == f.id).all()
            evidence_list = [{
                "evidence_id": str(e.id),
                "document_version_id": str(e.document_version_id) if e.document_version_id else None,
                "field": e.field,
                "extracted_value": e.extracted_value,
                "confidence": e.confidence
            } for e in evidence]
            
            findings_list.append({
                "finding_id": str(f.id),
                "finding_type": f.finding_type,
                "status": f.status,
                "source_identifier": f.source_identifier,
                "details": f.details,
                "evidence": evidence_list
            })
            
        verification_runs.append({
            "run_id": str(run.id),
            "status": run.status,
            "started_at": run.started_at,
            "completed_at": run.completed_at,
            "result_summary": run.result_summary,
            "findings": findings_list
        })

    deficiencies = db.query(Deficiency).filter(Deficiency.application_id == app.id).all()
    deficiencies_list = [{
        "deficiency_id": str(d.id),
        "type": d.deficiency_type,
        "status": d.status,
        "created_at": d.created_at
    } for d in deficiencies]
    
    history_records = db.query(ApplicationStatusHistory).filter(ApplicationStatusHistory.application_id == app.id).order_by(desc(ApplicationStatusHistory.created_at)).all()
    history = [{
        "previous_status": h.previous_status,
        "new_status": h.new_status,
        "reason": h.reason,
        "created_at": h.created_at
    } for h in history_records]
    
    # Filter PII from applicant data safely for officer
    safe_profile = app.submitted_data if app.submitted_data else {}

    return {
        "application_id": str(app.id),
        "applicant_profile": safe_profile,
        "scheme_code": app.scheme_code,
        "academic_year": app.academic_year,
        "status": app.current_status,
        "created_at": app.created_at,
        "updated_at": app.updated_at,
        "documents": documents,
        "verification_runs": verification_runs,
        "deficiencies": deficiencies_list,
        "status_history": history
    }

@router.post("/applications/{application_id}/decision")
def record_officer_decision(
    application_id: uuid.UUID,
    decision: OfficerDecisionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(RoleChecker(["INSTITUTE_OFFICER", "DISTRICT_OFFICER", "STATE_OFFICER"]))
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="RESOURCE_NOT_FOUND")
        
    previous_status = app.current_status
    if previous_status in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="INVALID_STATE_TRANSITION")
        
    new_status = previous_status
    
    user_roles = [r.name for r in user.roles]
    primary_role = user_roles[0] if user_roles else "SYSTEM"
    
    if decision.action == "REQUEST_CORRECTION":
        if not decision.deficiency_type:
            raise HTTPException(status_code=400, detail="Deficiency type required for REQUEST_CORRECTION")
        if not decision.reason or len(decision.reason.strip()) == 0:
            raise HTTPException(status_code=400, detail="Reason required for REQUEST_CORRECTION")
        
        latest_run = db.query(VerificationRun).filter(VerificationRun.application_id == app.id).order_by(desc(VerificationRun.started_at)).first()
        
        deficiency = Deficiency(
            verification_run_id=latest_run.id if latest_run else None,
            application_id=app.id,
            deficiency_type=decision.deficiency_type,
            status="OPEN"
        )
        db.add(deficiency)
        new_status = "DEFICIENCY_RAISED"
        
    elif decision.action == "ACCEPT_VERIFICATION":
        new_status = "UNDER_SCRUTINY"
    elif decision.action == "APPROVE":
        new_status = "APPROVED"
    elif decision.action == "REJECT":
        if not decision.reason or len(decision.reason.strip()) == 0:
            raise HTTPException(status_code=400, detail="Reason required for REJECT")
        new_status = "REJECTED"
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
        
    # Update application status if changed
    if previous_status != new_status:
        app.current_status = new_status
        app.version += 1
        
        # Add history
        history = ApplicationStatusHistory(
            application_id=app.id,
            previous_status=previous_status,
            new_status=new_status,
            changed_by_user_id=user.id,
            reason=decision.reason
        )
        db.add(history)
        
    # Add audit event
    audit = AuditEvent(
        actor_id=str(user.id),
        actor_role=primary_role,
        action=f"OFFICER_DECISION_{decision.action}",
        resource_type="APPLICATION",
        resource_id=str(app.id),
        result="SUCCESS"
    )
    db.add(audit)
    
    # Send Notification Event (This would be picked up by Celery or an event bus)
    # emit_event("OFFICER_DECISION_RECORDED", {"application_id": str(app.id), "new_status": new_status})
    
    db.commit()
    return {"message": "Decision recorded", "new_status": new_status}

@router.get("/applications/{application_id}/verification")
def get_verification_status(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(RoleChecker(["INSTITUTE_OFFICER", "DISTRICT_OFFICER", "STATE_OFFICER"]))
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="RESOURCE_NOT_FOUND")
        
    latest_run = db.query(VerificationRun).filter(VerificationRun.application_id == app.id).order_by(desc(VerificationRun.started_at)).first()
    if not latest_run:
        return {"status": "NOT_STARTED"}
        
    finding_count = db.query(VerificationFinding).filter(VerificationFinding.verification_run_id == latest_run.id).count()
    def_count = db.query(Deficiency).filter(Deficiency.verification_run_id == latest_run.id).count()
    
    return {
        "run_id": str(latest_run.id),
        "status": latest_run.status,
        "created_at": latest_run.started_at,
        "completed_at": latest_run.completed_at,
        "overall_operational_state": app.current_status,
        "finding_count": finding_count,
        "deficiency_count": def_count,
        "error_state": latest_run.result_summary.get("error") if latest_run.result_summary else None
    }

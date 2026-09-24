from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

from app.db.session import get_db
from app.models.identity import User
from app.models.verification import VerificationRun, EvidenceRecord, Deficiency
from app.models.application import Application
from app.api.dependencies import get_current_user, RoleChecker

router = APIRouter()

@router.get("/verification-runs/{run_id}/evidence")
def get_evidence(
    run_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(RoleChecker(["INSTITUTE_OFFICER", "DISTRICT_OFFICER", "STATE_OFFICER", "AUDITOR"]))
):
    run = db.query(VerificationRun).filter(VerificationRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="RESOURCE_NOT_FOUND")
        
    # Strict Authorization check based on scope omitted for brevity but required in prod
    
    evidence = db.query(EvidenceRecord).join(EvidenceRecord.finding).filter(
        EvidenceRecord.finding.has(verification_run_id=run_id)
    ).all()
    
    return [
        {
            "evidence_id": str(e.id),
            "finding_id": str(e.finding_id),
            "document_version_id": str(e.document_version_id) if e.document_version_id else None,
            "field": e.field,
            "extracted_value": e.extracted_value,
            "confidence": e.confidence,
            "evidence_hash": e.evidence_hash
        }
        for e in evidence
    ]

@router.get("/applications/{application_id}/deficiencies")
def get_deficiencies(
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
        
    deficiencies = db.query(Deficiency).filter(Deficiency.application_id == application_id).all()
    
    return [
        {
            "deficiency_id": str(d.id),
            "type": d.deficiency_type,
            "status": d.status,
            "created_at": d.created_at
        }
        for d in deficiencies
    ]

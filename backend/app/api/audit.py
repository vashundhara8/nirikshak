from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.identity import User
from app.models.audit import AuditEvent
from app.api.dependencies import RoleChecker

router = APIRouter()

@router.get("/", response_model=List[dict])
def get_audit_logs(
    resource_type: str = None,
    resource_id: str = None,
    db: Session = Depends(get_db),
    user: User = Depends(RoleChecker(["AUDITOR", "MINISTRY_ADMIN"]))
):
    query = db.query(AuditEvent)
    if resource_type:
        query = query.filter(AuditEvent.resource_type == resource_type)
    if resource_id:
        query = query.filter(AuditEvent.resource_id == resource_id)
        
    events = query.order_by(AuditEvent.timestamp.desc()).limit(100).all()
    
    return [
        {
            "id": str(e.id),
            "actor_id": str(e.actor_id) if e.actor_id else None,
            "actor_role": e.actor_role,
            "action": e.action,
            "resource_type": e.resource_type,
            "resource_id": e.resource_id,
            "result": e.result,
            "timestamp": e.timestamp
        }
        for e in events
    ]

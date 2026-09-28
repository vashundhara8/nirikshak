from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Dict, Any
from datetime import datetime, timezone, timedelta

from app.db.session import get_db
from app.api.dependencies import RoleChecker
from app.models.application import Application
from app.models.verification import VerificationRun, VerificationFinding, Deficiency
from app.models.document import Document, DocumentVersion
from app.models.audit import OfficerAction, AuditEvent
from app.models.identity import User
from app.models.profiles import ApplicantProfile

router = APIRouter()
require_admin = RoleChecker(["ADMIN", "SYSTEM_ADMIN"])

@router.get("/analytics", response_model=Dict[str, Any])
def get_analytics(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    """Comprehensive platform analytics from live DB data."""

    # ── Application Overview ──────────────────────────────────────────
    total_applications = db.query(Application).count()
    status_counts = (
        db.query(Application.current_status, func.count(Application.id))
        .group_by(Application.current_status).all()
    )
    status_dist = {s[0]: s[1] for s in status_counts}

    approved = status_dist.get("APPROVED", 0)
    rejected = status_dist.get("REJECTED", 0)
    pending = status_dist.get("SUBMITTED", 0) + status_dist.get("READY_FOR_OFFICER", 0)
    under_review = status_dist.get("REQUIRES_MANUAL_REVIEW", 0) + status_dist.get("VERIFICATION_IN_PROGRESS", 0)
    corrections = status_dist.get("DEFICIENCY_FOUND", 0) + status_dist.get("RESUBMISSION_RECEIVED", 0)

    # ── Scheme Distribution ──────────────────────────────────────────
    scheme_counts = (
        db.query(Application.scheme_code, func.count(Application.id))
        .group_by(Application.scheme_code).all()
    )

    # ── User Counts ──────────────────────────────────────────────────
    from app.models.identity import UserRole, Role
    total_users = db.query(User).count()
    total_applicants = (
        db.query(User)
        .join(UserRole, User.id == UserRole.user_id)
        .join(Role, Role.id == UserRole.role_id)
        .filter(Role.name == "APPLICANT").count()
    )
    total_officers = (
        db.query(User)
        .join(UserRole, User.id == UserRole.user_id)
        .join(Role, Role.id == UserRole.role_id)
        .filter(Role.name.in_(["INSTITUTE_OFFICER", "DISTRICT_OFFICER", "STATE_OFFICER"])).count()
    )

    # ── Verification Stats ───────────────────────────────────────────
    total_runs = db.query(VerificationRun).count()
    findings_dist = (
        db.query(VerificationFinding.status, func.count(VerificationFinding.id))
        .group_by(VerificationFinding.status).all()
    )
    findings_map = {s[0]: s[1] for s in findings_dist}
    total_findings = sum(findings_map.values())
    pass_rate = round((findings_map.get("PASS", 0) / total_findings * 100), 1) if total_findings > 0 else 0

    # ── Document Stats ───────────────────────────────────────────────
    total_documents = db.query(Document).count()
    total_doc_versions = db.query(DocumentVersion).count()

    # ── Officer Actions (last 30 days) ────────────────────────────────
    since = datetime.now(timezone.utc) - timedelta(days=30)
    recent_actions = (
        db.query(OfficerAction)
        .filter(OfficerAction.created_at >= since)
        .order_by(desc(OfficerAction.created_at))
        .limit(10).all()
    )
    action_type_counts = (
        db.query(OfficerAction.action_type, func.count(OfficerAction.id))
        .filter(OfficerAction.created_at >= since)
        .group_by(OfficerAction.action_type).all()
    )

    # ── Recent Audit Events ───────────────────────────────────────────
    recent_events = (
        db.query(AuditEvent)
        .order_by(desc(AuditEvent.timestamp))
        .limit(8).all()
    )

    return {
        "overview": {
            "total_applications": total_applications,
            "approved": approved,
            "rejected": rejected,
            "pending": pending,
            "under_review": under_review,
            "corrections": corrections,
            "status_distribution": status_dist,
            "scheme_distribution": {s[0]: s[1] for s in scheme_counts},
        },
        "users": {
            "total_users": total_users,
            "total_applicants": total_applicants,
            "total_officers": total_officers,
        },
        "verification": {
            "total_runs_executed": total_runs,
            "pass_rate_percent": pass_rate,
            "average_fraud_risk": 0.0,
        },
        "findings": {
            "severity_distribution": findings_map,
            "total_findings": total_findings,
        },
        "documents": {
            "total_documents": total_documents,
            "total_versions": total_doc_versions,
        },
        "officer_actions_30d": {
            "by_type": {a[0]: a[1] for a in action_type_counts},
            "recent": [
                {
                    "action_type": a.action_type,
                    "reason": a.reason[:80] if a.reason else "",
                    "created_at": a.created_at.isoformat() if a.created_at else None,
                }
                for a in recent_actions
            ],
        },
        "audit_events": [
            {
                "action": e.action,
                "resource_type": e.resource_type,
                "result": e.result,
                "timestamp": e.timestamp.isoformat() if e.timestamp else None,
            }
            for e in recent_events
        ],
    }

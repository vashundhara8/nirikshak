import json
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid

from app.models.verification import VerificationRun, VerificationFinding, EvidenceRecord, Deficiency
from app.models.application import Application
from app.models.document import DocumentVersion
from app.models.audit import AuditEvent

# Importing existing AI logic adapters (abstracted for the domain)
# In reality, this delegates to ai.document_intelligence, ai.cross_validation, policy_engine, ai.evidence
# We will use explicit transactional boundaries here.

class VerificationService:
    def __init__(self, db: Session):
        self.db = db

    def _create_audit_event(self, actor_id: str, actor_role: str, action: str, resource_type: str, resource_id: str, result: str):
        event = AuditEvent(
            actor_id=actor_id,
            actor_role=actor_role,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            result=result
        )
        self.db.add(event)

    def trigger_verification(self, application_id: uuid.UUID, actor_id: uuid.UUID, actor_role: str) -> VerificationRun:
        app = self.db.query(Application).filter(Application.id == application_id).first()
        if not app:
            raise ValueError("APPLICATION_NOT_FOUND")

        if app.current_status not in ["SUBMITTED", "REQUIRES_CORRECTION"]:
            raise ValueError("INVALID_STATE_TRANSITION")

        # Lock application state optimistically
        app.current_status = "VERIFICATION"
        app.version += 1

        # Snapshot current active document versions
        from app.models.document import Document
        docs = self.db.query(Document).filter(Document.application_id == application_id).all()
        doc_refs = {}
        for doc in docs:
            if doc.current_version_id:
                doc_refs[str(doc.id)] = str(doc.current_version_id)

        # Resolve the active PolicyVersion for this scheme so it is stamped
        # on the VerificationRun — this makes the audit trail complete.
        from app.models.verification import PolicyVersion
        from sqlalchemy import and_, or_
        from datetime import datetime, timezone as tz
        now = datetime.now(tz.utc)
        active_policy = (
            self.db.query(PolicyVersion)
            .filter(
                PolicyVersion.scheme_code == app.scheme_code,
                PolicyVersion.active_from <= now,
                or_(PolicyVersion.active_until.is_(None), PolicyVersion.active_until >= now),
            )
            .order_by(PolicyVersion.active_from.desc())
            .first()
        )

        run = VerificationRun(
            application_id=application_id,
            policy_version_id=active_policy.id if active_policy else None,
            engine_versions={"doc_intel": "1.0", "policy": "1.0", "evidence": "1.0"},
            input_document_references=doc_refs,
            status="PROCESSING"
        )
        self.db.add(run)

        self._create_audit_event(actor_id, actor_role, "VERIFICATION_STARTED", "APPLICATION", str(application_id), "SUCCESS")
        self.db.commit()  # Commit the 'PROCESSING' state immediately

        # ==========================================
        # Dispatch to Celery for async processing
        # ==========================================
        from app.core.celery_app import run_verification_task
        run_verification_task.delay(str(run.id), str(actor_id), actor_role)

        return run
    def complete_verification(self, run_id: uuid.UUID, actor_id: str, actor_role: str, success: bool, error: str = None):
        from app.models.application import Application
        run = self.db.query(VerificationRun).filter(VerificationRun.id == run_id).first()
        if not run:
            return
            
        app = self.db.query(Application).filter(Application.id == run.application_id).first()
        if not app:
            return
        
        if success:
            run.status = "COMPLETED"
            run.completed_at = datetime.now(timezone.utc)
            app.current_status = "READY_FOR_OFFICER"
            app.version += 1
            self._create_audit_event(actor_id, actor_role, "VERIFICATION_COMPLETED", "VERIFICATION_RUN", str(run.id), "SUCCESS")
        else:
            run.status = "FAILED"
            run.result_summary = {"error": error}
            app.current_status = "REQUIRES_MANUAL_REVIEW"
            app.version += 1
            self._create_audit_event(actor_id, actor_role, "VERIFICATION_FAILED", "VERIFICATION_RUN", str(run.id), "FAILURE")
            
        self.db.commit()

"""
backend/app/services/notification_service.py

Central service for creating and dispatching in-app notifications.
Called by officer actions, verification pipeline, and auth events.

Usage:
    from app.services.notification_service import NotificationService
    NotificationService.notify(db, user_id=applicant.id, ...)
"""
import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationService:

    # ── Notification Types ─────────────────────────────────────────────
    APPLICATION_SUBMITTED   = "APPLICATION_SUBMITTED"
    APPLICATION_ASSIGNED    = "APPLICATION_ASSIGNED"
    VERIFICATION_STARTED    = "VERIFICATION_STARTED"
    CORRECTION_REQUESTED    = "CORRECTION_REQUESTED"
    CORRECTION_SUBMITTED    = "CORRECTION_SUBMITTED"
    APPLICATION_APPROVED    = "APPLICATION_APPROVED"
    APPLICATION_REJECTED    = "APPLICATION_REJECTED"
    DOCUMENT_UPLOADED       = "DOCUMENT_UPLOADED"
    SYSTEM_ALERT            = "SYSTEM_ALERT"

    @classmethod
    def notify(
        cls,
        db: Session,
        user_id: str,
        notification_type: str,
        title: str,
        message: str,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        action_url: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> Notification:
        """Create and persist a notification. Returns the created object."""
        n = Notification(
            user_id=uuid.UUID(str(user_id)),
            notification_type=notification_type,
            title=title,
            message=message,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id else None,
            action_url=action_url,
            metadata_=metadata,
        )
        db.add(n)
        db.flush()   # get ID without committing — caller commits
        return n

    # ── Convenience helpers ────────────────────────────────────────────

    @classmethod
    def application_submitted(cls, db: Session, applicant_id: str, application_id: str, scheme_code: str):
        return cls.notify(
            db, applicant_id,
            cls.APPLICATION_SUBMITTED,
            title="Application Submitted",
            message=f"Your application for {scheme_code} has been submitted successfully and is pending review.",
            resource_type="APPLICATION",
            resource_id=application_id,
            action_url=f"/applicant/applications/{application_id}",
        )

    @classmethod
    def correction_requested(cls, db: Session, applicant_id: str, application_id: str, deficiency_type: str, reason: str):
        return cls.notify(
            db, applicant_id,
            cls.CORRECTION_REQUESTED,
            title="Correction Required",
            message=f"The officer has requested a correction: {reason[:120]}",
            resource_type="APPLICATION",
            resource_id=application_id,
            action_url=f"/applicant/applications/{application_id}",
            metadata={"deficiency_type": deficiency_type},
        )

    @classmethod
    def application_approved(cls, db: Session, applicant_id: str, application_id: str, scheme_code: str):
        return cls.notify(
            db, applicant_id,
            cls.APPLICATION_APPROVED,
            title="Application Approved ✓",
            message=f"Congratulations! Your application for {scheme_code} has been approved.",
            resource_type="APPLICATION",
            resource_id=application_id,
            action_url=f"/applicant/applications/{application_id}",
        )

    @classmethod
    def application_rejected(cls, db: Session, applicant_id: str, application_id: str, reason: str):
        return cls.notify(
            db, applicant_id,
            cls.APPLICATION_REJECTED,
            title="Application Rejected",
            message=f"Your application has been rejected. Reason: {reason[:120]}",
            resource_type="APPLICATION",
            resource_id=application_id,
            action_url=f"/applicant/applications/{application_id}",
        )

    @classmethod
    def verification_started(cls, db: Session, applicant_id: str, application_id: str):
        return cls.notify(
            db, applicant_id,
            cls.VERIFICATION_STARTED,
            title="Verification Started",
            message="An officer has started verifying your application. You will be notified of the outcome.",
            resource_type="APPLICATION",
            resource_id=application_id,
            action_url=f"/applicant/applications/{application_id}",
        )

    @classmethod
    def new_application_for_officer(cls, db: Session, officer_id: str, application_id: str, scheme_code: str):
        return cls.notify(
            db, officer_id,
            cls.APPLICATION_ASSIGNED,
            title="New Application in Queue",
            message=f"A new {scheme_code} application is ready for your review.",
            resource_type="APPLICATION",
            resource_id=application_id,
            action_url=f"/officer/applications/{application_id}",
        )

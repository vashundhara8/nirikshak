"""
backend/app/models/notification.py

In-app notification model.
Used to surface system events to applicants, officers, and admins.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.db.base import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Notification content
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(80), nullable=False)  # e.g. APPLICATION_SUBMITTED, CORRECTION_REQUESTED

    # Contextual link
    resource_type = Column(String(50), nullable=True)   # APPLICATION, DOCUMENT, etc.
    resource_id = Column(String(100), nullable=True)    # UUID of the related resource
    action_url = Column(String(500), nullable=True)     # Frontend URL to navigate to

    # Metadata
    metadata_ = Column("metadata", JSONB, nullable=True)

    # State
    is_read = Column(Boolean, default=False, nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "message": self.message,
            "notification_type": self.notification_type,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "action_url": self.action_url,
            "is_read": self.is_read,
            "read_at": self.read_at.isoformat() if self.read_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

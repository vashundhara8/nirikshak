from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone
import uuid

from app.db.base import Base

class OfficerAction(Base):
    __tablename__ = 'officer_actions'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey('applications.id', ondelete="CASCADE"), nullable=False)
    officer_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete="RESTRICT"), nullable=False)
    verification_run_id = Column(UUID(as_uuid=True), ForeignKey('verification_runs.id', ondelete="RESTRICT"), nullable=True)
    
    action_type = Column(String(50), nullable=False) # e.g. REQUEST_CORRECTION, APPROVE, REJECT
    reason = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class AuditEvent(Base):
    __tablename__ = 'audit_events'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id = Column(UUID(as_uuid=True), nullable=True) # Nullable for unauthenticated/system
    actor_role = Column(String(50), nullable=True)
    
    action = Column(String(100), nullable=False) # e.g. VERIFICATION_STARTED
    resource_type = Column(String(50), nullable=False) # e.g. APPLICATION
    resource_id = Column(String(100), nullable=True)
    
    result = Column(String(20), nullable=False) # SUCCESS, FAILURE
    request_id = Column(String(100), nullable=True)
    correlation_id = Column(String(100), nullable=True)
    
    metadata_ = Column("metadata", JSONB, nullable=True) # Can't use 'metadata' in SQLAlchemy
    
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

class Job(Base):
    __tablename__ = 'jobs'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_type = Column(String(100), nullable=False) # e.g. DOCUMENT_OCR
    status = Column(String(50), nullable=False, default="QUEUED") # RUNNING, COMPLETED, FAILED
    payload = Column(JSONB, nullable=True)
    error_detail = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

class IdempotencyRecord(Base):
    __tablename__ = 'idempotency_records'
    idempotency_key = Column(String(128), primary_key=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    path = Column(String(255), nullable=False)
    response_body = Column(JSONB, nullable=False)
    status_code = Column(String(10), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

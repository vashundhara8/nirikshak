from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.db.base import Base

class Application(Base):
    __tablename__ = 'applications'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    applicant_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete="RESTRICT"), nullable=False)
    
    scheme_code = Column(String(100), nullable=False)
    academic_year = Column(String(20), nullable=False)
    
    current_status = Column(String(50), nullable=False, default="DRAFT") # SUBMITTED, UNDER_OFFICER_REVIEW, etc.
    
    # Snapshot of submitted data (demographics, income, etc.)
    submitted_data = Column(JSONB, nullable=True) 
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    version = Column(Integer, default=1) # Optimistic concurrency control
    
    applicant = relationship("User")
    status_history = relationship("ApplicationStatusHistory", back_populates="application")
    documents = relationship("Document", back_populates="application")

class ApplicationStatusHistory(Base):
    __tablename__ = 'application_status_history'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey('applications.id', ondelete="CASCADE"), nullable=False)
    
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    
    changed_by_user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete="SET NULL"), nullable=True)
    reason = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    application = relationship("Application", back_populates="status_history")
    changed_by = relationship("User")

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.db.base import Base

class ApplicantProfile(Base):
    __tablename__ = 'applicant_profiles'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete="CASCADE"), unique=True, nullable=False)
    
    # Basic demographic info
    full_name = Column(String(255), nullable=False)
    masked_aadhaar = Column(String(20), nullable=True)
    dob = Column(DateTime(timezone=False), nullable=True)
    category = Column(String(50), nullable=True) # e.g., ST, SC, GENERAL
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    user = relationship("User")

class OfficerProfile(Base):
    __tablename__ = 'officer_profiles'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete="CASCADE"), unique=True, nullable=False)
    
    full_name = Column(String(255), nullable=False)
    designation = Column(String(255), nullable=False)
    
    # Scope for authorization
    institution_id = Column(String(100), nullable=True)
    district_code = Column(String(50), nullable=True)
    state_code = Column(String(50), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    user = relationship("User")

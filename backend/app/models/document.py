from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, BigInteger, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.db.base import Base

class Document(Base):
    __tablename__ = 'documents'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey('applications.id', ondelete="CASCADE"), nullable=False)
    
    document_type = Column(String(100), nullable=False) # e.g., ST_CERTIFICATE
    current_version_id = Column(UUID(as_uuid=True), nullable=True) # Updated when a new version is created
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    application = relationship("Application", back_populates="documents")
    versions = relationship("DocumentVersion", back_populates="document")

class DocumentVersion(Base):
    __tablename__ = 'document_versions'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id', ondelete="CASCADE"), nullable=False)
    
    version_number = Column(Integer, nullable=False)
    storage_key = Column(String(512), nullable=False, unique=True)
    
    file_hash = Column(String(64), nullable=False) # SHA-256
    mime_type = Column(String(100), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    
    status = Column(String(50), nullable=False, default="UPLOADED") # VALIDATING, EXTRACTED, REJECTED
    
    ocr_required = Column(Boolean, default=False)
    ocr_status = Column(String(50), nullable=True)
    ocr_metadata = Column(JSONB, nullable=True) # confidence, engine, pages
    
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    document = relationship("Document", back_populates="versions")

class DocumentAccess(Base):
    __tablename__ = 'document_access'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_version_id = Column(UUID(as_uuid=True), ForeignKey('document_versions.id', ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    
    reason = Column(String(255), nullable=False) # e.g., 'Verification Review'
    accessed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

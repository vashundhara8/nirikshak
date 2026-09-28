from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.db.base import Base

class PolicyVersion(Base):
    __tablename__ = 'policy_versions'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scheme_code = Column(String(100), nullable=False)
    version_tag = Column(String(50), nullable=False) # e.g. PM-2022_V2
    rules = Column(JSONB, nullable=False) # Store the deterministic config
    active_from = Column(DateTime(timezone=True), nullable=False)
    active_until = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class VerificationRun(Base):
    __tablename__ = 'verification_runs'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey('applications.id', ondelete="CASCADE"), nullable=False)
    
    policy_version_id = Column(UUID(as_uuid=True), ForeignKey('policy_versions.id', ondelete="RESTRICT"), nullable=True)
    engine_versions = Column(JSONB, nullable=False) # Tracks versions of Steps 10-14 used
    input_document_references = Column(JSONB, nullable=False) # Tracks exactly which document versions were input
    
    started_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), nullable=False, default="PROCESSING") # COMPLETED, FAILED
    
    result_summary = Column(JSONB, nullable=True)
    
    findings = relationship("VerificationFinding", back_populates="run")
    deficiencies = relationship("Deficiency", back_populates="run")
    
class VerificationFinding(Base):
    __tablename__ = 'verification_findings'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    verification_run_id = Column(UUID(as_uuid=True), ForeignKey('verification_runs.id', ondelete="CASCADE"), nullable=False)
    
    finding_type = Column(String(50), nullable=False) # e.g. DOCUMENT_VALIDATION, POLICY_EVALUATION
    status = Column(String(50), nullable=False) # PASS, FAIL, MANUAL_REVIEW_REQUIRED
    source_identifier = Column(String(100), nullable=False) # e.g. DOB_CONSISTENCY, PM-INC-001
    
    details = Column(JSONB, nullable=False)
    
    run = relationship("VerificationRun", back_populates="findings")
    evidence = relationship("EvidenceRecord", back_populates="finding")

class EvidenceRecord(Base):
    __tablename__ = 'evidence_records'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    finding_id = Column(UUID(as_uuid=True), ForeignKey('verification_findings.id', ondelete="CASCADE"), nullable=False)
    
    document_version_id = Column(UUID(as_uuid=True), ForeignKey('document_versions.id', ondelete="RESTRICT"), nullable=True)
    page = Column(String(20), nullable=True)
    field = Column(String(100), nullable=True)
    
    extracted_value = Column(String(512), nullable=True)
    confidence = Column(String(20), nullable=True) # E.g. "NOT_AVAILABLE"
    evidence_hash = Column(String(64), nullable=False)
    
    finding = relationship("VerificationFinding", back_populates="evidence")
    
class Deficiency(Base):
    __tablename__ = 'deficiencies'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    verification_run_id = Column(UUID(as_uuid=True), ForeignKey('verification_runs.id', ondelete="CASCADE"), nullable=False)
    application_id = Column(UUID(as_uuid=True), ForeignKey('applications.id', ondelete="CASCADE"), nullable=False)
    
    deficiency_type = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="OPEN") # CORRECTION_SUBMITTED, RESOLVED
    
    source_finding_id = Column(UUID(as_uuid=True), ForeignKey('verification_findings.id', ondelete="RESTRICT"), nullable=True)
    
    resolution_notes = Column(String(500), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete="RESTRICT"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    run = relationship("VerificationRun", back_populates="deficiencies")
    source_finding = relationship("VerificationFinding", foreign_keys=[source_finding_id])

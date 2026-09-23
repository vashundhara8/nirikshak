from pydantic import BaseModel, Field
from typing import List, Optional, Union, Dict, Any

class EvidenceLocation(BaseModel):
    document_id: str
    document_type: str
    page: str = "NOT_AVAILABLE"
    section: str = "NOT_AVAILABLE"
    field: Optional[str] = None

class PolicySourceReference(BaseModel):
    source_id: str
    source_document: str
    source_page: str
    source_section: str
    source_reference: str

class RuleReference(BaseModel):
    rule_id: str
    policy_version: str = "PM-2022"
    rule_statement: str = "NOT_AVAILABLE"
    source_reference: Optional[PolicySourceReference] = None

class EvidenceRecord(BaseModel):
    evidence_id: str
    application_id: str
    verification_run_id: str = "NOT_AVAILABLE"
    expected_value: str = "NOT_AVAILABLE"
    observed_value: str = "NOT_AVAILABLE"
    normalized_value: str = "NOT_AVAILABLE"
    operator: str = "NOT_AVAILABLE"
    evidence_location: Optional[EvidenceLocation] = None
    extraction_method: str = "DIRECT_TEXT"
    extraction_confidence: str = "NOT_AVAILABLE"
    created_at: str

class StructuredExplanation(BaseModel):
    short_reason: str
    detailed_reason: str
    action_guidance: str

class ExplanationChain(BaseModel):
    finding_id: str
    application_id: str
    finding_type: str
    result: str
    rule: Optional[RuleReference] = None
    evidence: List[EvidenceRecord] = Field(default_factory=list)
    explanation: StructuredExplanation
    created_at: str

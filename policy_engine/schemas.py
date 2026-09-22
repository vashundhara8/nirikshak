from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional, Union

class PolicySource(BaseModel):
    source_id: str
    source_document: str
    source_page: str
    source_section: str
    source_reference: str

class PolicyRule(BaseModel):
    rule_id: str
    scheme: str
    policy_version: str
    rule_type: str
    rule_statement: str
    parameters: Dict[str, Any]
    source: PolicySource
    effective_from: str
    effective_to: str
    verification_status: str
    notes: str

class RuleEvaluationResult(BaseModel):
    evaluation_id: str
    application_id: str
    rule_id: str
    policy_version: str
    status: str  # PASS, FAIL, NOT_APPLICABLE, MANUAL_REVIEW_REQUIRED
    inputs: Dict[str, Any]
    expected_condition: str
    actual_value: Any
    reason: str
    source_reference: PolicySource

class PolicyEvaluationSummary(BaseModel):
    application_id: str
    policy_version: str
    total_rules_evaluated: int
    pass_count: int
    fail_count: int
    manual_review_count: int
    not_applicable_count: int
    rule_evaluations: List[RuleEvaluationResult]

class NormalizedInputs(BaseModel):
    category: Optional[str] = None
    income: Optional[int] = None
    domicile: Optional[str] = None
    institution: Optional[str] = None
    course: Optional[str] = None
    renewal: bool = False
    documents_present: List[str] = Field(default_factory=list)
    academic_percentage: Optional[float] = None
    last_exam: Optional[str] = None
    other_scholarships: bool = False
    orphan: bool = False
    marital_status: str = "SINGLE"
    
    # Flags for conflicts/ambiguities
    conflicted_fields: List[str] = Field(default_factory=list)
    ambiguous_conditions: List[str] = Field(default_factory=list)

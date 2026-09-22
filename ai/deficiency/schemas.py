from pydantic import BaseModel, Field
from typing import List, Optional, Any
from enum import Enum

class DeficiencyCategory(str, Enum):
    DOCUMENT = "DOCUMENT"
    IDENTITY = "IDENTITY"
    DATE_OF_BIRTH = "DATE_OF_BIRTH"
    CATEGORY = "CATEGORY"
    INCOME = "INCOME"
    DOMICILE = "DOMICILE"
    INSTITUTION = "INSTITUTION"
    COURSE = "COURSE"
    RENEWAL = "RENEWAL"
    DUPLICATE = "DUPLICATE"
    OTHER_SCHOLARSHIP = "OTHER_SCHOLARSHIP"
    BANK = "BANK"
    DOCUMENT_QUALITY = "DOCUMENT_QUALITY"
    SYSTEM = "SYSTEM"

class DeficiencyType(str, Enum):
    MISSING_DOCUMENT = "MISSING_DOCUMENT"
    INVALID_DOCUMENT = "INVALID_DOCUMENT"
    DOCUMENT_UNREADABLE = "DOCUMENT_UNREADABLE"
    FIELD_MISMATCH = "FIELD_MISMATCH"
    VALUE_CONFLICT = "VALUE_CONFLICT"
    THRESHOLD_FAILURE = "THRESHOLD_FAILURE"
    UNVERIFIED_REFERENCE = "UNVERIFIED_REFERENCE"
    DUPLICATE_LIKE = "DUPLICATE_LIKE"
    RENEWAL_CHECK = "RENEWAL_CHECK"
    OTHER_SCHOLARSHIP_CONFLICT = "OTHER_SCHOLARSHIP_CONFLICT"

class Severity(str, Enum):
    BLOCKING = "BLOCKING"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"

class ResponsibleParty(str, Enum):
    APPLICANT = "APPLICANT"
    INSTITUTION = "INSTITUTION"
    DISTRICT_OFFICER = "DISTRICT_OFFICER"
    STATE_OFFICER = "STATE_OFFICER"
    MINISTRY_OFFICER = "MINISTRY_OFFICER"
    SYSTEM = "SYSTEM"
    MANUAL_REVIEW = "MANUAL_REVIEW"

class RerunScope(str, Enum):
    REQUIRED_DOCUMENT_CHECK = "REQUIRED_DOCUMENT_CHECK"
    IDENTITY_VALIDATION = "IDENTITY_VALIDATION"
    DOB_VALIDATION = "DOB_VALIDATION"
    CATEGORY_VALIDATION = "CATEGORY_VALIDATION"
    INCOME_POLICY_CHECK = "INCOME_POLICY_CHECK"
    DOMICILE_VALIDATION = "DOMICILE_VALIDATION"
    INSTITUTION_VALIDATION = "INSTITUTION_VALIDATION"
    COURSE_VALIDATION = "COURSE_VALIDATION"
    DUPLICATE_CHECK = "DUPLICATE_CHECK"
    ALL = "ALL"
    NONE = "NONE"

class ExceptionType(str, Enum):
    POLICY_EXCEPTION = "POLICY_EXCEPTION"
    DATA_EXCEPTION = "DATA_EXCEPTION"
    STATE_DEPENDENCY = "STATE_DEPENDENCY"
    REFERENCE_DATA_DEPENDENCY = "REFERENCE_DATA_DEPENDENCY"
    MANUAL_VERIFICATION = "MANUAL_VERIFICATION"
    SYSTEM_DEPENDENCY = "SYSTEM_DEPENDENCY"

class OperationalStatus(str, Enum):
    READY_FOR_OFFICER_REVIEW = "READY_FOR_OFFICER_REVIEW"
    ACTION_REQUIRED = "ACTION_REQUIRED"
    MANUAL_REVIEW_REQUIRED = "MANUAL_REVIEW_REQUIRED"
    REFERENCE_CHECK_REQUIRED = "REFERENCE_CHECK_REQUIRED"
    CORRECTION_REQUIRED = "CORRECTION_REQUIRED"
    NO_DEFICIENCY = "NO_DEFICIENCY"

class ActionGuidance(BaseModel):
    message: str
    action_required: str
    correction_guidance: str

class DeficiencyRecord(BaseModel):
    deficiency_id: str
    application_id: str
    verification_run_id: Optional[str] = None
    category: DeficiencyCategory
    deficiency_type: DeficiencyType
    severity: Severity
    status: str = "OPEN"
    responsible_party: ResponsibleParty
    message: str
    action_required: str
    correction_guidance: str
    rerun_scope: RerunScope
    source_type: str
    source_id: str
    rule_id: Optional[str] = None
    policy_version: str = "PM-2022"
    evidence_reference: List[Any] = Field(default_factory=list)
    created_at: str
    machine_generated: bool = True
    officer_review_required: bool = True

class ExceptionRecord(BaseModel):
    exception_id: str
    application_id: str
    exception_type: ExceptionType
    reason: str
    policy_rule: Optional[str] = None
    policy_version: str = "PM-2022"
    required_manual_action: str
    responsible_party: ResponsibleParty
    status: str = "OPEN"
    evidence_reference: List[Any] = Field(default_factory=list)
    created_at: str

class ApplicationOperationalSummary(BaseModel):
    application_id: str
    operational_status: OperationalStatus
    total_deficiencies: int
    blocking_count: int
    high_count: int
    medium_count: int
    low_count: int
    manual_review_count: int
    deficiencies: List[DeficiencyRecord]
    exceptions: List[ExceptionRecord]

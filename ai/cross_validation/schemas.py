from pydantic import BaseModel
from typing import List, Optional, Any

class ValidationEvidence(BaseModel):
    document_id: str
    field: str

class ValidationValue(BaseModel):
    document_id: str
    document_type: str
    field: str
    raw_value: str
    normalized_value: str

class ValidationFinding(BaseModel):
    application_id: str
    validation_type: str
    status: str
    field: str
    values: List[ValidationValue]
    reason: str
    evidence: List[ValidationEvidence]

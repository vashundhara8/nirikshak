from pydantic import BaseModel
from typing import Optional, Any, Dict

class ExtractionField(BaseModel):
    field_name: str
    raw_value: Optional[str] = None
    normalized_value: Optional[str] = None
    extraction_method: str = "RULE_BASELINE"
    confidence: Optional[float] = None
    source_location: Optional[str] = None
    status: str = "EXTRACTED"
    metadata: Dict[str, Any] = {}

class DocumentExtractionResult(BaseModel):
    document_id: str
    application_id: Optional[str] = None
    document_type: str
    classification_method: str = "RULE_BASELINE"
    extraction_method: str
    fields: Dict[str, ExtractionField]
    status: str = "SUCCESS"
    notes: str = ""

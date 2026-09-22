import datetime
from pydantic import BaseModel, Field
from typing import Any, Dict, Optional

class ProvenanceRecord(BaseModel):
    source_id: str
    source_url: str
    resource_uuid: Optional[str] = None
    retrieved_at: str = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat())
    academic_year: Optional[str] = None
    scheme: Optional[str] = None
    ingestion_version: str = "1.0.0"

class ProvenanceWrapper(BaseModel):
    provenance: ProvenanceRecord
    data: Any

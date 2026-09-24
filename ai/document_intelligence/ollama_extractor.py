import json
import logging
from typing import Dict, Any, Optional
from pydantic import BaseModel, ValidationError
from ai.providers.ollama_provider import OllamaProvider

logger = logging.getLogger(__name__)

PROMPT_VERSION = "1.0.0"

class OllamaExtractionSchema(BaseModel):
    document_type: Optional[str] = None
    candidate_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    category: Optional[str] = None
    income: Optional[str] = None
    institution: Optional[str] = None
    course: Optional[str] = None
    academic_year: Optional[str] = None
    certificate_number: Optional[str] = None
    issue_date: Optional[str] = None
    domicile_state: Optional[str] = None

class OllamaExtractor:
    def __init__(self, provider: OllamaProvider):
        self.provider = provider

    def extract(self, doc_type: str, text: str) -> Dict[str, Any]:
        """
        Uses Ollama to extract structured fields from document text.
        """
        # The prompt explicitly tells the model to not decide eligibility and return JSON.
        prompt = f"""You are extracting fields from provided document text.
Do not infer missing values.
Do not decide eligibility.
Return only the requested structured fields in JSON format.
If a field is absent, return null.
Do not invent values.

Document Type: {doc_type}

Extract the following fields if present:
- document_type
- candidate_name
- date_of_birth
- category
- income
- institution
- course
- academic_year
- certificate_number
- issue_date
- domicile_state

Document Text:
\"\"\"
{text}
\"\"\"
"""
        
        result = self.provider.generate(prompt, require_json=True)
        if result["status"] != "SUCCESS":
            return {"status": "FAILED", "error": result.get("error")}
            
        try:
            raw_response = result["response"]
            # Parse JSON
            parsed_data = json.loads(raw_response)
            
            # Validate with Pydantic
            validated = OllamaExtractionSchema(**parsed_data)
            
            fields = {k: v for k, v in validated.model_dump().items() if v is not None and str(v).strip() != ""}
            
            metadata = {
                "provider": result["provider"],
                "model": result["model"],
                "prompt_version": PROMPT_VERSION
            }
            
            return {
                "status": "SUCCESS",
                "fields": fields,
                "metadata": metadata
            }
            
        except (json.JSONDecodeError, ValidationError) as e:
            logger.error(f"Failed to parse or validate Ollama JSON response: {e}")
            # Try one strict retry
            return self._retry_extract(doc_type, text)
        except Exception as e:
            logger.error(f"Ollama extraction error: {e}")
            return {"status": "FAILED", "error": str(e)}

    def _retry_extract(self, doc_type: str, text: str) -> Dict[str, Any]:
        retry_prompt = f"""You are a strict data extraction assistant.
Return ONLY valid JSON. No markdown, no explanations, no prefix or suffix.
Extract the fields for a {doc_type} from the text.
Fields: document_type, candidate_name, date_of_birth, category, income, institution, course, academic_year, certificate_number, issue_date, domicile_state.
If missing, use null.

Text:
{text}
"""
        result = self.provider.generate(retry_prompt, require_json=True)
        if result["status"] != "SUCCESS":
            return {"status": "FAILED", "error": result.get("error")}
            
        try:
            parsed_data = json.loads(result["response"])
            validated = OllamaExtractionSchema(**parsed_data)
            fields = {k: v for k, v in validated.model_dump().items() if v is not None and str(v).strip() != ""}
                    
            metadata = {
                "provider": result["provider"],
                "model": result["model"],
                "prompt_version": PROMPT_VERSION + "-retry"
            }
            return {
                "status": "SUCCESS",
                "fields": fields,
                "metadata": metadata
            }
        except Exception as e:
            logger.error(f"Failed to parse or validate Ollama JSON on retry: {e}")
            return {"status": "FAILED", "error": "JSON parsing/validation failed on retry"}

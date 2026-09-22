from typing import Dict, Any
from .base import ProviderBase

class MockProvider(ProviderBase):
    def fetch_document(self, document_type: str, parameters: Dict[str, str]) -> Dict[str, Any]:
        return {
            "status": "SUCCESS", 
            "classification": "TEST_FIXTURE", 
            "data": {"document_type": document_type, "content": "mock_data"}
        }

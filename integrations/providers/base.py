# integrations/providers/base.py
from abc import ABC, abstractmethod
from typing import Dict, Any

class ProviderBase(ABC):
    def __init__(self, mode: str = "SANDBOX"):
        self.mode = mode
        
    @abstractmethod
    def fetch_document(self, document_type: str, parameters: Dict[str, str]) -> Dict[str, Any]:
        pass

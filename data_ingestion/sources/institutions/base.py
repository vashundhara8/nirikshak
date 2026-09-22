from abc import ABC, abstractmethod
from typing import Dict, Any, List

class InstitutionProvider(ABC):
    @abstractmethod
    def search_by_code(self, code: str) -> List[Dict[str, Any]]:
        pass
        
    @abstractmethod
    def search_by_name(self, name: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def search_by_state(self, state: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def search_by_district(self, district: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def normalize_institution(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        pass

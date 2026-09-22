from typing import Dict, Any, List
from .base import InstitutionProvider

class NSPInstitutionProvider(InstitutionProvider):
    """
    Adapter for the NSP institution registry.
    https://scholarships.gov.in/onlineInstituteSearchIndex
    """
    
    def _fail_with_captcha_warning(self):
        raise RuntimeError("UNAVAILABLE: The NSP institution search is CAPTCHA protected. Automated ingestion is disabled pending official machine-readable dataset or API access.")

    def search_by_code(self, code: str) -> List[Dict[str, Any]]:
        self._fail_with_captcha_warning()
        
    def search_by_name(self, name: str) -> List[Dict[str, Any]]:
        self._fail_with_captcha_warning()

    def search_by_state(self, state: str) -> List[Dict[str, Any]]:
        self._fail_with_captcha_warning()

    def search_by_district(self, district: str) -> List[Dict[str, Any]]:
        self._fail_with_captcha_warning()

    def normalize_institution(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        return {}

from abc import ABC, abstractmethod
# magic imported locally
import hashlib
from typing import Tuple, Optional

from app.core.config import settings

class DocumentSecurityScanner(ABC):
    @abstractmethod
    def scan_document(self, file_bytes: bytes, original_filename: str) -> Tuple[bool, str]:
        """Returns (is_safe, reason)"""
        pass

class StandardSecurityScanner(DocumentSecurityScanner):
    def scan_document(self, file_bytes: bytes, original_filename: str) -> Tuple[bool, str]:
        # Validate Size
        if len(file_bytes) > 10 * 1024 * 1024:
            return False, "DOCUMENT_TOO_LARGE"
            
        # Validate MIME (Magic Bytes)
        try:
            import magic
            mime = magic.from_buffer(file_bytes, mime=True)
            allowed_mimes = ["application/pdf", "image/jpeg", "image/png"]
            if mime not in allowed_mimes:
                return False, f"INVALID_MIME_TYPE: {mime}"
        except ImportError:
            # fallback if python-magic not available
            pass
            
        return True, "SAFE"

class ProductionMalwareScanner(DocumentSecurityScanner):
    def scan_document(self, file_bytes: bytes, original_filename: str) -> Tuple[bool, str]:
        base_scanner = StandardSecurityScanner()
        is_safe, reason = base_scanner.scan_document(file_bytes, original_filename)
        if not is_safe:
            return False, reason
            
        # Integrate with ClamAV or Enterprise Scanner
        # Currently provider not configured
        raise Exception("PROVIDER_NOT_CONFIGURED: Malware scanner required for production.")

def get_security_scanner() -> DocumentSecurityScanner:
    if settings.APP_ENV == "production":
        return ProductionMalwareScanner()
    return StandardSecurityScanner()

def calculate_checksum(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()

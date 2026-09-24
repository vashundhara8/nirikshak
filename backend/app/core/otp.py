from abc import ABC, abstractmethod
import secrets
import hashlib
from datetime import datetime, timedelta, timezone

from app.core.config import settings

class OTPProvider(ABC):
    @abstractmethod
    def generate_otp(self) -> str:
        pass
        
    @abstractmethod
    def send_otp(self, destination: str, otp: str, purpose: str) -> bool:
        pass

    @abstractmethod
    def verify_access_token(self, access_token: str) -> dict:
        """Verify MSG91 widget access token or mock token."""
        pass

    def hash_otp(self, otp: str) -> str:
        # Simple SHA-256 for OTP is usually sufficient, as it's short-lived and single use.
        return hashlib.sha256(otp.encode()).hexdigest()

class DevelopmentOTPProvider(OTPProvider):
    def generate_otp(self) -> str:
        return "123456" # Fixed for dev

    def send_otp(self, destination: str, otp: str, purpose: str) -> bool:
        print(f"[DEV OTP] Sending {otp} to {destination} for {purpose}")
        return True

    def verify_access_token(self, access_token: str) -> dict:
        # Mock successful verification for dev
        if access_token == "mock_success":
            return {"type": "success", "message": "verified"}
        return {"type": "error", "message": "invalid_mock_token"}

class ProductionOTPProvider(OTPProvider):
    def generate_otp(self) -> str:
        return ''.join(secrets.choice("0123456789") for _ in range(6))

    def send_otp(self, destination: str, otp: str, purpose: str) -> bool:
        # Integrate with real SMS/Email gateway here
        # E.g. AWS SNS, Twilio, or NIC SMS gateway
        # if not settings.SMS_GATEWAY_URL:
        #     raise Exception("PROVIDER_NOT_CONFIGURED")
        return True

    def verify_access_token(self, access_token: str) -> dict:
        raise NotImplementedError("ProductionOTPProvider uses external SMS, verify manually.")

import requests
import logging
logger = logging.getLogger(__name__)

class MSG91OTPProvider(OTPProvider):
    def generate_otp(self) -> str:
        raise NotImplementedError("MSG91 widget generates its own OTPs")

    def send_otp(self, destination: str, otp: str, purpose: str) -> bool:
        raise NotImplementedError("MSG91 widget sends its own OTPs")

    def verify_access_token(self, access_token: str) -> dict:
        if not settings.MSG91_AUTH_KEY:
            logger.error("MSG91_AUTH_KEY not configured")
            return {"type": "error", "message": "server_misconfigured"}

        try:
            response = requests.post(
                "https://control.msg91.com/api/v5/widget/verifyAccessToken",
                json={
                    "authkey": settings.MSG91_AUTH_KEY,
                    "access-token": access_token
                },
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            response.raise_for_status()
            data = response.json()
            # Expecting data format depending on MSG91 API
            return data
        except requests.exceptions.RequestException as e:
            logger.error(f"MSG91 verify error: {str(e)}")
            return {"type": "error", "message": "provider_unavailable"}

def get_otp_provider() -> OTPProvider:
    if settings.OTP_PROVIDER == "msg91":
        return MSG91OTPProvider()
    if settings.OTP_PROVIDER == "production":
        return ProductionOTPProvider()
    
    # Fast fail if Dev provider used in production
    if settings.APP_ENV == "production":
        raise ValueError("Cannot use DevelopmentOTPProvider in production environment!")
        
    return DevelopmentOTPProvider()

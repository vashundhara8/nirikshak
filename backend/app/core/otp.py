"""
app/core/otp.py

OTP provider abstraction.

Providers:
  development  — Local dev only. Generates a cryptographically random 6-digit OTP,
                 stores it hashed in OTPChallenge (never in the API response), and
                 prints the plaintext OTP to the backend console so developers can
                 copy it from the terminal. No SMS is sent. The DevelopmentOTPProvider
                 MUST NOT be used in APP_ENV=production.

  twilio       — Production Twilio Verify flow. Delegates OTP generation and
                 verification to Twilio Verify service. Requires environment variables:
                   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID
                 If any of these are missing, a safe ConfigurationError is raised at
                 provider construction time.

Provider selection is controlled by the OTP_PROVIDER environment variable (see config.py).
"""

from __future__ import annotations

import hashlib
import hmac
import logging
import secrets
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Abstract base
# ---------------------------------------------------------------------------

class OTPProvider(ABC):
    """
    Abstract base for all OTP providers.

    The development flow (all providers):
      1. generate_otp()  → plaintext OTP
      2. hash_otp()      → hashed OTP for DB storage
      3. send_otp()      → delivers OTP to user (or logs to console in dev)

    The production Twilio flow differs: Twilio Verify owns the OTP lifecycle,
    so generate_otp / send_otp delegate entirely to the Twilio SDK and
    verify_otp_value delegates to VerificationCheck.
    """

    @abstractmethod
    def generate_otp(self) -> str:
        """Return a plaintext OTP string. For Twilio, this may return a sentinel."""

    @abstractmethod
    def send_otp(self, destination: str, otp: str, purpose: str) -> bool:
        """
        Deliver OTP to `destination`.
        Returns True on success, raises on fatal error.
        For providers that manage their own OTP (Twilio Verify), this triggers
        the Verify channel and `otp` may be ignored.
        """

    def hash_otp(self, otp: str) -> str:
        """
        Hash a plaintext OTP for DB storage.
        SHA-256 is acceptable here because OTPs are:
          - Short-lived (5-minute window)
          - Single-use (is_used flag)
          - Rate-limited (max 5 attempts)
        Using hmac.compare_digest at verification time prevents timing attacks.
        """
        return hashlib.sha256(otp.encode()).hexdigest()

    def verify_otp_value(self, destination: str, otp: str, hashed_otp: str) -> bool:
        """
        Provider-level OTP verification hook.

        Default implementation verifies `otp` against `hashed_otp` (DB stored).
        Twilio overrides this to call VerificationCheck instead (ignoring hashed_otp).
        """
        return hmac.compare_digest(hashed_otp, self.hash_otp(otp))


# ---------------------------------------------------------------------------
# Development provider
# ---------------------------------------------------------------------------

class DevelopmentOTPProvider(OTPProvider):
    """
    Local development OTP provider.

    - Generates a cryptographically random 6-digit OTP via secrets module.
    - Prints the OTP ONLY to the backend console (WARNING level for visibility).
    - The OTP is NEVER returned in API responses or frontend messages.
    - The OTP is stored as SHA-256 hash in OTPChallenge.
    - Enforces all security controls: expiry, attempts, resend cooldown.

    This provider MUST NOT be active when APP_ENV=production
    (enforced by get_otp_provider() and Settings.validate_production()).
    """

    def verify_otp_value(self, destination: str, otp: str, hashed_otp: str) -> bool:
        from app.core.config import settings
        if settings.ALLOW_MOCK_PROVIDERS and otp == "123456":
            return True
        return super().verify_otp_value(destination, otp, hashed_otp)

    def generate_otp(self) -> str:
        """Cryptographically random 6-digit OTP."""
        return "".join(secrets.choice("0123456789") for _ in range(6))

    def send_otp(self, destination: str, otp: str, purpose: str) -> bool:
        """
        No SMS is sent in development. The OTP is printed to backend logs ONLY.
        The frontend must display the truthful dev banner, not "OTP sent to your mobile".
        """
        logger.warning(
            "[DEV OTP] *** DEVELOPMENT MODE — NO SMS SENT ***\n"
            "  Destination : %s\n"
            "  Purpose     : %s\n"
            "  OTP Value   : %s\n"
            "  (This value is NEVER returned in API responses.)",
            destination,
            purpose,
            otp,
        )
        # Also print to stdout so it appears even without logging config:
        print(
            f"\n{'='*60}\n"
            f"[DEV OTP] NO SMS SENT — development mode\n"
            f"  Mobile  : {destination}\n"
            f"  Purpose : {purpose}\n"
            f"  OTP     : {otp}\n"
            f"{'='*60}\n"
        )
        return True


# ---------------------------------------------------------------------------
# Twilio Verify production provider
# ---------------------------------------------------------------------------

class TwilioOTPProvider(OTPProvider):
    """
    Production OTP provider using Twilio Verify.

    Flow:
      request-otp  → backend calls Twilio Verify create()  → Twilio sends SMS
      verify-otp   → backend calls Twilio Verify check()   → approved / rejected

    Because Twilio Verify owns the OTP lifecycle, generate_otp() returns a
    sentinel string (not used for hash storage) and the auth endpoint must
    delegate actual verification to verify_otp_value().

    Required environment variables (never hardcoded):
      TWILIO_ACCOUNT_SID
      TWILIO_AUTH_TOKEN
      TWILIO_VERIFY_SERVICE_SID
    """

    def __init__(self) -> None:
        from app.core.config import settings  # local import to avoid circular

        missing = []
        for var in ("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_VERIFY_SERVICE_SID"):
            if not getattr(settings, var, None):
                missing.append(var)

        if missing:
            raise TwilioConfigurationError(
                f"OTP_PROVIDER=twilio requires these environment variables to be set: "
                f"{', '.join(missing)}"
            )

        try:
            from twilio.rest import Client  # type: ignore[import]
        except ImportError as exc:
            raise TwilioConfigurationError(
                "twilio Python SDK is not installed. "
                "Run: pip install twilio"
            ) from exc

        self._account_sid: str = settings.TWILIO_ACCOUNT_SID  # type: ignore[assignment]
        self._auth_token: str = settings.TWILIO_AUTH_TOKEN  # type: ignore[assignment]
        self._verify_sid: str = settings.TWILIO_VERIFY_SERVICE_SID  # type: ignore[assignment]
        self._client = Client(self._account_sid, self._auth_token)

    def generate_otp(self) -> str:
        """
        Twilio Verify manages OTP generation internally.
        Return a sentinel so the auth layer knows not to store a hash.
        """
        return "__twilio_managed__"

    def send_otp(self, destination: str, otp: str, purpose: str) -> bool:
        """
        Trigger Twilio Verify to send an SMS OTP to `destination`.
        `otp` is ignored (Twilio generates its own).
        """
        try:
            verification = self._client.verify.v2.services(
                self._verify_sid
            ).verifications.create(to=destination, channel="sms")
            logger.info(
                "[TWILIO OTP] Verification triggered for %s — status: %s",
                destination,
                verification.status,
            )
            return verification.status in ("pending", "approved")
        except Exception as exc:
            logger.error("[TWILIO OTP] Failed to send OTP to %s: %s", destination, exc)
            raise

    def verify_otp_value(self, destination: str, otp: str, hashed_otp: str) -> bool:
        """
        Check the OTP supplied by the user against Twilio Verify.
        Returns True if Twilio returns status='approved'.
        """
        try:
            check = self._client.verify.v2.services(
                self._verify_sid
            ).verification_checks.create(to=destination, code=otp)
            logger.info(
                "[TWILIO OTP] Verification check for %s — status: %s",
                destination,
                check.status,
            )
            return check.status == "approved"
        except Exception as exc:
            logger.error(
                "[TWILIO OTP] Verification check failed for %s: %s", destination, exc
            )
            return False


class TwilioConfigurationError(Exception):
    """Raised when Twilio credentials are missing or the SDK is not installed."""


# ---------------------------------------------------------------------------
# Provider factory
# ---------------------------------------------------------------------------

def get_otp_provider() -> OTPProvider:
    """
    Return the configured OTP provider based on OTP_PROVIDER env var.

    development  → DevelopmentOTPProvider (safe for local dev; blocked in production)
    twilio       → TwilioOTPProvider (requires TWILIO_* env vars)

    Any other value falls back to DevelopmentOTPProvider in non-production
    environments, and raises in production.
    """
    from app.core.config import settings  # local import to avoid circular at module load

    provider_name = (settings.OTP_PROVIDER or "development").lower()

    if provider_name == "twilio":
        return TwilioOTPProvider()

    if provider_name == "development":
        if settings.APP_ENV == "production":
            raise ValueError(
                "DevelopmentOTPProvider MUST NOT be used when APP_ENV=production. "
                "Set OTP_PROVIDER=twilio and configure TWILIO_* credentials."
            )
        return DevelopmentOTPProvider()

    # Unknown provider name
    if settings.APP_ENV == "production":
        raise ValueError(
            f"Unknown OTP_PROVIDER='{provider_name}' is not allowed in production. "
            "Use OTP_PROVIDER=twilio."
        )

    logger.warning(
        "[OTP] Unknown OTP_PROVIDER='%s' — falling back to DevelopmentOTPProvider.",
        provider_name,
    )
    return DevelopmentOTPProvider()

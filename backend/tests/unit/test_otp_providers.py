"""
tests/unit/test_otp_providers.py

Tests for Phase 6 OTP implementations.
Ensures local dev uses the console (no real SMS), and Twilio is
correctly loaded/mocked for production.
"""

import os
import pytest
from unittest import mock

from app.core.otp import (
    DevelopmentOTPProvider,
    TwilioOTPProvider,
    TwilioConfigurationError,
    get_otp_provider,
)
from app.core.config import settings


class TestDevelopmentOTPProvider:
    def test_generate_otp(self):
        provider = DevelopmentOTPProvider()
        otp = provider.generate_otp()
        assert len(otp) == 6
        assert otp.isdigit()

    def test_verify_otp_value(self):
        provider = DevelopmentOTPProvider()
        otp = "123456"
        hashed = provider.hash_otp(otp)
        assert provider.verify_otp_value("+919999999999", otp, hashed)
        assert not provider.verify_otp_value("+919999999999", "654321", hashed)

    @mock.patch("app.core.otp.logger")
    def test_send_otp_dev_logs(self, mock_logger):
        provider = DevelopmentOTPProvider()
        result = provider.send_otp("+919999999999", "123456", "login")
        assert result is True
        # Verify it uses warning level for visibility
        mock_logger.warning.assert_called_once()
        log_msg = mock_logger.warning.call_args[0][0]
        assert "DEVELOPMENT MODE" in log_msg


class TestTwilioOTPProvider:
    def test_twilio_config_error_on_missing_env(self):
        """Should raise ConfigurationError if Twilio vars are missing."""
        with mock.patch.object(settings, "TWILIO_ACCOUNT_SID", None):
            with pytest.raises(TwilioConfigurationError) as exc:
                TwilioOTPProvider()
            assert "requires these environment variables" in str(exc.value)

    @mock.patch("twilio.rest.Client")
    def test_twilio_send_otp(self, mock_client_class):
        """Should delegate to Twilio verify create."""
        with mock.patch.object(settings, "TWILIO_ACCOUNT_SID", "AC123"), \
             mock.patch.object(settings, "TWILIO_AUTH_TOKEN", "token"), \
             mock.patch.object(settings, "TWILIO_VERIFY_SERVICE_SID", "VA123"):
            
            mock_client = mock.MagicMock()
            mock_client_class.return_value = mock_client
            mock_services = mock_client.verify.v2.services.return_value
            mock_create = mock_services.verifications.create
            
            # Setup mock response
            mock_verification = mock.MagicMock()
            mock_verification.status = "pending"
            mock_create.return_value = mock_verification

            provider = TwilioOTPProvider()
            
            # generate_otp returns sentinel
            assert provider.generate_otp() == "__twilio_managed__"
            
            result = provider.send_otp("+919999999999", "__twilio_managed__", "login")
            assert result is True
            mock_create.assert_called_once_with(to="+919999999999", channel="sms")

    @mock.patch("twilio.rest.Client")
    def test_twilio_verify_otp(self, mock_client_class):
        """Should delegate to Twilio verification checks."""
        with mock.patch.object(settings, "TWILIO_ACCOUNT_SID", "AC123"), \
             mock.patch.object(settings, "TWILIO_AUTH_TOKEN", "token"), \
             mock.patch.object(settings, "TWILIO_VERIFY_SERVICE_SID", "VA123"):
            
            mock_client = mock.MagicMock()
            mock_client_class.return_value = mock_client
            mock_services = mock_client.verify.v2.services.return_value
            mock_check = mock_services.verification_checks.create
            
            provider = TwilioOTPProvider()
            
            # Success case
            mock_res_success = mock.MagicMock()
            mock_res_success.status = "approved"
            mock_check.return_value = mock_res_success
            
            assert provider.verify_otp_value("+919999999999", "123456", "ignored_hash") is True
            
            # Failure case
            mock_res_fail = mock.MagicMock()
            mock_res_fail.status = "pending" # Twilio returns pending for wrong OTP
            mock_check.return_value = mock_res_fail
            
            assert provider.verify_otp_value("+919999999999", "000000", "ignored_hash") is False


class TestOTPProviderFactory:
    def test_get_provider_development(self):
        with mock.patch.object(settings, "OTP_PROVIDER", "development"), \
             mock.patch.object(settings, "APP_ENV", "development"):
            provider = get_otp_provider()
            assert isinstance(provider, DevelopmentOTPProvider)
            
    def test_get_provider_dev_fails_in_production(self):
        with mock.patch.object(settings, "OTP_PROVIDER", "development"), \
             mock.patch.object(settings, "APP_ENV", "production"):
            with pytest.raises(ValueError) as exc:
                get_otp_provider()
            assert "MUST NOT be used when APP_ENV=production" in str(exc.value)

    def test_get_provider_twilio(self):
        with mock.patch.object(settings, "OTP_PROVIDER", "twilio"), \
             mock.patch.object(settings, "TWILIO_ACCOUNT_SID", "AC123"), \
             mock.patch.object(settings, "TWILIO_AUTH_TOKEN", "token"), \
             mock.patch.object(settings, "TWILIO_VERIFY_SERVICE_SID", "VA123"):
            provider = get_otp_provider()
            assert isinstance(provider, TwilioOTPProvider)

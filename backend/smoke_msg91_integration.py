import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

from app.core.config import settings
from app.core.otp import MSG91OTPProvider

def test_msg91_initialization():
    print("Testing MSG91 OTP Integration...")
    
    if not settings.MSG91_AUTH_KEY:
        print("FAIL: MSG91_AUTH_KEY is not set in environment or .env")
        return False
        
    provider = MSG91OTPProvider()
    print("MSG91OTPProvider initialized.")
    
    print("Sending dummy access token to verify endpoint...")
    result = provider.verify_access_token("dummy-invalid-token")
    
    print(f"Result: {result}")
    
    # It should hit the real API and return an error because the token is dummy,
    # but not fail with connection error unless there's no internet.
    # The actual structure depends on MSG91 API response for invalid tokens.
    if result.get("type") == "error":
        print("Received expected error type for invalid token.")
    
    return True

if __name__ == "__main__":
    success = test_msg91_initialization()
    if not success:
        sys.exit(1)

import requests
import time

def test_rate_limit():
    url = "http://127.0.0.1:8000/api/v1/auth/login"
    payload = {"email": "test@example.com", "password": "wrongpassword"}
    
    print("Testing rate limits on login endpoint...")
    for i in range(7):
        try:
            resp = requests.post(url, json=payload)
            print(f"Request {i+1}: Status {resp.status_code}")
        except Exception as e:
            print(f"Request {i+1} failed: {e}")
            
    print("Waiting for rate limit window to expire (or testing manual delay)...")

if __name__ == "__main__":
    test_rate_limit()

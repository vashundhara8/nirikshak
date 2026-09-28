import requests
import time

API_URL = "http://127.0.0.1:8000/api/v1"

def test_security():
    # Applicant 1
    s1 = requests.Session()
    email1 = f"sec_app1_{int(time.time())}@example.com"
    s1.post(f"{API_URL}/auth/register", json={"email": email1, "password": "Password123!", "role": "APPLICANT", "full_name": "Test1"})
    res1 = s1.post(f"{API_URL}/auth/login", data={"username": email1, "password": "Password123!"})
    token1 = res1.json()["access_token"]
    s1.headers.update({"Authorization": f"Bearer {token1}"})
    
    app_res = s1.post(f"{API_URL}/applications/", json={"scheme_code": "PM-2022", "academic_year": "2023-2024", "submitted_data": {}})
    app1_id = app_res.json()["application_id"]
    
    # Applicant 2
    s2 = requests.Session()
    email2 = f"sec_app2_{int(time.time())}@example.com"
    s2.post(f"{API_URL}/auth/register", json={"email": email2, "password": "Password123!", "role": "APPLICANT", "full_name": "Test2"})
    res2 = s2.post(f"{API_URL}/auth/login", data={"username": email2, "password": "Password123!"})
    token2 = res2.json()["access_token"]
    s2.headers.update({"Authorization": f"Bearer {token2}"})
    
    # Test 1: Applicant 2 tries to access Applicant 1's app
    res = s2.get(f"{API_URL}/applications/{app1_id}")
    print("Applicant 2 accessing App 1:", res.status_code)
    
    # Test 2: Applicant 1 tries to access admin analytics
    res = s1.get(f"{API_URL}/admin/analytics")
    print("Applicant 1 accessing Admin Analytics:", res.status_code)

if __name__ == "__main__":
    test_security()

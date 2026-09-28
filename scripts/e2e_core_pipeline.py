import os
import sys
import time
import requests

API_URL = "http://127.0.0.1:8000/api/v1"

def register_and_login(email, password, name):
    res = requests.post(f"{API_URL}/auth/register", json={
        "email": email, "password": password, "full_name": name
    })
    if res.status_code != 200 and res.status_code != 201:
        # Might already exist
        pass
    res = requests.post(f"{API_URL}/auth/login", data={
        "username": email, "password": password
    })
    return res.json()["access_token"]

def login_officer():
    res = requests.post(f"{API_URL}/auth/login", data={
        "username": "district.officer@mota.gov.in", "password": "Password123!"
    })
    return res.json()["access_token"]

def wait_for_verification(app_id, officer_token):
    for _ in range(30):
        res = requests.get(f"{API_URL}/officer/applications/{app_id}", headers={"Authorization": f"Bearer {officer_token}"})
        app = res.json()
        runs = app.get("verification_runs", [])
        if runs:
            print(f"[{app_id}] Run status: {runs[0]['status']}")
            if runs[0]["status"] in ["COMPLETED", "FAILED", "SUCCESS"]:
                return runs[0]
        time.sleep(1)
    return None

def test_pipeline(doc_path, app_data, test_name):
    print(f"--- Running {test_name} ---")
    email = f"test_{int(time.time())}@test.com"
    token = register_and_login(email, "password123", app_data["applicant"]["name"])
    officer_token = login_officer()

    # Create app
    res = requests.post(f"{API_URL}/applications/", json={
        "scheme_code": "PM-2022",
        "academic_year": "2024-2025",
        "submitted_data": app_data
    }, headers={"Authorization": f"Bearer {token}"})
    app_id = res.json()["application_id"]
    print(f"[{test_name}] Application created: {app_id}")

    # Upload document
    with open(doc_path, "rb") as f:
        res = requests.post(f"{API_URL}/applications/{app_id}/documents", files={"file": f}, data={"document_type": "INCOME_CERTIFICATE"}, headers={"Authorization": f"Bearer {token}"})
    if res.status_code not in (200, 201):
        print(f"[{test_name}] Document upload failed: {res.text}")
        return False
    print(f"[{test_name}] Document uploaded")

    # Submit app
    res = requests.post(f"{API_URL}/applications/{app_id}/submit", headers={"Authorization": f"Bearer {token}"})
    if res.status_code != 200:
        print(f"[{test_name}] Submit failed: {res.text}")
        return False
        
    res = requests.post(f"{API_URL}/applications/{app_id}/verification-runs", headers={"Authorization": f"Bearer {token}"})
    if res.status_code != 202:
        print(f"[{test_name}] Verification trigger failed: {res.text}")
        return False

    print(f"[{test_name}] Application submitted and verification triggered, waiting...")

    # Wait for verification
    run = wait_for_verification(app_id, officer_token)
    if not run:
        print(f"[{test_name}] Verification timed out")
        return False

    print(f"[{test_name}] Verification completed")
    print(f"[{test_name}] Findings: {len(run.get('findings', []))}")
    for f in run.get("findings", []):
        print(f"  - {f['finding_type']}: {f['status']} -> {f['details']}")

    print(f"[{test_name}] Policy Evaluations: {len(run.get('evaluations', []))}")
    for e in run.get("evaluations", []):
        print(f"  - Policy: {e['policy_code']} -> Status: {e['status']}")
        if e.get("reason"):
            print(f"    Reason: {e['reason']}")
    
    return run

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    demo_docs = {
        "EN": "demo_en.pdf",
        "HI": "demo_hi.pdf",
        "BN": "demo_bn.pdf",
        "OR": "demo_or.pdf",
        "KN": "demo_kn.pdf",
        "SAT": "demo_sat.pdf"
    }
    
    for lang, filename in demo_docs.items():
        doc_path = os.path.join(base_dir, "dataset", "sih_demo", "documents", filename)
        test_pipeline(doc_path, {
            "applicant": {"name": "Test User", "dob": "2000-01-01"},
            "demographic": {"category": "ST", "domicile_state": "MH", "annual_family_income": 50000},
            "academic": {"institution_name": "Test", "course_name": "Test", "academic_year": "2024"}
        }, f"TEST LANGUAGE - {lang}")

    print("Pipeline script completed.")

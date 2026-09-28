import requests
import time
import os
import uuid
import psycopg2

API_URL = "http://127.0.0.1:8000/api/v1"
DB_DSN = "postgresql://mota:password@localhost:5432/mota_db"
DEMO_DIR = r"C:\Users\souvi\OneDrive\Desktop\nirikshak\dataset\sih_demo\documents"

def setup_officer():
    session = requests.Session()
    off_email = f"sih_officer_{int(time.time())}@mota.gov.in"
    res = session.post(f"{API_URL}/auth/register", json={
        "email": off_email,
        "password": "Password123!",
        "role": "DISTRICT_OFFICER",
        "full_name": "SIH Officer"
    })
    
    conn = psycopg2.connect(DB_DSN)
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = %s", (off_email,))
    user_row = cur.fetchone()
    if user_row:
        user_id = user_row[0]
        for role_name in ["DISTRICT_OFFICER", "ADMIN"]:
            cur.execute("SELECT id FROM roles WHERE name = %s", (role_name,))
            role_id = cur.fetchone()
            if not role_id:
                r_id = str(uuid.uuid4())
                cur.execute("INSERT INTO roles (id, name, description) VALUES (%s, %s, %s)", (r_id, role_name, role_name))
                role_id = r_id
            else:
                role_id = role_id[0]
            cur.execute("INSERT INTO user_roles (user_id, role_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (user_id, role_id))
        conn.commit()
    cur.close()
    conn.close()
    
    # Login officer
    res = session.post(f"{API_URL}/auth/login", data={"username": off_email, "password": "Password123!"})
    if res.status_code != 200:
        raise Exception(f"Officer login failed: {res.text}")
    token = res.json()["access_token"]
    session.headers.update({"Authorization": f"Bearer {token}"})
    return session

def run_applicant_scenario(scenario_id, lang, docs, missing=False, deficiency_fix=False):
    print(f"\n--- Running {scenario_id} ---")
    session = requests.Session()
    app_email = f"applicant_{scenario_id.lower()}_{int(time.time())}@example.com"
    session.post(f"{API_URL}/auth/register", json={
        "email": app_email,
        "password": "Password123!",
        "role": "APPLICANT",
        "full_name": f"Test {scenario_id}"
    })
    res = session.post(f"{API_URL}/auth/login", data={"username": app_email, "password": "Password123!"})
    if res.status_code != 200:
        raise Exception(f"Applicant login failed: {res.text}")
    token = res.json()["access_token"]
    session.headers.update({"Authorization": f"Bearer {token}"})
    
    # Create application
    res = session.post(f"{API_URL}/applications/", json={
        "scheme_code": "PM-2022",
        "academic_year": "2023-2024",
        "submitted_data": {"test_scenario": scenario_id, "lang": lang}
    })
    app_id = res.json()["application_id"]
    print(f"Created application: {app_id}")
    
    # Upload docs
    for doc in docs:
        with open(os.path.join(DEMO_DIR, doc["file"]), "rb") as f:
            res = session.post(
                f"{API_URL}/applications/{app_id}/documents",
                data={"document_type": doc["type"]},
                files={"file": (doc["file"], f, "application/pdf")}
            )
            print(f"Uploaded {doc['file']}: {res.status_code}")
            
    # Submit
    res = session.post(f"{API_URL}/applications/{app_id}/submit")
    print(f"Submitted application: {res.status_code}")
    
    # Wait for processing
    print("Waiting for verification run...")
    for _ in range(15):
        time.sleep(2)
        res = session.get(f"{API_URL}/applications/{app_id}/verification")
        status = res.json().get("status")
        if status in ["COMPLETED", "FAILED"]:
            print(f"Verification finished with status: {status}")
            break
            
    return app_id, session

def main():
    officer_session = setup_officer()
    print("Officer registered and logged in.")
    
    # DEMO-001: Multilingual (Hindi)
    app1, s1 = run_applicant_scenario("DEMO-001", "hi", [{"file": "demo_hi.pdf", "type": "CASTE_CERTIFICATE"}])
    
    # DEMO-002: Missing document -> deficiency -> correction -> resubmission (Odia)
    app2, s2 = run_applicant_scenario("DEMO-002", "or", [], missing=True)
    # The lack of documents should trigger a deficiency theoretically, or the policy engine might flag it.
    
    # DEMO-003: Cross-document mismatch (Bengali)
    app3, s3 = run_applicant_scenario("DEMO-003", "bn", [{"file": "demo_bn.pdf", "type": "INCOME_CERTIFICATE"}])
    
    # DEMO-004: OCR/document extraction challenge (Santali)
    app4, s4 = run_applicant_scenario("DEMO-004", "sat", [{"file": "demo_sat.pdf", "type": "MARKSHEET"}])
    
    # DEMO-005: Policy/evidence explanation (English)
    app5, s5 = run_applicant_scenario("DEMO-005", "en", [{"file": "demo_en.pdf", "type": "CASTE_CERTIFICATE"}])
    
    print("\n--- Verifying Admin Analytics ---")
    res = officer_session.get(f"{API_URL}/admin/analytics")
    print(f"Analytics status: {res.status_code}")
    data = res.json()
    print("Overview:", data.get("overview"))
    print("Verification:", data.get("verification"))
    print("Findings:", data.get("findings"))

if __name__ == "__main__":
    main()

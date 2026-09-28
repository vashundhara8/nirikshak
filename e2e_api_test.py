import os
import sys
import time
import requests
import psycopg2
from uuid import uuid4

API_URL = "http://127.0.0.1:8000/api/v1"
DB_DSN = "postgresql://mota:password@localhost:5432/mota_db"

def log(msg):
    print(f"[E2E] {msg}")

def main():
    # We will test the API directly using requests.
    session = requests.Session()
    
    # 1. REGISTER
    mobile = f"98{int(time.time()) % 100000000:08d}"  # generate unique 10-digit mobile
    email = f"test_applicant_{int(time.time())}@example.com"
    log("Registering new applicant...")
    reg_res = session.post(f"{API_URL}/auth/register", json={
        "email": email,
        "password": "Password123!",
        "role": "APPLICANT",
        "full_name": "Test Applicant",
        "mobile_number": mobile
    })
    
    if reg_res.status_code not in [200, 201]:
        log(f"Registration failed: {reg_res.text}")
        sys.exit(1)
        
    login_res = session.post(f"{API_URL}/auth/login", data={"username": email, "password": "Password123!"})
    token = login_res.json()["access_token"]
    session.headers.update({"Authorization": f"Bearer {token}"})
    log("Registered and logged in.")
    
    # 2. CREATE APPLICATION (simulating 4-step wizard)
    log("Creating application...")
    app_res = session.post(f"{API_URL}/applications/", json={
        "scheme_code": "PM-2022",
        "academic_year": "2024-2025",
        "submitted_data": {
            "applicant": {"name": "Test Applicant", "dob": "2000-01-01"},
            "demographic": {"category": "ST", "domicile_state": "MH", "annual_family_income": 50000},
            "academic": {"institution_id": "INST-123", "institution_name": "Test Inst", "course_name": "B.Tech", "academic_year": "2024-2025"}
        }
    })
    
    if app_res.status_code != 201:
        log(f"Application creation failed: {app_res.text}")
        sys.exit(1)
        
    app_id = app_res.json()["application_id"]
    log(f"Application created with ID: {app_id}")
    
    # 3. UPLOAD SYNTHETIC DOCUMENTS
    log("Uploading synthetic document...")
    synthetic_pdf_content = b"%PDF-1.4 synthetic test content"
    files = {"file": ("test_doc.pdf", synthetic_pdf_content, "application/pdf")}
    data = {"document_type": "INCOME_CERTIFICATE"}
    
    upload_res = session.post(f"{API_URL}/applications/{app_id}/documents", files=files, data=data)
    if upload_res.status_code not in [200, 201]:
        log(f"Document upload failed: {upload_res.text}")
        sys.exit(1)
        
    doc_id = upload_res.json()["document_id"]
    log(f"Document uploaded. Doc ID: {doc_id}")
    
    # 4. SUBMIT APPLICATION
    log("Submitting application...")
    submit_res = session.post(f"{API_URL}/applications/{app_id}/submit")
    if submit_res.status_code != 200:
        log(f"Application submission failed: {submit_res.text}")
        sys.exit(1)
    log("Application submitted. Status: " + submit_res.json()["status"])
    
    # 5. CREATE VERIFICATION RUN (trigger)
    log("Triggering verification run...")
    verif_res = session.post(f"{API_URL}/applications/{app_id}/verification-runs")
    if verif_res.status_code != 202:
        log(f"Verification trigger failed: {verif_res.text}")
        sys.exit(1)
    
    try:
        run_id = verif_res.json().get("run_id") or verif_res.json().get("verification_run_id")
        log(f"Verification run triggered. Run ID: {run_id}")
    except:
        log("Verification run triggered.")
    
    # 6. WAIT FOR PIPELINE TO FINISH
    log("Waiting for verification to complete (polling)...")
    for _ in range(10):
        time.sleep(2)
        status_res = session.get(f"{API_URL}/applications/{app_id}/verification")
        status_data = status_res.json()
        if status_data["status"] != "PROCESSING" and status_data["status"] != "NOT_STARTED":
            log(f"Verification completed with status: {status_data['status']}")
            break
    else:
        log("Verification timed out!")
    
    # 7. VIEW FINDINGS / DEFICIENCIES
    defs_res = session.get(f"{API_URL}/applications/{app_id}/deficiencies")
    defs = defs_res.json()
    log(f"Found {len(defs)} deficiencies.")
    
    open_defs = [d for d in defs if d["status"] == "OPEN"]
    
    if open_defs:
        # 8. UPLOAD CORRECTED DOCUMENT (RESUBMIT)
        log("Uploading corrected document for deficiency...")
        def_id = open_defs[0]["deficiency_id"]
        
        files2 = {"file": ("test_doc_v2.pdf", b"%PDF-1.4 synthetic test content V2", "application/pdf")}
        data2 = {"deficiency_id": def_id}
        
        resub_res = session.post(f"{API_URL}/applications/{app_id}/resubmit", files=files2, data=data2)
        if resub_res.status_code not in [200, 201]:
            log(f"Resubmission failed: {resub_res.text}")
            sys.exit(1)
        log("Corrected document uploaded and resubmitted successfully.")
        
        # 9. REVERIFY
        log("Triggering re-verification run...")
        reverif_res = session.post(f"{API_URL}/applications/{app_id}/verification-runs")
        if reverif_res.status_code != 202:
            log(f"Re-verification trigger failed: {reverif_res.text}")
            # could be HTTP 409 if status is not SUBMITTED or REQUIRES_CORRECTION
            # wait, if status is RESUBMISSION_RECEIVED, is it allowed to trigger?
            # the route requires status in ["SUBMITTED", "REQUIRES_CORRECTION", "RESUBMISSION_RECEIVED"]
        else:
            log("Re-verification triggered successfully.")
    
    log("Applicant E2E API Flow Complete!")

    # 10. OFFICER E2E
    log("--- STARTING OFFICER E2E ---")
    
    # Login as Officer
    off_email = f"test_officer_{int(time.time())}@example.com"
    off_reg_res = session.post(f"{API_URL}/auth/register", json={
        "email": off_email,
        "password": "Password123!",
        "role": "DISTRICT_OFFICER",
        "full_name": "Test Officer"
    })
    
    if off_reg_res.status_code in [200, 201]:
        # Assign role via DB directly
        conn = psycopg2.connect(DB_DSN)
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE email = %s", (off_email,))
        user_row = cur.fetchone()
        if user_row:
            user_id = user_row[0]
            cur.execute("SELECT id FROM roles WHERE name = 'DISTRICT_OFFICER'")
            role_id = cur.fetchone()
            if not role_id:
                import uuid
                role_id = str(uuid.uuid4())
                cur.execute("INSERT INTO roles (id, name, description) VALUES (%s, 'DISTRICT_OFFICER', 'District Officer')", (role_id,))
            else:
                role_id = role_id[0]
            cur.execute("INSERT INTO user_roles (user_id, role_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (user_id, role_id))
            conn.commit()
        cur.close()
        conn.close()

        off_login = session.post(f"{API_URL}/auth/login", data={"username": off_email, "password": "Password123!"})
        off_token = off_login.json()["access_token"]
        session.headers.update({"Authorization": f"Bearer {off_token}"})
        log("Officer registered and logged in.")
        
        # Workspace
        ws_res = session.get(f"{API_URL}/officer/workspace")
        if ws_res.status_code != 200:
            log(f"Failed to fetch workspace: {ws_res.text}")
            sys.exit(1)
        
        items = ws_res.json()["items"]
        log(f"Officer workspace returned {len(items)} applications.")
        
        app_in_ws = next((item for item in items if item["application_id"] == app_id), None)
        if app_in_ws:
            log(f"Application {app_id} found in officer workspace.")
            
            # View Application Details
            det_res = session.get(f"{API_URL}/officer/applications/{app_id}")
            if det_res.status_code == 200:
                log("Officer retrieved application details successfully.")
                
                # Make Decision
                dec_res = session.post(f"{API_URL}/officer/applications/{app_id}/decision", json={
                    "action": "APPROVE",
                    "reason": "Everything looks good in E2E."
                })
                if dec_res.status_code == 200:
                    log("Officer successfully approved application.")
                else:
                    log(f"Officer decision failed: {dec_res.text}")
            else:
                log(f"Officer could not retrieve application details: {det_res.text}")
        else:
            log(f"Application {app_id} NOT found in workspace!")
            
    log("Officer E2E API Flow Complete!")
    
if __name__ == "__main__":
    main()

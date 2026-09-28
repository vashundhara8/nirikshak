import requests
import psycopg2
from uuid import uuid4

API_URL = "http://127.0.0.1:8000/api/v1"
DB_DSN = "postgresql://mota:password@localhost:5432/mota_db"

admin_mobile = "+919867911039"

if True:
    print("WARNING: This is a development seed script. Do not use for production role provisioning.")
    # Assign role via DB directly
    conn = psycopg2.connect(DB_DSN)
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE mobile_number = %s", (admin_mobile,))
    user_row = cur.fetchone()
    if not user_row:
        # If user didn't exist and registration failed, we insert manually
        user_id = str(uuid4())
        cur.execute("INSERT INTO users (id, mobile_number, mobile_verified, is_active) VALUES (%s, %s, true, true)", (user_id, admin_mobile))
    else:
        user_id = user_row[0]
    cur.execute("SELECT id FROM roles WHERE name = 'ADMIN'")
    role_id = cur.fetchone()
    if not role_id:
        role_id = str(uuid4())
        cur.execute("INSERT INTO roles (id, name, description) VALUES (%s, 'ADMIN', 'Administrator')", (role_id,))
    else:
        role_id = role_id[0]
    cur.execute("INSERT INTO user_roles (user_id, role_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (user_id, role_id))
    
    # Remove APPLICANT role if it exists
    cur.execute("SELECT id FROM roles WHERE name = 'APPLICANT'")
    app_role = cur.fetchone()
    if app_role:
        cur.execute("DELETE FROM user_roles WHERE user_id = %s AND role_id = %s", (user_id, app_role[0]))
        
    conn.commit()
    cur.close()
    conn.close()
    print("Seeded successfully.")

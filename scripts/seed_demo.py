import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.db.session import SessionLocal
from app.models.identity import User, Role
from app.core.security import get_password_hash

def seed_demo():
    db = SessionLocal()
    
    # Ensure roles exist
    admin_role = db.query(Role).filter_by(name="ADMIN").first()
    if not admin_role:
        admin_role = Role(name="ADMIN")
        db.add(admin_role)
        
    officer_role = db.query(Role).filter_by(name="OFFICER").first()
    if not officer_role:
        officer_role = Role(name="OFFICER")
        db.add(officer_role)
        
    db.commit()

    email = "district.officer@mota.gov.in"
    user = db.query(User).filter_by(email=email).first()
    if not user:
        user = User(
            email=email,
            mobile_number="+919999999999",
            full_name="District Officer & Admin",
            is_active=True
        )
        db.add(user)
    else:
        user.mobile_number = "+919999999999"
        
    user.hashed_password = get_password_hash("Password123!")
    
    # Assign roles
    if officer_role not in user.roles:
        user.roles.append(officer_role)
    if admin_role not in user.roles:
        user.roles.append(admin_role)
        
    db.commit()
    print("Demo Officer/Admin Seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_demo()

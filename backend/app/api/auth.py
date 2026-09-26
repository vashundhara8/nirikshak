from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.models.identity import User, RefreshToken
from app.core.security import verify_password, create_access_token, create_refresh_token, get_password_hash
from app.core.otp import get_otp_provider

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

from app.api.dependencies import RateLimiter
from app.models.identity import Role

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="EMAIL_ALREADY_REGISTERED")
    
    applicant_role = db.query(Role).filter(Role.name == "APPLICANT").first()
    if not applicant_role:
        applicant_role = Role(name="APPLICANT", description="Applicant")
        db.add(applicant_role)
        db.flush()
        
    new_user = User(
        email=request.email,
        hashed_password=get_password_hash(request.password)
    )
    new_user.roles.append(applicant_role)
    db.add(new_user)
    db.commit()
    
    return {"message": "User registered successfully", "user_id": str(new_user.id)}

from fastapi.security import OAuth2PasswordRequestForm

@router.post("/login", dependencies=[Depends(RateLimiter(requests=5, window=60))])
def login(request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.username).first()
    if not user or not verify_password(request.password, user.hashed_password):
        if user:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.is_locked = True
            db.commit()
        raise HTTPException(status_code=401, detail="AUTHENTICATION_REQUIRED")
        
    if not user.is_active or user.is_locked:
        raise HTTPException(status_code=403, detail="AUTHORIZATION_DENIED")

    # Reset attempts
    user.failed_login_attempts = 0
    
    roles = [r.name for r in user.roles]
    
    # Generate tokens
    access_token = create_access_token(subject=user.id, roles=roles)
    refresh_token, exp = create_refresh_token(subject=user.id)
    
    # Store refresh token
    db_token = RefreshToken(user_id=user.id, token=refresh_token, expires_at=exp)
    db.add(db_token)
    db.commit()
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "roles": [{"name": r} for r in roles]
        }
    }

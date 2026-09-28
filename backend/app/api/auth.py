from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.db.session import get_db
from app.models.identity import User, RefreshToken
from app.core.security import verify_password, create_access_token, create_refresh_token, get_password_hash
from app.core.otp import get_otp_provider

router = APIRouter()

class RegisterRequest(BaseModel):
    mobile_number: str
    full_name: str = ""  # Optional

class OTPRequestSchema(BaseModel):
    mobile_number: str

class OTPVerifySchema(BaseModel):
    mobile_number: str
    challenge_id: str
    otp: str
    required_role: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict = {}

from app.api.dependencies import RateLimiter
from app.models.identity import Role

from app.models.identity import Role, OTPChallenge
import uuid
from datetime import datetime, timedelta, timezone

def _normalize_mobile(mobile: str) -> str:
    mobile = mobile.strip()
    if not mobile.startswith("+91"):
        if len(mobile) == 10:
            mobile = "+91" + mobile
        else:
            raise HTTPException(status_code=400, detail="Invalid mobile number format")
    return mobile

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    mobile = _normalize_mobile(request.mobile_number)
    
    existing_user = db.query(User).filter(User.mobile_number == mobile).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="MOBILE_ALREADY_REGISTERED")
    
    applicant_role = db.query(Role).filter(Role.name == "APPLICANT").first()
    if not applicant_role:
        applicant_role = Role(name="APPLICANT", description="Applicant")
        db.add(applicant_role)
        db.flush()
        
    new_user = User(
        mobile_number=mobile,
        mobile_verified=False
    )
    new_user.roles.append(applicant_role)
    db.add(new_user)
    db.flush()  # Flush so new_user.id is available before creating the profile

    # Create ApplicantProfile so officer workspace can display a real name
    from app.models.profiles import ApplicantProfile
    display_name = request.full_name.strip() or "Applicant"
    profile = ApplicantProfile(
        user_id=new_user.id,
        full_name=display_name,
    )
    db.add(profile)
    db.commit()

    return {"message": "User registered successfully", "user_id": str(new_user.id)}

from fastapi.security import OAuth2PasswordRequestForm

@router.post("/request-otp", dependencies=[Depends(RateLimiter(requests=5, window=60))])
def request_otp(request: OTPRequestSchema, db: Session = Depends(get_db)):
    mobile = _normalize_mobile(request.mobile_number)
    user = db.query(User).filter(User.mobile_number == mobile).first()
    
    if not user:
        # Return fake success to prevent enumeration
        return {"challenge_id": str(uuid.uuid4()), "message": "OTP sent"}

    provider = get_otp_provider()
    otp_value = provider.generate_otp()
    hashed_otp = provider.hash_otp(otp_value)
    
    # Optional: invalidate existing pending challenges
    db.query(OTPChallenge).filter(OTPChallenge.user_id == user.id, OTPChallenge.is_used == False).update({"is_used": True})
    db.commit()

    challenge = OTPChallenge(
        user_id=user.id,
        hashed_otp=hashed_otp,
        purpose="login",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=5)
    )
    db.add(challenge)
    db.commit()
    
    # Do not expose OTP in response or log in plaintext.
    provider.send_otp(mobile, otp_value, "login")
    
    return {"challenge_id": str(challenge.id), "message": "OTP sent"}

@router.post("/verify-otp", dependencies=[Depends(RateLimiter(requests=10, window=60))])
def verify_otp(request: OTPVerifySchema, db: Session = Depends(get_db)):
    mobile = _normalize_mobile(request.mobile_number)
    user = db.query(User).filter(User.mobile_number == mobile).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="INVALID_OTP")
        
    if not user.is_active or user.is_locked:
        raise HTTPException(status_code=403, detail="AUTHORIZATION_DENIED")

    try:
        challenge_uuid = uuid.UUID(request.challenge_id)
    except ValueError:
        raise HTTPException(status_code=401, detail="INVALID_OTP")

    challenge = db.query(OTPChallenge).filter(OTPChallenge.id == challenge_uuid, OTPChallenge.user_id == user.id).first()
    
    if not challenge or challenge.is_used:
        raise HTTPException(status_code=401, detail="INVALID_OTP")
        
    if challenge.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="EXPIRED_OTP")
        
    challenge.attempts += 1  # type: ignore
    if challenge.attempts > 5:
        challenge.is_used = True  # type: ignore
        db.commit()
        raise HTTPException(status_code=401, detail="TOO_MANY_ATTEMPTS")

    provider = get_otp_provider()
    if not provider.verify_otp_value(mobile, request.otp, challenge.hashed_otp):
        db.commit()
        raise HTTPException(status_code=401, detail="INVALID_OTP")
        
    challenge.is_used = True  # type: ignore
    user.mobile_verified = True  # type: ignore
    user.failed_login_attempts = 0  # type: ignore
    
    roles = [r.name for r in user.roles]
    
    if request.required_role:
        has_required = False
        if request.required_role == "OFFICER":
            has_required = any(r in roles for r in ["OFFICER", "DISTRICT_OFFICER", "STATE_OFFICER", "INSTITUTE_OFFICER"])
        elif request.required_role == "ADMIN":
            has_required = any(r in roles for r in ["ADMIN", "SYSTEM_ADMIN"])
        else:
            has_required = request.required_role in roles
            
        if not has_required:
            db.commit()
            raise HTTPException(status_code=403, detail="ROLE_NOT_AUTHORIZED")
    
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
            "mobile_number": user.mobile_number,
            "roles": [{"name": r} for r in roles]
        }
    }

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/refresh")
def refresh(request: RefreshRequest, db: Session = Depends(get_db)):
    from datetime import datetime, timezone
    db_token = db.query(RefreshToken).filter(RefreshToken.token == request.refresh_token).first()
    
    if not db_token or db_token.is_revoked or db_token.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="INVALID_REFRESH_TOKEN")
        
    user = db_token.user
    if not user or not user.is_active or user.is_locked:
        raise HTTPException(status_code=403, detail="AUTHORIZATION_DENIED")
        
    roles = [r.name for r in user.roles]
    access_token = create_access_token(subject=user.id, roles=roles)
    
    # Rotate refresh token
    db_token.is_revoked = True  # type: ignore
    new_refresh_token, exp = create_refresh_token(subject=user.id)
    new_db_token = RefreshToken(user_id=user.id, token=new_refresh_token, expires_at=exp)
    db.add(new_db_token)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

from app.api.dependencies import get_current_user

@router.post("/logout")
def logout(request: RefreshRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_token = db.query(RefreshToken).filter(RefreshToken.token == request.refresh_token, RefreshToken.user_id == current_user.id).first()
    if db_token:
        db_token.is_revoked = True  # type: ignore
        db.commit()
    return {"message": "LOGGED_OUT"}

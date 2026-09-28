from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.identity import User
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/verify-otp")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active or user.is_locked:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive or locked user")
    
    return user

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)):
        user_roles = [r.name for r in user.roles]
        if not any(role in user_roles for role in self.allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted"
            )
        return user

import time
import redis
from fastapi import Request

redis_client = None

def get_redis_client():
    global redis_client
    if redis_client is None and settings.REDIS_URL:
        redis_client = redis.from_url(str(settings.REDIS_URL))
    return redis_client

class RateLimiter:
    def __init__(self, requests: int, window: int):
        self.requests = requests
        self.window = window

    def __call__(self, request: Request):
        if getattr(settings, "APP_ENV", "") in ["testing", "development"]:
            return True
            
        client = get_redis_client()
        if not client:
            return True
            
        ip = request.client.host if request.client else "unknown"
        key = f"rate_limit:{request.url.path}:{ip}"
        
        current = client.get(key)
        if current and int(current) >= self.requests:
            raise HTTPException(status_code=429, detail="Too Many Requests")
            
        if not current:
            client.set(key, 1, ex=self.window)
        else:
            client.incr(key)
            
        return True

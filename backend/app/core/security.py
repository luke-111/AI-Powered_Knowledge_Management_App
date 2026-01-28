from datetime import datetime, timedelta
from typing import Callable, Iterable, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

import bcrypt

from app.core.config import get_settings
from app.core.database import get_db
from app.models.db_models import User

bearer_scheme = HTTPBearer(auto_error=False)
ALGORITHM = "HS256"
settings = get_settings()


def _ensure_bytes(value: str) -> bytes:
    return value.encode("utf-8")


def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(_ensure_bytes(password), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(_ensure_bytes(plain_password), _ensure_bytes(hashed_password))
    except ValueError:
        return False


def _build_access_payload(user: User, minutes: int) -> dict:
    expire = datetime.utcnow() + timedelta(minutes=minutes)
    return {
        "user": {"id": user.id, "username": user.username, "role": user.role},
        "exp": expire,
    }


def create_access_token(user: User) -> str:
    payload = _build_access_payload(user, settings.access_token_expire_minutes)
    return jwt.encode(payload, settings.private_key, algorithm=ALGORITHM)


def create_refresh_token(user: User) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.refresh_token_expire_minutes)
    payload = {
        "userId": user.id,
        "username": user.username,
        "type": "refresh",
        "exp": expire,
    }
    return jwt.encode(payload, settings.private_key, algorithm=ALGORITHM)


def decode_token(token: str, expected_type: Optional[str] = None) -> dict:
    try:
        payload = jwt.decode(token, settings.private_key, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc

    if expected_type and payload.get("type") != expected_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token type mismatch",
        )
    return payload


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token not provided")

    token = credentials.credentials
    payload = decode_token(token)
    user_info = payload.get("user") or {}
    user_id = user_info.get("id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token payload")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_roles(roles: Iterable[str]) -> Callable:
    normalized = {role.upper() for role in roles}

    def dependency(user: User = Depends(get_current_user)) -> User:
        if "PUBLIC" in normalized:
            return user
        if user.role.upper() not in normalized:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not allowed to access this resource")
        return user

    return dependency


def ensure_admin_user(db: Session) -> User:
    admin = db.query(User).filter(User.username == "admin").first()
    if admin:
        return admin

    admin = User(username="admin", password=hash_password("admin"), role="USER")
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin

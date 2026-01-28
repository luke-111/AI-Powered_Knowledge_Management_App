from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    hash_password,
    require_roles,
    verify_password,
)
from app.models.db_models import User
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/sessions", tags=["sessions"])


REFRESH_COOKIE_CONFIG = {
    "httponly": True,
    "secure": False,
    "samesite": "lax",
    "path": "/",
}


def _user_payload(user: User) -> UserResponse:
    return UserResponse.model_validate(user)


def _token_payload(user: User) -> TokenResponse:
    return TokenResponse(
        accessToken=create_access_token(user),
        user=_user_payload(user),
        expiresIn=30 * 60,
    )


@router.post("/signup")
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    if not payload.username.strip() or not payload.password.strip():
        raise HTTPException(status_code=400, detail="Username and password are required")

    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with specified username already exists")

    user = User(
        username=payload.username.strip(),
        password=hash_password(payload.password.strip()),
        role="USER",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"status": "success", "payload": _user_payload(user)}


@router.post("/login")
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong credentials")

    refresh_token = create_refresh_token(user)
    response.set_cookie("refreshToken", refresh_token, max_age=24 * 60 * 60, **REFRESH_COOKIE_CONFIG)

    return {"status": "success", "payload": _token_payload(user)}


@router.post("/refresh")
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refreshToken")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token not provided")

    payload = decode_token(refresh_token, expected_type="refresh")
    user_id = payload.get("userId")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    new_refresh = create_refresh_token(user)
    response.set_cookie("refreshToken", new_refresh, max_age=24 * 60 * 60, **REFRESH_COOKIE_CONFIG)
    return {"status": "success", "payload": _token_payload(user)}


@router.post("/logout")
def logout(response: Response, user: User = Depends(require_roles(["USER"]))):  # pylint: disable=unused-argument
    response.delete_cookie("refreshToken", path="/")
    return {"status": "success", "payload": None}

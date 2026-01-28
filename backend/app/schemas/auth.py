from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    accessToken: str
    user: UserResponse
    expiresIn: int


class SignupRequest(BaseModel):
    username: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class RefreshPayload(BaseModel):
    refreshToken: str
    issuedAt: datetime
    expiresAt: datetime
    model_config = ConfigDict(from_attributes=True)

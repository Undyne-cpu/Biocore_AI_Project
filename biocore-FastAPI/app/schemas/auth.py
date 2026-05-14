from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=100)
    institution: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    id: str
    email: str
    name: str
    token: str
    refreshToken: Optional[str] = None


class RefreshRequest(BaseModel):
    refreshToken: str


class TokenResponse(BaseModel):
    token: str
    refreshToken: str


class UserMeResponse(BaseModel):
    id: str
    email: str
    name: str
    institution: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    role: str
    createdAt: Optional[str] = None
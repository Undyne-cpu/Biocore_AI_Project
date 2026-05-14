from typing import Optional
from pydantic import BaseModel, Field


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = None
    role: str
    joinedAt: Optional[str] = None


class UserDetailResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = None
    institution: Optional[str] = None
    bio: Optional[str] = None
    role: str
    joinedAt: Optional[str] = None


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    institution: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None


class PasswordChangeRequest(BaseModel):
    currentPassword: str
    newPassword: str = Field(min_length=6)


class UserSettingsResponse(BaseModel):
    language: str = "zh-CN"
    timezone: str = "Asia/Shanghai"
    defaultGenome: str = "hg38"
    notifications: dict = {
        "email": True,
        "taskFailure": True,
        "teamMessages": False
    }
    twoFactorEnabled: bool = False


class UserSettingsUpdateRequest(BaseModel):
    language: Optional[str] = None
    timezone: Optional[str] = None
    defaultGenome: Optional[str] = None
    notifications: Optional[dict] = None
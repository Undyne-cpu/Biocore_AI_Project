from typing import Optional
from pydantic import BaseModel


class TeamMemberResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    avatar: Optional[str] = None
    joinedAt: Optional[str] = None


class TeamInviteRequest(BaseModel):
    email: str
    role: str


class TeamInviteResponse(BaseModel):
    memberId: str
    email: str
    role: str
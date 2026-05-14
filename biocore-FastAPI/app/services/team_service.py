from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.team import TeamMember
from app.models.user import User
from app.models.base import BaseModel
from app.schemas.team import TeamMemberResponse, TeamInviteResponse
from app.utils.exceptions import NotFoundException, BadRequestException


class TeamService:
    def __init__(self, db: Session):
        self.db = db

    def get_members(self, user_id: str = None):
        if user_id:
            members = self.db.query(TeamMember).filter(TeamMember.user_id == user_id).all()
        else:
            members = self.db.query(TeamMember).all()
        return [TeamMemberResponse(
            id=m.user_id,
            name=m.name or "未知",
            email=m.email,
            role=m.role,
            avatar=m.avatar,
            joinedAt=m.created_at.isoformat() if m.created_at else None
        ) for m in members]

    def invite_member(self, email: str, role: str, inviter_id: str) -> TeamInviteResponse:
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            raise NotFoundException("用户")

        existing = self.db.query(TeamMember).filter(
            TeamMember.email == email
        ).first()
        if existing:
            raise BadRequestException(detail="User already in team")

        member = TeamMember(
            id=BaseModel.generate_id("mem"),
            user_id=user.id,
            email=email,
            name=user.name,
            avatar=user.avatar,
            role=role,
            status="active"
        )
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)

        return TeamInviteResponse(
            memberId=member.user_id,
            email=member.email,
            role=member.role
        )

    def remove_member(self, member_id: str, current_user_id: str):
        member = self.db.query(TeamMember).filter(TeamMember.user_id == member_id).first()
        if not member:
            raise NotFoundException("成员")
        if member.role == "owner":
            raise BadRequestException(detail="Cannot remove owner")
        self.db.delete(member)
        self.db.commit()
        return {"message": "成员已移除"}

    def update_role(self, member_id: str, role: str, current_user_id: str):
        member = self.db.query(TeamMember).filter(TeamMember.user_id == member_id).first()
        if not member:
            raise NotFoundException("成员")
        if member.role == "owner":
            raise BadRequestException(detail="Cannot change owner role")
        member.role = role
        self.db.commit()
        return {"message": "角色已修改"}
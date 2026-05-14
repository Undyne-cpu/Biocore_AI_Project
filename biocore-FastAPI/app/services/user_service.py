from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.user import User, UserSettings
from app.models.base import BaseModel
from app.schemas.user import UserResponse, UserDetailResponse, UserUpdateRequest, PasswordChangeRequest, UserSettingsResponse, UserSettingsUpdateRequest
from app.core.security import hash_password, verify_password
from app.utils.exceptions import NotFoundException, BadRequestException


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_users(self, page: int = 1, page_size: int = 20, search: Optional[str] = None):
        query = self.db.query(User)
        if search:
            query = query.filter(or_(User.name.ilike(f"%{search}%"), User.email.ilike(f"%{search}%")))
        total = query.count()
        users = query.offset((page - 1) * page_size).limit(page_size).all()
        return {
            "list": [UserResponse(
                id=u.id,
                name=u.name,
                email=u.email,
                avatar=u.avatar,
                role=u.role,
                joinedAt=u.created_at.isoformat() if u.created_at else None
            ) for u in users],
            "total": total,
            "page": page,
            "pageSize": page_size
        }

    def get_user(self, user_id: str) -> UserDetailResponse:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException("用户")
        return UserDetailResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            avatar=user.avatar,
            institution=user.institution,
            bio=user.bio,
            role=user.role,
            joinedAt=user.created_at.isoformat() if user.created_at else None
        )

    def update_user(self, user_id: str, current_user: User, request: UserUpdateRequest) -> UserDetailResponse:
        if current_user.id != user_id and current_user.role not in ["owner", "admin"]:
            raise BadRequestException(detail="Cannot update other user's info")

        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException("用户")

        if request.name is not None:
            user.name = request.name
        if request.institution is not None:
            user.institution = request.institution
        if request.bio is not None:
            user.bio = request.bio
        if request.avatar is not None:
            user.avatar = request.avatar

        self.db.commit()
        self.db.refresh(user)
        return UserDetailResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            avatar=user.avatar,
            institution=user.institution,
            bio=user.bio,
            role=user.role,
            joinedAt=user.created_at.isoformat() if user.created_at else None
        )

    def update_password(self, user_id: str, current_user: User, request: PasswordChangeRequest):
        if current_user.id != user_id:
            raise BadRequestException(detail="Cannot change other user's password")

        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException("用户")

        if not verify_password(request.currentPassword, user.hashed_password):
            raise BadRequestException(detail="Current password is incorrect")

        user.hashed_password = hash_password(request.newPassword)
        self.db.commit()
        return {"message": "密码修改成功"}

    def get_settings(self, user_id: str) -> UserSettingsResponse:
        settings = self.db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
        if not settings:
            settings = UserSettings(
                id=BaseModel.generate_id("set"),
                user_id=user_id
            )
            self.db.add(settings)
            self.db.commit()
            self.db.refresh(settings)

        return UserSettingsResponse(
            language=settings.language,
            timezone=settings.timezone,
            defaultGenome=settings.default_genome,
            notifications={
                "email": settings.notifications_email,
                "taskFailure": settings.notifications_task_failure,
                "teamMessages": settings.notifications_team_messages
            },
            twoFactorEnabled=settings.two_factor_enabled
        )

    def update_settings(self, user_id: str, request: UserSettingsUpdateRequest) -> UserSettingsResponse:
        settings = self.db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
        if not settings:
            settings = UserSettings(
                id=BaseModel.generate_id("set"),
                user_id=user_id
            )
            self.db.add(settings)

        if request.language is not None:
            settings.language = request.language
        if request.timezone is not None:
            settings.timezone = request.timezone
        if request.defaultGenome is not None:
            settings.default_genome = request.defaultGenome
        if request.notifications is not None:
            if "email" in request.notifications:
                settings.notifications_email = request.notifications["email"]
            if "taskFailure" in request.notifications:
                settings.notifications_task_failure = request.notifications["taskFailure"]
            if "teamMessages" in request.notifications:
                settings.notifications_team_messages = request.notifications["teamMessages"]

        self.db.commit()
        self.db.refresh(settings)
        return UserSettingsResponse(
            language=settings.language,
            timezone=settings.timezone,
            defaultGenome=settings.default_genome,
            notifications={
                "email": settings.notifications_email,
                "taskFailure": settings.notifications_task_failure,
                "teamMessages": settings.notifications_team_messages
            },
            twoFactorEnabled=settings.two_factor_enabled
        )
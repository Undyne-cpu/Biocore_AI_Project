from sqlalchemy import String, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.database import Base
from app.models.base import BaseModel


class User(Base, BaseModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    institution: Mapped[str | None] = mapped_column(String(255), nullable=True)
    avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    role: Mapped[str] = mapped_column(String(20), default="member")

    projects: Mapped[list["Project"]] = relationship("Project", back_populates="owner")
    settings: Mapped["UserSettings"] = relationship("UserSettings", back_populates="user", uselist=False)


class UserSettings(Base, BaseModel):
    __tablename__ = "user_settings"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="zh-CN")
    timezone: Mapped[str] = mapped_column(String(50), default="Asia/Shanghai")
    default_genome: Mapped[str] = mapped_column(String(20), default="hg38")
    notifications_email: Mapped[bool] = mapped_column(Boolean, default=True)
    notifications_task_failure: Mapped[bool] = mapped_column(Boolean, default=True)
    notifications_team_messages: Mapped[bool] = mapped_column(Boolean, default=False)
    two_factor_enabled: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship("User", back_populates="settings")
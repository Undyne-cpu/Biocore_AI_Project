from sqlalchemy import String, Text, ForeignKey, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.base import BaseModel


class Result(Base, BaseModel):
    __tablename__ = "results"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    tool_id: Mapped[str] = mapped_column(String(50), nullable=False)
    project_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("projects.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="processing")
    duration: Mapped[str | None] = mapped_column(String(50), nullable=True)

    files: Mapped[list | None] = mapped_column(JSON, nullable=True)

    owner_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    owner: Mapped["User"] = relationship("User")


class Report(Base, BaseModel):
    __tablename__ = "reports"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(20), default="summary")  # summary, detailed
    status: Mapped[str] = mapped_column(String(20), default="draft")

    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    template: Mapped[str | None] = mapped_column(String(100), nullable=True)

    owner_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    owner: Mapped["User"] = relationship("User")
from sqlalchemy import String, Text, Boolean, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from app.models.base import BaseModel


class Tool(Base, BaseModel):
    __tablename__ = "tools"

    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    display_name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    input_format: Mapped[str] = mapped_column(String(50), nullable=False)
    output_format: Mapped[str] = mapped_column(String(50), nullable=False)
    version: Mapped[str] = mapped_column(String(20), nullable=False)
    color: Mapped[str] = mapped_column(String(20), default="#667eea")
    parameters: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    genomes: Mapped[list | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    usage_count: Mapped[int] = mapped_column(Integer, default=0)

    # Docker-specific fields
    image_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    command_template: Mapped[str | None] = mapped_column(Text, nullable=True)
    default_params: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    input_path_prefix: Mapped[str | None] = mapped_column(String(255), nullable=True)
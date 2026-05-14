from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.base import BaseModel


class DataFile(Base, BaseModel):
    __tablename__ = "data_files"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)  # raw, reference, result, annotation
    format: Mapped[str] = mapped_column(String(20), nullable=False)  # fasta, fastq, bam, vcf, other
    size: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., "2.3 GB"
    path: Mapped[str] = mapped_column(String(500), nullable=False)
    md5: Mapped[str | None] = mapped_column(String(64), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="uploading")  # uploading, ready, error

    project_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("projects.id"), nullable=True)
    project: Mapped["Project"] = relationship("Project", foreign_keys=[project_id])

    uploader_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    uploader: Mapped["User"] = relationship("User", foreign_keys=[uploader_id])
from typing import Optional
import uuid
import hashlib
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.data import DataFile
from app.models.base import BaseModel
from app.schemas.data import DataFileResponse, DataFileDetailResponse, DataFileUploadResponse


class DataService:
    def __init__(self, db: Session):
        self.db = db

    def get_files(self, project_id: Optional[str] = None, format: Optional[str] = None,
                  file_type: Optional[str] = None, search: Optional[str] = None,
                  page: int = 1, page_size: int = 20, user_id: Optional[str] = None):
        query = self.db.query(DataFile)
        if project_id:
            query = query.filter(DataFile.project_id == project_id)
        if format:
            query = query.filter(DataFile.format == format)
        if file_type:
            query = query.filter(DataFile.type == file_type)
        if search:
            query = query.filter(DataFile.name.ilike(f"%{search}%"))
        if user_id:
            query = query.filter(DataFile.uploader_id == user_id)

        total = query.count()
        files = query.offset((page - 1) * page_size).limit(page_size).all()

        return {
            "list": [DataFileResponse(
                id=f.id,
                name=f.name,
                type=f.type,
                size=f.size,
                format=f.format,
                uploadTime=f.created_at.isoformat() if f.created_at else None,
                status=f.status
            ) for f in files],
            "total": total,
            "page": page,
            "pageSize": page_size
        }

    def get_file(self, file_id: str) -> DataFileDetailResponse:
        file = self.db.query(DataFile).filter(DataFile.id == file_id).first()
        if not file:
            from app.utils.exceptions import NotFoundException
            raise NotFoundException("文件")
        return DataFileDetailResponse(
            id=file.id,
            name=file.name,
            type=file.type,
            size=file.size,
            format=file.format,
            md5=file.md5,
            path=file.path,
            description=file.description,
            uploadTime=file.created_at.isoformat() if file.created_at else None,
            status=file.status
        )

    def create_file(self, name: str, file_type: str, format: str, size: str,
                    path: str, project_id: Optional[str] = None,
                    uploader_id: str = None, description: Optional[str] = None) -> DataFileUploadResponse:
        file = DataFile(
            id=BaseModel.generate_id("file"),
            name=name,
            type=file_type,
            format=format,
            size=size,
            path=path,
            status="ready",
            project_id=project_id,
            uploader_id=uploader_id,
            description=description
        )
        self.db.add(file)
        self.db.commit()
        self.db.refresh(file)
        return DataFileUploadResponse(
            id=file.id,
            name=file.name,
            size=file.size,
            format=file.format,
            status=file.status
        )

    def delete_file(self, file_id: str, user_id: str):
        file = self.db.query(DataFile).filter(DataFile.id == file_id).first()
        if not file:
            from app.utils.exceptions import NotFoundException
            raise NotFoundException("文件")
        if file.uploader_id != user_id:
            from app.utils.exceptions import ForbiddenException
            raise ForbiddenException(detail="Only uploader can delete file")
        self.db.delete(file)
        self.db.commit()
        return {"message": "文件删除成功"}
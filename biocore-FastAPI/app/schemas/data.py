from typing import Optional
from pydantic import BaseModel


class DataFileResponse(BaseModel):
    id: str
    name: str
    type: str
    size: str
    format: str
    uploadTime: Optional[str] = None
    status: str


class DataFileDetailResponse(BaseModel):
    id: str
    name: str
    type: str
    size: str
    format: str
    md5: Optional[str] = None
    path: str
    description: Optional[str] = None
    uploadTime: Optional[str] = None
    status: str


class DataFileUploadResponse(BaseModel):
    id: str
    name: str
    size: str
    format: str
    status: str
    minio_path: Optional[str] = None


class DataListResponse(BaseModel):
    list: list[DataFileResponse]
    total: int
    page: int
    pageSize: int
    storageUsed: Optional[str] = None
    storageTotal: Optional[str] = None
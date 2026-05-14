from typing import Optional, Any
from pydantic import BaseModel


class ResultResponse(BaseModel):
    id: str
    name: str
    tool: str
    project: Optional[str] = None
    status: str
    createdAt: Optional[str] = None
    duration: Optional[str] = None


class ResultDetailResponse(BaseModel):
    id: str
    name: str
    tool: str
    project: Optional[str] = None
    status: str
    createdAt: Optional[str] = None
    duration: Optional[str] = None
    files: Optional[list] = None


class ReportResponse(BaseModel):
    id: str
    name: str
    project: str
    createdAt: Optional[str] = None


class ReportDetailResponse(BaseModel):
    id: str
    name: str
    project: str
    type: str
    status: str
    content: Optional[str] = None
    createdAt: Optional[str] = None


class ReportCreateRequest(BaseModel):
    projectId: str
    type: str
    template: Optional[str] = None
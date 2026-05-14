from typing import Optional
from pydantic import BaseModel, Field


class ProjectResponse(BaseModel):
    id: str
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    type: str
    status: str
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


class ProjectDetailResponse(BaseModel):
    id: str
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    type: str
    status: str
    genome: Optional[str] = None
    owner: Optional[dict] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


class ProjectCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    type: str = Field(pattern="^(wgs|wes|rna|chip/meta)$")
    description: Optional[str] = None
    genome: Optional[str] = None


class ProjectUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
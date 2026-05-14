from typing import Optional, Any
from pydantic import BaseModel


class WorkflowResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    steps: int
    status: str
    createdAt: Optional[str] = None


class WorkflowDetailResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    status: str
    steps: int
    nodes: Optional[list] = None
    edges: Optional[list] = None
    settings: Optional[dict] = None
    createdAt: Optional[str] = None


class WorkflowCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    nodes: Optional[list] = None
    edges: Optional[list] = None
    settings: Optional[dict] = None


class WorkflowUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    nodes: Optional[list] = None
    edges: Optional[list] = None
    settings: Optional[dict] = None


class WorkflowRunRequest(BaseModel):
    inputFiles: Optional[dict] = None
    settings: Optional[dict] = None


class WorkflowRunResponse(BaseModel):
    executionId: str
    workflowId: str
    name: str
    status: str
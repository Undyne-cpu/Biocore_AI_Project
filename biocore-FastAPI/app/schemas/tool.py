from typing import Optional, Any
from pydantic import BaseModel


class ToolResponse(BaseModel):
    id: str
    name: str
    category: str
    desc: Optional[str] = None
    input: str
    output: str
    version: str
    color: str
    usage: int


class ToolDetailResponse(BaseModel):
    id: str
    name: str
    category: str
    desc: Optional[str] = None
    input: str
    output: str
    version: str
    parameters: Optional[list] = None
    genomes: Optional[list] = None
    input_path_prefix: Optional[str] = None


class ToolRunRequest(BaseModel):
    projectId: str
    inputFiles: list[str]
    parameters: Optional[dict] = None
    extraParams: Optional[str] = None


class ToolRunResponse(BaseModel):
    taskId: str
    toolId: str
    status: str
    estimatedTime: Optional[str] = None


class ToolCategoryResponse(BaseModel):
    name: str
    count: int
    color: str
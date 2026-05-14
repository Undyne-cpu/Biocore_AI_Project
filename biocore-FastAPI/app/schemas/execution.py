from typing import Optional, Any
from pydantic import BaseModel


class ExecutionResponse(BaseModel):
    id: str
    workflowId: str
    workflowName: str
    status: str
    progress: int
    currentStep: Optional[str] = None
    startTime: Optional[str] = None
    elapsedTime: Optional[str] = None


class ExecutionDetailResponse(BaseModel):
    id: str
    workflowId: str
    workflowName: str
    status: str
    progress: int
    currentStep: Optional[str] = None
    startTime: Optional[str] = None
    elapsedTime: Optional[str] = None
    estimatedRemaining: Optional[str] = None
    nodes: Optional[list] = None


class ExecutionLogResponse(BaseModel):
    time: str
    level: str
    nodeId: Optional[str] = None
    message: str


class ExecutionResourceResponse(BaseModel):
    cpuUsage: list[int]
    memoryUsage: list[int]
    timePoints: list[str]
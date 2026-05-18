from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.tool import ToolRunRequest
from app.services.tool_service import ToolService
from app.utils.response import success_response

router = APIRouter(prefix="/tools", tags=["工具"])


@router.get("")
async def get_tools(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ToolService(db)
    result = service.get_tools(category, search)
    return success_response(result)


@router.get("/{tool_id}")
async def get_tool(
    tool_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ToolService(db)
    result = service.get_tool(tool_id)
    return success_response(result)


@router.post("/{tool_id}/run")
async def run_tool(
    tool_id: str,
    request: ToolRunRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ToolService(db)
    result = service.run_tool(
        tool_id=tool_id,
        project_id=request.projectId,
        input_files=request.inputFiles,
        parameters=request.parameters,
        extra_params=request.extraParams,
        user_id=current_user.id
    )
    return success_response(result, "分析任务已提交")


@router.get("/{tool_id}/results/{result_id}")
async def get_tool_result(
    tool_id: str,
    result_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ToolService(db)
    result = service.get_execution_status(result_id)
    return success_response(result)


@router.get("/{tool_id}/tasks/{task_id}/status")
async def get_task_status(
    tool_id: str,
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.tools.tasks.tool_tasks import get_tool_execution_status
    result = get_tool_execution_status(result_id=task_id)
    return success_response(result)
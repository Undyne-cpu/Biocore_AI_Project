from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services.workflow_service import ExecutionService
from app.utils.response import success_response

router = APIRouter(prefix="/executions", tags=["执行监控"])


@router.get("")
async def get_executions(
    status: Optional[str] = Query(None),
    workflowId: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ExecutionService(db)
    result = service.get_executions(status, workflowId, current_user.id)
    return success_response(result)


@router.get("/{execution_id}")
async def get_execution(
    execution_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ExecutionService(db)
    result = service.get_execution(execution_id)
    return success_response(result)


@router.get("/{execution_id}/logs")
async def get_logs(
    execution_id: str,
    level: Optional[str] = Query(None),
    nodeId: Optional[str] = Query(None),
    startTime: Optional[str] = Query(None),
    endTime: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ExecutionService(db)
    result = service.get_logs(execution_id, level, nodeId)
    return success_response(result)


@router.get("/{execution_id}/resources")
async def get_resources(
    execution_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ExecutionService(db)
    result = service.get_resources(execution_id)
    return success_response(result)


@router.post("/{execution_id}/pause")
async def pause_execution(
    execution_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ExecutionService(db)
    result = service.pause_execution(execution_id)
    return success_response(result, "执行已暂停")


@router.post("/{execution_id}/resume")
async def resume_execution(
    execution_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ExecutionService(db)
    result = service.resume_execution(execution_id)
    return success_response(result, "执行已恢复")


@router.post("/{execution_id}/stop")
async def stop_execution(
    execution_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ExecutionService(db)
    result = service.stop_execution(execution_id)
    return success_response(result, "执行已停止")
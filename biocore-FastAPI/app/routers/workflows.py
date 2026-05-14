from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.workflow import WorkflowCreateRequest, WorkflowUpdateRequest, WorkflowRunRequest
from app.services.workflow_service import WorkflowService, ExecutionService
from app.utils.response import success_response

router = APIRouter(prefix="/workflows", tags=["工作流"])


@router.get("")
async def get_workflows(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkflowService(db)
    result = service.get_workflows(current_user.id)
    return success_response(result)


@router.post("")
async def create_workflow(
    request: WorkflowCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkflowService(db)
    result = service.create_workflow(
        name=request.name,
        description=request.description,
        nodes=request.nodes,
        edges=request.edges,
        settings=request.settings,
        owner_id=current_user.id
    )
    return success_response(result, "工作流创建成功")


@router.get("/{workflow_id}")
async def get_workflow(
    workflow_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkflowService(db)
    result = service.get_workflow(workflow_id)
    return success_response(result)


@router.put("/{workflow_id}")
async def update_workflow(
    workflow_id: str,
    request: WorkflowUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkflowService(db)
    result = service.update_workflow(
        workflow_id=workflow_id,
        name=request.name,
        description=request.description,
        nodes=request.nodes,
        edges=request.edges,
        settings=request.settings
    )
    return success_response(result, "工作流更新成功")


@router.delete("/{workflow_id}")
async def delete_workflow(
    workflow_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkflowService(db)
    result = service.delete_workflow(workflow_id)
    return success_response(result, "工作流删除成功")


@router.post("/{workflow_id}/save-config")
async def save_config(
    workflow_id: str,
    nodeId: str = Query(...),
    config: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    import json
    config_dict = json.loads(config)
    return success_response({"message": "配置已保存"})


@router.post("/{workflow_id}/run")
async def run_workflow(
    workflow_id: str,
    request: WorkflowRunRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkflowService(db)
    result = service.run_workflow(
        workflow_id=workflow_id,
        input_files=request.inputFiles,
        settings=request.settings,
        user_id=current_user.id
    )
    return success_response(result, "工作流已启动")


@router.post("/{workflow_id}/validate")
async def validate_workflow(
    workflow_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkflowService(db)
    result = service.validate_workflow(workflow_id)
    return success_response(result)
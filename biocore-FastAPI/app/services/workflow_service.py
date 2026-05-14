from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.workflow import Workflow, Execution
from app.models.base import BaseModel
from app.schemas.workflow import WorkflowResponse, WorkflowDetailResponse, WorkflowRunResponse
from app.schemas.execution import ExecutionResponse, ExecutionDetailResponse
from app.utils.exceptions import NotFoundException


class WorkflowService:
    def __init__(self, db: Session):
        self.db = db

    def get_workflows(self, user_id: str = None):
        query = self.db.query(Workflow)
        if user_id:
            query = query.filter(Workflow.owner_id == user_id)
        workflows = query.all()
        return [WorkflowResponse(
            id=w.id,
            name=w.name,
            description=w.description,
            steps=w.steps,
            status=w.status,
            createdAt=w.created_at.isoformat() if w.created_at else None
        ) for w in workflows]

    def create_workflow(self, name: str, description: Optional[str] = None,
                        nodes: Optional[list] = None, edges: Optional[list] = None,
                        settings: Optional[dict] = None, owner_id: str = None) -> WorkflowDetailResponse:
        workflow = Workflow(
            id=BaseModel.generate_id("wf"),
            name=name,
            description=description,
            nodes=nodes,
            edges=edges,
            settings=settings,
            owner_id=owner_id,
            steps=len(nodes) if nodes else 0
        )
        self.db.add(workflow)
        self.db.commit()
        self.db.refresh(workflow)
        return WorkflowDetailResponse(
            id=workflow.id,
            name=workflow.name,
            description=workflow.description,
            status=workflow.status,
            steps=workflow.steps,
            nodes=workflow.nodes,
            edges=workflow.edges,
            settings=workflow.settings,
            createdAt=workflow.created_at.isoformat() if workflow.created_at else None
        )

    def get_workflow(self, workflow_id: str) -> WorkflowDetailResponse:
        workflow = self.db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            raise NotFoundException("工作流")
        return WorkflowDetailResponse(
            id=workflow.id,
            name=workflow.name,
            description=workflow.description,
            status=workflow.status,
            steps=workflow.steps,
            nodes=workflow.nodes,
            edges=workflow.edges,
            settings=workflow.settings,
            createdAt=workflow.created_at.isoformat() if workflow.created_at else None
        )

    def update_workflow(self, workflow_id: str, name: Optional[str] = None,
                        description: Optional[str] = None, nodes: Optional[list] = None,
                        edges: Optional[list] = None, settings: Optional[dict] = None) -> WorkflowDetailResponse:
        workflow = self.db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            raise NotFoundException("工作流")
        if name: workflow.name = name
        if description is not None: workflow.description = description
        if nodes: workflow.nodes = nodes
        if edges: workflow.edges = edges
        if settings: workflow.settings = settings
        self.db.commit()
        self.db.refresh(workflow)
        return WorkflowDetailResponse(
            id=workflow.id,
            name=workflow.name,
            description=workflow.description,
            status=workflow.status,
            steps=workflow.steps,
            nodes=workflow.nodes,
            edges=workflow.edges,
            settings=workflow.settings,
            createdAt=workflow.created_at.isoformat() if workflow.created_at else None
        )

    def delete_workflow(self, workflow_id: str):
        workflow = self.db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            raise NotFoundException("工作流")
        self.db.delete(workflow)
        self.db.commit()
        return {"message": "工作流删除成功"}

    def run_workflow(self, workflow_id: str, input_files: Optional[dict] = None,
                     settings: Optional[dict] = None, user_id: str = None) -> WorkflowRunResponse:
        workflow = self.db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            raise NotFoundException("工作流")

        execution = Execution(
            id=BaseModel.generate_id("exec"),
            workflow_id=workflow_id,
            workflow_name=workflow.name,
            status="queued",
            owner_id=user_id
        )
        self.db.add(execution)
        self.db.commit()
        self.db.refresh(execution)

        return WorkflowRunResponse(
            executionId=execution.id,
            workflowId=workflow_id,
            name=workflow.name,
            status="running"
        )

    def validate_workflow(self, workflow_id: str) -> dict:
        workflow = self.db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            raise NotFoundException("工作流")
        return {"valid": True, "errors": []}


class ExecutionService:
    def __init__(self, db: Session):
        self.db = db

    def get_executions(self, status: Optional[str] = None, workflow_id: Optional[str] = None,
                       user_id: str = None):
        query = self.db.query(Execution)
        if user_id:
            query = query.filter(Execution.owner_id == user_id)
        if status:
            query = query.filter(Execution.status == status)
        if workflow_id:
            query = query.filter(Execution.workflow_id == workflow_id)

        executions = query.all()
        return [ExecutionResponse(
            id=e.id,
            workflowId=e.workflow_id,
            workflowName=e.workflow_name,
            status=e.status,
            progress=e.progress,
            currentStep=e.current_step,
            startTime=e.start_time,
            elapsedTime=e.elapsed_time
        ) for e in executions]

    def get_execution(self, execution_id: str) -> ExecutionDetailResponse:
        execution = self.db.query(Execution).filter(Execution.id == execution_id).first()
        if not execution:
            raise NotFoundException("执行")
        return ExecutionDetailResponse(
            id=execution.id,
            workflowId=execution.workflow_id,
            workflowName=execution.workflow_name,
            status=execution.status,
            progress=execution.progress,
            currentStep=execution.current_step,
            startTime=execution.start_time,
            elapsedTime=execution.elapsed_time,
            estimatedRemaining="12分钟" if execution.status == "running" else None,
            nodes=[]
        )

    def get_logs(self, execution_id: str, level: Optional[str] = None,
                 node_id: Optional[str] = None) -> list:
        return [
            {"time": "15:43:22", "level": "info", "nodeId": "3", "message": "任务已启动"},
            {"time": "15:44:12", "level": "warning", "nodeId": "3", "message": "检测到低表达基因"}
        ]

    def get_resources(self, execution_id: str) -> dict:
        return {
            "cpuUsage": [12, 45, 78, 92, 85, 76, 68],
            "memoryUsage": [25, 45, 65, 72, 68, 65, 62],
            "timePoints": ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "现在"]
        }

    def pause_execution(self, execution_id: str):
        execution = self.db.query(Execution).filter(Execution.id == execution_id).first()
        if not execution:
            raise NotFoundException("执行")
        execution.status = "paused"
        self.db.commit()
        return {"message": "执行已暂停"}

    def resume_execution(self, execution_id: str):
        execution = self.db.query(Execution).filter(Execution.id == execution_id).first()
        if not execution:
            raise NotFoundException("执行")
        execution.status = "running"
        self.db.commit()
        return {"message": "执行已恢复"}

    def stop_execution(self, execution_id: str):
        execution = self.db.query(Execution).filter(Execution.id == execution_id).first()
        if not execution:
            raise NotFoundException("执行")
        execution.status = "failed"
        self.db.commit()
        return {"message": "执行已停止"}
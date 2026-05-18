from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.tool import Tool
from app.models.base import BaseModel
from app.schemas.tool import ToolResponse, ToolDetailResponse, ToolRunResponse
from app.utils.exceptions import NotFoundException


class ToolService:
    def __init__(self, db: Session):
        self.db = db

    def get_tools(self, category: Optional[str] = None, search: Optional[str] = None):
        query = self.db.query(Tool).filter(Tool.is_active == True)
        if category:
            query = query.filter(Tool.category == category)
        if search:
            query = query.filter(or_(Tool.name.ilike(f"%{search}%"), Tool.display_name.ilike(f"%{search}%")))

        tools = query.all()

        categories_data = {}
        for tool in tools:
            if tool.category not in categories_data:
                categories_data[tool.category] = {"count": 0, "name": tool.category, "color": tool.color}
            categories_data[tool.category]["count"] += 1

        return {
            "categories": list(categories_data.values()),
            "list": [ToolResponse(
                id=tool.id,
                name=tool.name,
                category=tool.category,
                desc=tool.description,
                input=tool.input_format,
                output=tool.output_format,
                version=tool.version,
                color=tool.color,
                usage=tool.usage_count
            ) for tool in tools]
        }

    def get_tool(self, tool_id: str) -> ToolDetailResponse:
        tool = self.db.query(Tool).filter(Tool.id == tool_id).first()
        if not tool:
            raise NotFoundException("工具")
        return ToolDetailResponse(
            id=tool.id,
            name=tool.name,
            category=tool.category,
            desc=tool.description,
            input=tool.input_format,
            output=tool.output_format,
            version=tool.version,
            parameters=tool.parameters,
            genomes=tool.genomes,
            input_path_prefix=tool.input_path_prefix
        )

    def run_tool(self, tool_id: str, project_id: str, input_files: list,
                 parameters: Optional[dict] = None,
                 extra_params: Optional[str] = None,
                 user_id: str = None) -> ToolRunResponse:
        tool = self.db.query(Tool).filter(Tool.id == tool_id).first()
        if not tool:
            raise NotFoundException("工具")

        if not tool.image_name:
            return ToolRunResponse(
                taskId="error",
                toolId=tool_id,
                status="error",
                estimatedTime="Tool not configured"
            )

        tool.usage_count += 1
        self.db.commit()

        output_prefix = f"results/{project_id}/{tool.name}"

        merged_params = {**(tool.default_params or {}), **(parameters or {})}
        if extra_params:
            merged_params["extra_params"] = extra_params

        if tool.name == "fastqc":
            from app.tools.tasks.tool_tasks import run_fastqc_task
            task = run_fastqc_task.delay(
                tool_id=tool.id,
                tool_name=tool.name,
                tool_version=tool.version,
                image=tool.image_name,
                input_files=input_files,
                output_prefix=output_prefix,
                parameters=merged_params,
                user_id=user_id,
                project_id=project_id
            )
        else:
            return ToolRunResponse(
                taskId="pending",
                toolId=tool_id,
                status="queued",
                estimatedTime="30分钟"
            )

        return ToolRunResponse(
            taskId=str(task.id),
            toolId=tool_id,
            status="queued",
            estimatedTime=self._estimate_time(tool.name, input_files)
        )

    def get_execution_status(self, task_id: str) -> dict:
        from app.tools.tasks.tool_tasks import get_tool_execution_status
        from app.models.result import Result
        result = self.db.query(Result).filter(Result.id == task_id).first()
        if result:
            return {"id": result.id, "status": result.status}
        return {"task_id": task_id, "status": "unknown"}

    def _estimate_time(self, tool_name: str, input_files: list) -> str:
        base_times = {
            "fastqc": "5-10分钟",
            "bwa": "15-30分钟",
            "bowtie": "10-20分钟",
        }
        return base_times.get(tool_name, "30分钟")
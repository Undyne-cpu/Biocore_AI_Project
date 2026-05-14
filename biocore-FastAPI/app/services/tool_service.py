from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.tool import Tool
from app.models.base import BaseModel
from app.schemas.tool import ToolResponse, ToolDetailResponse, ToolRunResponse
from app.utils.exceptions import NotFoundException
import uuid


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
            genomes=tool.genomes
        )

    def run_tool(self, tool_id: str, project_id: str, input_files: list, parameters: Optional[dict] = None,
                 extra_params: Optional[str] = None, user_id: str = None) -> ToolRunResponse:
        tool = self.db.query(Tool).filter(Tool.id == tool_id).first()
        if not tool:
            raise NotFoundException("工具")

        tool.usage_count += 1
        self.db.commit()

        return ToolRunResponse(
            taskId=BaseModel.generate_id("task"),
            toolId=tool_id,
            status="queued",
            estimatedTime="30分钟"
        )
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.project import Project
from app.models.base import BaseModel
from app.schemas.project import ProjectResponse, ProjectDetailResponse, ProjectCreateRequest, ProjectUpdateRequest
from app.utils.exceptions import NotFoundException, BadRequestException


class ProjectService:
    def __init__(self, db: Session):
        self.db = db

    def _generate_code(self, project_type: str) -> str:
        from datetime import datetime
        year = datetime.utcnow().year
        count = self.db.query(Project).filter(
            Project.type == project_type
        ).count()
        return f"{project_type.upper()}-{year}-{count + 1:03d}"

    def get_projects(self, page: int = 1, page_size: int = 20, status: Optional[str] = None,
                     type: Optional[str] = None, search: Optional[str] = None, owner_id: Optional[str] = None):
        query = self.db.query(Project)
        if status:
            query = query.filter(Project.status == status)
        if type:
            query = query.filter(Project.type == type)
        if search:
            query = query.filter(or_(Project.name.ilike(f"%{search}%"), Project.code.ilike(f"%{search}%")))
        if owner_id:
            query = query.filter(Project.owner_id == owner_id)
        total = query.count()
        projects = query.offset((page - 1) * page_size).limit(page_size).all()
        return {
            "list": [ProjectResponse(
                id=p.id,
                name=p.name,
                code=p.code,
                description=p.description,
                type=p.type,
                status=p.status,
                createdAt=p.created_at.isoformat() if p.created_at else None,
                updatedAt=p.updated_at.isoformat() if p.updated_at else None
            ) for p in projects],
            "total": total,
            "page": page,
            "pageSize": page_size
        }

    def create_project(self, request: ProjectCreateRequest, owner_id: str) -> ProjectDetailResponse:
        project = Project(
            id=BaseModel.generate_id("proj"),
            name=request.name,
            code=self._generate_code(request.type),
            description=request.description,
            type=request.type,
            genome=request.genome,
            owner_id=owner_id
        )
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return ProjectDetailResponse(
            id=project.id,
            name=project.name,
            code=project.code,
            description=project.description,
            type=project.type,
            status=project.status,
            genome=project.genome,
            owner={"id": project.owner_id, "name": project.owner.name if project.owner else None},
            createdAt=project.created_at.isoformat() if project.created_at else None,
            updatedAt=project.updated_at.isoformat() if project.updated_at else None
        )

    def get_project(self, project_id: str) -> ProjectDetailResponse:
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise NotFoundException("项目")
        return ProjectDetailResponse(
            id=project.id,
            name=project.name,
            code=project.code,
            description=project.description,
            type=project.type,
            status=project.status,
            genome=project.genome,
            owner={"id": project.owner_id, "name": project.owner.name if project.owner else None},
            createdAt=project.created_at.isoformat() if project.created_at else None,
            updatedAt=project.updated_at.isoformat() if project.updated_at else None
        )

    def update_project(self, project_id: str, current_user_id: str, request: ProjectUpdateRequest) -> ProjectDetailResponse:
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise NotFoundException("项目")
        if project.owner_id != current_user_id:
            raise BadRequestException(detail="Only owner can update project")

        if request.name is not None:
            project.name = request.name
        if request.description is not None:
            project.description = request.description
        if request.status is not None:
            project.status = request.status

        self.db.commit()
        self.db.refresh(project)
        return ProjectDetailResponse(
            id=project.id,
            name=project.name,
            code=project.code,
            description=project.description,
            type=project.type,
            status=project.status,
            genome=project.genome,
            owner={"id": project.owner_id, "name": project.owner.name if project.owner else None},
            createdAt=project.created_at.isoformat() if project.created_at else None,
            updatedAt=project.updated_at.isoformat() if project.updated_at else None
        )

    def delete_project(self, project_id: str, current_user_id: str):
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise NotFoundException("项目")
        if project.owner_id != current_user_id:
            raise BadRequestException(detail="Only owner can delete project")
        self.db.delete(project)
        self.db.commit()
        return {"message": "项目删除成功"}
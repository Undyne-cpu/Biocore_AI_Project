from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.result import Result, Report
from app.models.base import BaseModel
from app.schemas.result import ResultResponse, ResultDetailResponse, ReportResponse, ReportDetailResponse
from app.utils.exceptions import NotFoundException


class ResultService:
    def __init__(self, db: Session):
        self.db = db

    def get_results(self, project_id: Optional[str] = None, tool_id: Optional[str] = None,
                    status: Optional[str] = None, search: Optional[str] = None, user_id: str = None):
        query = self.db.query(Result)
        if user_id:
            query = query.filter(Result.owner_id == user_id)
        if project_id:
            query = query.filter(Result.project_id == project_id)
        if tool_id:
            query = query.filter(Result.tool_id == tool_id)
        if status:
            query = query.filter(Result.status == status)
        if search:
            query = query.filter(Result.name.ilike(f"%{search}%"))

        results = query.all()
        return [ResultResponse(
            id=r.id,
            name=r.name,
            tool=r.tool_id,
            project=r.project_id,
            status=r.status,
            createdAt=r.created_at.isoformat() if r.created_at else None,
            duration=r.duration
        ) for r in results]

    def get_result(self, result_id: str) -> ResultDetailResponse:
        result = self.db.query(Result).filter(Result.id == result_id).first()
        if not result:
            raise NotFoundException("结果")
        return ResultDetailResponse(
            id=result.id,
            name=result.name,
            tool=result.tool_id,
            project=result.project_id,
            status=result.status,
            createdAt=result.created_at.isoformat() if result.created_at else None,
            duration=result.duration,
            files=result.files
        )

    def delete_result(self, result_id: str, user_id: str):
        result = self.db.query(Result).filter(Result.id == result_id).first()
        if not result:
            raise NotFoundException("结果")
        if result.owner_id != user_id:
            from app.utils.exceptions import ForbiddenException
            raise ForbiddenException(detail="Only owner can delete result")
        self.db.delete(result)
        self.db.commit()
        return {"message": "结果删除成功"}


class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def get_reports(self, user_id: str = None):
        query = self.db.query(Report)
        if user_id:
            query = query.filter(Report.owner_id == user_id)
        reports = query.all()
        return [ReportResponse(
            id=r.id,
            name=r.name,
            project=r.project_id,
            createdAt=r.created_at.isoformat() if r.created_at else None
        ) for r in reports]

    def get_report(self, report_id: str) -> ReportDetailResponse:
        report = self.db.query(Report).filter(Report.id == report_id).first()
        if not report:
            raise NotFoundException("报告")
        return ReportDetailResponse(
            id=report.id,
            name=report.name,
            project=report.project_id,
            type=report.type,
            status=report.status,
            content=report.content,
            createdAt=report.created_at.isoformat() if report.created_at else None
        )

    def create_report(self, project_id: str, report_type: str,
                      template: Optional[str] = None, user_id: str = None) -> ReportDetailResponse:
        report = Report(
            id=BaseModel.generate_id("report"),
            name=f"报告_{report_type}",
            project_id=project_id,
            type=report_type,
            template=template,
            owner_id=user_id
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return ReportDetailResponse(
            id=report.id,
            name=report.name,
            project=report.project_id,
            type=report.type,
            status=report.status,
            content=report.content,
            createdAt=report.created_at.isoformat() if report.created_at else None
        )
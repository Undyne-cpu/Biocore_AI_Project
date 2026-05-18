from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.result import ReportCreateRequest
from app.services.result_service import ResultService, ReportService
from app.utils.response import success_response

router = APIRouter(prefix="/results", tags=["结果"])


@router.get("")
async def get_results(
    projectId: Optional[str] = Query(None),
    toolId: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ResultService(db)
    result = service.get_results(projectId, toolId, status, search, current_user.id)
    return success_response(result)


@router.get("/{result_id}")
async def get_result(
    result_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ResultService(db)
    result = service.get_result(result_id)
    return success_response(result)


@router.get("/{result_id}/files")
async def get_result_files(
    result_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取结果文件列表，提供可访问的URL"""
    from app.core.config import get_settings
    from app.tools.minio_client import MinIOClient

    service = ResultService(db)
    result = service.get_result(result_id)

    if not result.files:
        return success_response({"files": []})

    settings = get_settings()
    minio_client = MinIOClient(
        endpoint=settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        bucket=settings.MINIO_BUCKET,
        secure=settings.MINIO_SECURE
    )

    files_with_urls = []
    for i, file_path in enumerate(result.files):
        try:
            url = minio_client.get_presigned_url(file_path, expires_hours=24)
            files_with_urls.append({
                "index": i,
                "name": file_path.split("/")[-1],
                "path": file_path,
                "url": url,
                "type": "html" if file_path.endswith(".html") else "zip" if file_path.endswith(".zip") else "other"
            })
        except Exception:
            files_with_urls.append({
                "index": i,
                "name": file_path.split("/")[-1],
                "path": file_path,
                "url": None,
                "type": "other"
            })

    return success_response({"files": files_with_urls})


@router.get("/{result_id}/download")
async def download_result(
    result_id: str,
    fileId: Optional[str] = Query(None),
    format: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return JSONResponse({"message": "Download would stream from MinIO storage"})


@router.delete("/{result_id}")
async def delete_result(
    result_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ResultService(db)
    result = service.delete_result(result_id, current_user.id)
    return success_response(result, "结果删除成功")


reports_router = APIRouter(prefix="/reports", tags=["报告"])


@reports_router.get("")
async def get_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ReportService(db)
    result = service.get_reports(current_user.id)
    return success_response(result)


@reports_router.get("/{report_id}")
async def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ReportService(db)
    result = service.get_report(report_id)
    return success_response(result)


@reports_router.post("")
async def create_report(
    request: ReportCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ReportService(db)
    result = service.create_report(
        project_id=request.projectId,
        report_type=request.type,
        template=request.template,
        user_id=current_user.id
    )
    return success_response(result, "报告创建成功")


@reports_router.get("/{report_id}/download")
async def download_report(
    report_id: str,
    format: str = Query("pdf"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return JSONResponse({"message": "Download would generate PDF from template"})
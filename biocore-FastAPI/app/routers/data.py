from typing import Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.data import DataListResponse, DataFileDetailResponse, DataFileUploadResponse
from app.services.data_service import DataService
from app.utils.response import success_response

router = APIRouter(prefix="/data", tags=["数据管理"])


@router.get("")
async def get_files(
    projectId: Optional[str] = Query(None),
    format: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DataService(db)
    result = service.get_files(projectId, format, type, search, page, pageSize, current_user.id)
    return success_response(result)


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    projectId: Optional[str] = Query(None),
    type: str = Query("raw"),
    description: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    import os
    import tempfile
    from app.core.config import get_settings

    settings = get_settings()

    # Save uploaded file to temp
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, file.filename)

    content = await file.read()
    with open(temp_path, "wb") as f:
        f.write(content)

    file_size = len(content)
    if file_size > 1024 * 1024 * 1024:
        size_str = f"{file_size / (1024**3):.1f} GB"
    elif file_size > 1024 * 1024:
        size_str = f"{file_size / (1024**2):.1f} MB"
    else:
        size_str = f"{file_size / 1024:.1f} KB"

    import hashlib
    md5_hash = hashlib.md5(content).hexdigest()

    ext = os.path.splitext(file.filename)[1].lower()
    format_map = {".fasta": "fasta", ".fa": "fasta", ".fastq": "fastq", ".fq": "fastq",
                  ".bam": "bam", ".vcf": "vcf", ".bed": "bed", ".gz": "other"}
    file_format = format_map.get(ext, "other")

    # Upload to MinIO
    project_prefix = f"projects/{projectId or 'shared'}" if projectId else "shared"
    minio_path = f"input/{project_prefix}/data/{file.filename}"
    minio_url = f"minio://{settings.MINIO_BUCKET}/{minio_path}"

    try:
        from app.tools.minio_client import MinIOClient
        minio_client = MinIOClient(
            endpoint=settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            bucket=settings.MINIO_BUCKET,
            secure=settings.MINIO_SECURE
        )
        minio_client.upload_file(temp_path, minio_path)
    except Exception as e:
        # If MinIO fails, still save to database but with local path
        minio_url = f"local://{file.filename}"

    storage_path = f"/storage/{minio_path}"

    service = DataService(db)
    result = service.create_file(
        name=file.filename,
        file_type=type,
        format=file_format,
        size=size_str,
        path=storage_path,
        project_id=projectId,
        uploader_id=current_user.id,
        description=description,
        minio_path=minio_path
    )

    os.remove(temp_path)
    return success_response(result, "文件上传成功")


@router.get("/{file_id}")
async def get_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DataService(db)
    result = service.get_file(file_id)
    return success_response(result)


@router.get("/{file_id}/download")
async def download_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DataService(db)
    file = service.get_file(file_id)
    from fastapi.responses import JSONResponse
    return JSONResponse({"message": "Download would stream from MinIO storage", "path": file.path})


@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DataService(db)
    result = service.delete_file(file_id, current_user.id)
    return success_response(result, "文件删除成功")
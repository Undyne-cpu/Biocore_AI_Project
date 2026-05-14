from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserDetailResponse, UserUpdateRequest, PasswordChangeRequest, UserSettingsResponse, UserSettingsUpdateRequest
from app.schemas.base import BaseResponse
from app.services.user_service import UserService
from app.utils.response import success_response

router = APIRouter(prefix="/users", tags=["用户"])


@router.get("")
async def get_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = UserService(db)
    result = service.get_users(page, page_size, search)
    return success_response(result)


@router.get("/{user_id}")
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = UserService(db)
    result = service.get_user(user_id)
    return success_response(result)


@router.put("/{user_id}")
async def update_user(
    user_id: str,
    request: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = UserService(db)
    result = service.update_user(user_id, current_user, request)
    return success_response(result, "更新成功")


@router.put("/{user_id}/password")
async def update_password(
    user_id: str,
    request: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = UserService(db)
    result = service.update_password(user_id, current_user, request)
    return success_response(result, "密码修改成功")


@router.get("/{user_id}/settings")
async def get_settings(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = UserService(db)
    result = service.get_settings(user_id)
    return success_response(result)


@router.put("/{user_id}/settings")
async def update_settings(
    user_id: str,
    request: UserSettingsUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = UserService(db)
    result = service.update_settings(user_id, request)
    return success_response(result, "设置更新成功")
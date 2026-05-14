from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, RefreshRequest, TokenResponse, UserMeResponse
from app.schemas.base import BaseResponse
from app.services.auth_service import AuthService
from app.utils.response import success_response

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/register")
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    result = service.register(request)
    return success_response(result, "注册成功")


@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    result = service.login(request)
    return success_response(result, "登录成功")


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = AuthService(db)
    service.logout(current_user.id)
    return success_response(message="登出成功")


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return success_response(UserMeResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        institution=current_user.institution,
        avatar=current_user.avatar,
        bio=current_user.bio,
        role=current_user.role
    ))


@router.post("/refresh")
async def refresh(request: RefreshRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    tokens = service.refresh(request.refreshToken)
    return success_response(tokens)
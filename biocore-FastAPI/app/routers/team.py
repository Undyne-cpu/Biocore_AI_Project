from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.team import TeamInviteRequest
from app.services.team_service import TeamService
from app.utils.response import success_response

router = APIRouter(prefix="/team", tags=["团队"])


@router.get("")
async def get_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TeamService(db)
    result = service.get_members()
    return success_response(result)


@router.post("/invite")
async def invite_member(
    request: TeamInviteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TeamService(db)
    result = service.invite_member(request.email, request.role, current_user.id)
    return success_response(result, "邀请已发送")


@router.delete("/{member_id}")
async def remove_member(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TeamService(db)
    result = service.remove_member(member_id, current_user.id)
    return success_response(result, "成员已移除")


@router.put("/{member_id}/role")
async def update_role(
    member_id: str,
    role: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TeamService(db)
    result = service.update_role(member_id, role, current_user.id)
    return success_response(result, "角色已修改")
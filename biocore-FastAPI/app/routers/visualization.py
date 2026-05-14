from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.utils.response import success_response

router = APIRouter(prefix="/visualize", tags=["可视化"])


@router.get("/data")
async def get_visualization_data(
    projectId: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return success_response({"data": [], "message": "Visualization data endpoint"})


@router.get("/genome")
async def get_genome_data(
    region: str = Query(...),
    dataId: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return success_response({
        "chromosome": region.split(":")[0] if ":" in region else region,
        "start": 1000000,
        "end": 2000000,
        "tracks": []
    })


@router.get("/charts")
async def get_chart_data(
    chartType: str = Query(...),
    projectId: Optional[str] = Query(None),
    dataRange: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return success_response({
        "categories": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        "series": [
            {"name": "本周", "data": [12, 15, 8, 18, 22, 16, 20]},
            {"name": "上周", "data": [8, 12, 10, 14, 16, 12, 14]}
        ]
    })
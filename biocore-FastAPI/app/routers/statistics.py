from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.utils.response import success_response

router = APIRouter(prefix="/statistics", tags=["统计"])


@router.get("/dashboard")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return success_response({
        "totalProjects": 12,
        "totalStorage": "256 GB",
        "storageUsed": "128 GB",
        "completedTasks": 48,
        "runningTasks": 2,
        "recentProjects": [
            {"name": "全基因组测序分析", "meta": "WGS-2024-001 · 2小时前", "status": "completed"}
        ],
        "runningTasksList": [
            {"name": "差异表达分析", "step": "步骤 3/5: DESeq2分析", "progress": 65, "remainingTime": "12分钟"}
        ]
    })


@router.get("/usage")
async def get_usage_stats(
    startDate: Optional[str] = Query(None),
    endDate: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return success_response({
        "toolUsage": [
            {"tool": "FastQC", "count": 1250},
            {"tool": "BWA-MEM", "count": 980},
            {"tool": "GATK HaplotypeCaller", "count": 856}
        ],
        "totalUsage": 5347,
        "trend": []
    })


@router.get("/trend")
async def get_trend_data(
    period: str = Query("day"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return success_response({
        "labels": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        "thisWeek": [12, 15, 8, 18, 22, 16, 20],
        "lastWeek": [8, 12, 10, 14, 16, 12, 14]
    })
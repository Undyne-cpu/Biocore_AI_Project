from celery import Celery
from app.core.config import get_settings

# Import all models to ensure SQLAlchemy relationships are resolved
from app.models import user, project, tool, result, data, workflow, team  # noqa

settings = get_settings()

celery_app = Celery(
    "biocore",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tools.tasks.tool_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=7200,
    task_soft_time_limit=3600,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    result_expires=86400,
)

celery_app.conf.beat_schedule = {}


def get_celery_app():
    return celery_app
from celery import Task
from app.celery_app import celery_app
from app.tools.executor import ToolExecutor
from app.tools.minio_client import MinIOClient
from app.core.config import get_settings
from app.database import SessionLocal
from app.models.result import Result
from app.models.base import BaseModel
from app.models.user import User
import tempfile
import os


class DatabaseTask(Task):
    _db = None

    @property
    def db(self):
        if self._db is None:
            self._db = SessionLocal()
        return self._db

    def after_return(self, status, retval, task_id, args, kwargs, einfo):
        if self._db:
            self._db.close()
            self._db = None


@celery_app.task(bind=True, base=DatabaseTask, name="tools.run_fastqc")
def run_fastqc_task(
    self,
    tool_id: str,
    tool_name: str,
    tool_version: str,
    image: str,
    input_files: list[str],
    output_prefix: str,
    parameters: dict = None,
    user_id: str = None,
    project_id: str = None
) -> dict:
    """Execute FastQC analysis task."""
    task_id = self.request.id
    settings = get_settings()

    minio_client = MinIOClient(
        endpoint=settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        bucket=settings.MINIO_BUCKET,
        secure=settings.MINIO_SECURE
    )

    executor = ToolExecutor()

    result = Result(
        id=BaseModel.generate_id("result"),
        name=f"FastQC_{task_id[:8]}",
        tool_id=tool_id,
        project_id=project_id,
        status="running",
        owner_id=user_id
    )
    self.db.add(result)
    self.db.commit()

    try:
        input_local_paths = minio_client.download_files_to_temp(input_files)

        output_dir = tempfile.mkdtemp(prefix="biocore_output_")

        container_input_paths = {}
        for i, (obj_path, local_path) in enumerate(input_local_paths.items()):
            container_input_paths[local_path] = f"/data/input/file_{i}.fastq"

        output_dir_container = "/data/output"
        container_output_paths = {output_dir: output_dir_container}

        fastqc_command = ["fastqc", "-o", output_dir_container, "-f", "fastq"]
        for cp in container_input_paths.values():
            fastqc_command.append(cp)

        if parameters and parameters.get("extra_params"):
            fastqc_command.extend(parameters["extra_params"].split())

        result_container = executor.run_container(
            image=image,
            command=fastqc_command,
            input_paths=container_input_paths,
            output_paths=container_output_paths
        )

        output_objects = minio_client.upload_directory(output_dir, output_prefix)

        result.status = result_container["status"]
        result.files = output_objects
        self.db.commit()

        minio_client.cleanup_temp_files(input_local_paths)

        for f in os.listdir(output_dir):
            try:
                os.remove(os.path.join(output_dir, f))
            except Exception:
                pass
        os.rmdir(output_dir)

        return {
            "status": result_container["status"],
            "task_id": task_id,
            "result_id": result.id,
            "output_files": output_objects,
            "logs": result_container["logs"]
        }

    except Exception as e:
        result.status = "failed"
        self.db.commit()
        raise Exception(f"FastQC execution failed: {str(e)}")


@celery_app.task(bind=True, base=DatabaseTask, name="tools.get_status")
def get_tool_execution_status(self, result_id: str) -> dict:
    result = self.db.query(Result).filter(Result.id == result_id).first()
    if not result:
        return {"status": "not_found"}
    return {
        "id": result.id,
        "status": result.status,
        "files": result.files,
        "duration": result.duration
    }
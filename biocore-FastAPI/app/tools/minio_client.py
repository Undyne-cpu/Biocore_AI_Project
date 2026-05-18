import os
import tempfile
import uuid
from datetime import timedelta
from typing import Optional


class MinIOClient:
    """Handles file operations with MinIO storage."""

    def __init__(
        self,
        endpoint: str,
        access_key: str,
        secret_key: str,
        bucket: str,
        secure: bool = False
    ):
        from minio import Minio
        self.client = Minio(
            endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure
        )
        self.bucket = bucket
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        if not self.client.bucket_exists(self.bucket):
            self.client.make_bucket(self.bucket)

    def download_file(self, object_name: str, target_path: str) -> str:
        self.client.fget_object(self.bucket, object_name, target_path)
        return target_path

    def upload_file(self, local_path: str, object_name: str) -> str:
        self.client.fput_object(self.bucket, object_name, local_path)
        return object_name

    def download_files_to_temp(self, object_names: list[str]) -> dict[str, str]:
        temp_dir = tempfile.mkdtemp(prefix="biocore_tool_")
        local_paths = {}

        for obj_name in object_names:
            ext = os.path.splitext(obj_name)[1]
            local_path = os.path.join(temp_dir, f"{uuid.uuid4().hex[:8]}{ext}")
            self.download_file(obj_name, local_path)
            local_paths[obj_name] = local_path

        return local_paths

    def upload_directory(self, local_dir: str, prefix: str) -> list[str]:
        object_paths = []
        for filename in os.listdir(local_dir):
            local_path = os.path.join(local_dir, filename)
            if os.path.isfile(local_path):
                object_path = f"{prefix}/{filename}"
                self.upload_file(local_path, object_path)
                object_paths.append(object_path)
        return object_paths

    from datetime import timedelta

    def get_presigned_url(self, object_name: str, expires_hours: int = 1) -> str:
        return self.client.presigned_get_object(
            self.bucket, object_name, expires=timedelta(hours=expires_hours)
        )

    def cleanup_temp_files(self, local_paths: dict[str, str]):
        for path in local_paths.values():
            if os.path.exists(path):
                os.remove(path)
        temp_dirs = set(os.path.dirname(p) for p in local_paths.values())
        for temp_dir in temp_dirs:
            try:
                os.rmdir(temp_dir)
            except OSError:
                pass

    def get_client(self):
        return self.client

    def bucket_exists(self):
        return self.client.bucket_exists(self.bucket)
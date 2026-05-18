import docker
import uuid
from typing import Optional, Callable


class ToolExecutor:
    """Manages Docker container execution for bioinformatics tools."""

    def __init__(self):
        self.docker_client = docker.from_env()

    def run_container(
        self,
        image: str,
        command: list[str],
        input_paths: dict[str, str],
        output_paths: dict[str, str],
        environment: Optional[dict] = None,
        timeout: int = 3600
    ) -> dict:
        """
        Run a tool in a Docker container.

        Args:
            image: Docker image name (e.g., "biocore/fastqc:0.11.9")
            command: Command and arguments as list
            input_paths: Dict mapping local paths to container mount paths
            output_paths: Dict mapping container output paths to local paths
            environment: Optional env vars
            timeout: Timeout in seconds (default 1 hour)

        Returns:
            dict with status, logs, output_files, exit_code
        """
        container_name = f"tool_{uuid.uuid4().hex[:8]}"

        volumes = {}
        for local_path, container_path in {**input_paths, **output_paths}.items():
            volumes[local_path] = {"bind": container_path, "mode": "rw"}

        container = self.docker_client.containers.run(
            image=image,
            command=command,
            volumes=volumes,
            name=container_name,
            environment=environment,
            detach=True,
            remove=False
        )

        try:
            result = container.wait(timeout=timeout)
            exit_code = result.get("StatusCode", -1)
            logs = container.logs().decode("utf-8")

            return {
                "status": "completed" if exit_code == 0 else "failed",
                "exit_code": exit_code,
                "logs": logs,
                "output_files": list(output_paths.values())
            }
        finally:
            try:
                container.remove(force=True)
            except Exception:
                pass

    def get_container_status(self, container_id: str) -> dict:
        try:
            container = self.docker_client.containers.get(container_id)
            return {
                "id": container.id,
                "status": container.status,
                "created": container.attrs.get("Created")
            }
        except docker.errors.NotFound:
            return {"status": "not_found"}

    def stream_logs(self, container_id: str, callback: Callable[[str], None]):
        try:
            container = self.docker_client.containers.get(container_id)
            for log in container.logs(stream=True):
                callback(log.decode("utf-8").strip())
        except docker.errors.NotFound:
            pass
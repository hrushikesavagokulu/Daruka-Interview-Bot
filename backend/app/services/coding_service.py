import os
import uuid
import socket
import json
import asyncio
import shutil
from typing import Dict, Any, Optional

from app.core.config import settings

# Directory inside the backend container where we write code files
LOCAL_TEMP_DIR = "/app/temp_sandbox_code"

# Cache of host path to avoid inspecting on every run
_cached_host_path: Optional[str] = None

async def _get_host_path() -> str:
    """
    Retrieves the absolute path on the host filesystem that maps to /app.
    This is required for docker volume mount paths.
    """
    global _cached_host_path
    if _cached_host_path is not None:
        return _cached_host_path

    try:
        hostname = socket.gethostname()
        process = await asyncio.create_subprocess_exec(
            "docker", "inspect", hostname,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        if process.returncode == 0:
            info = json.loads(stdout.decode().strip())[0]
            mounts = info.get("Mounts", [])
            app_mount = next((m for m in mounts if m["Destination"] == "/app"), None)
            if app_mount:
                _cached_host_path = app_mount["Source"]
                print(f"[CodingService] Resolved host path for /app: {_cached_host_path}")
                return _cached_host_path
    except Exception as err:
        print(f"[CodingService] Warning: Failed to inspect host path: {err}")

    # Fallback to local /app if we cannot inspect (e.g. non-docker dev environment)
    _cached_host_path = "/app"
    return _cached_host_path

async def run_code(language: str, code: str, stdin: Optional[str] = None) -> Dict[str, Any]:
    """
    Executes user submitted code inside a secure docker container sandbox.
    Enforces memory, CPU, network, process limits, and a hard 10-second timeout.
    
    Returns:
        Dict containing: stdout, stderr, exit_code, timed_out
    """
    lang = language.lower()
    if lang not in ["python", "java"]:
        return {
            "stdout": "",
            "stderr": f"Unsupported language: {language}",
            "exit_code": 1,
            "timed_out": False
        }

    # 1. Create a unique folder for this run
    run_id = str(uuid.uuid4())
    container_name = f"daruka-sandbox-{run_id}"
    local_run_dir = os.path.join(LOCAL_TEMP_DIR, run_id)
    os.makedirs(local_run_dir, exist_ok=True)

    # 2. Write code to file
    file_name = "script.py" if lang == "python" else "Main.java"
    local_file_path = os.path.join(local_run_dir, file_name)
    with open(local_file_path, "w", encoding="utf-8") as f:
        f.write(code)

    # 3. Formulate the docker commands
    host_base_path = await _get_host_path()
    host_run_dir = os.path.join(host_base_path, "temp_sandbox_code", run_id)

    # Adjust paths if the host path is a Windows backslash path
    if "\\" in host_run_dir:
        host_run_dir = host_run_dir.replace("\\", "/")

    image_name = "daruka-python-sandbox" if lang == "python" else "daruka-java-sandbox"
    
    if lang == "python":
        run_command_args = ["python", "/code/script.py"]
    else:
        # For Java: compile Main.java into /tmp, then execute
        run_command_args = ["sh", "-c", "javac /code/Main.java -d /tmp && java -cp /tmp Main"]

    docker_args = [
        "run", "--rm",
        "--name", container_name,
        "--network", "none",
        "--memory", "256m",
        "--cpus", "0.5",
        "--ulimit", "nproc=50",
        "--ulimit", "fsize=10485760",
        "--read-only",
        "--tmpfs", "/tmp:size=50m",
        "--user", "1001",
        "-v", f"{host_run_dir}:/code:ro",
        "-i",
        image_name
    ] + run_command_args

    print(f"[CodingService] Launching sandbox container {container_name}")
    
    # 4. Spawn the subprocess
    process = await asyncio.create_subprocess_exec(
        "docker", *docker_args,
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    stdin_bytes = stdin.encode("utf-8") if stdin else b""
    timed_out = False
    stdout = b""
    stderr = b""
    exit_code = None

    try:
        # Enforce 10-second execution timeout
        stdout, stderr = await asyncio.wait_for(
            process.communicate(input=stdin_bytes),
            timeout=10.0
        )
        exit_code = process.returncode
    except asyncio.TimeoutError:
        print(f"[CodingService] Timeout exceeded for run {run_id}. Terminating container.")
        timed_out = True
        try:
            process.kill()
        except OSError:
            pass
        # Asynchronously stop/remove the running sandbox container to free resources
        asyncio.create_task(cleanup_container(container_name))
        stderr = b"Error: Code execution timed out (limit: 10s)."
    except Exception as err:
        print(f"[CodingService] Subprocess execution error: {err}")
        stderr = f"Internal Sandbox Execution Error: {str(err)}".encode("utf-8")
        exit_code = 1
    finally:
        # 5. Clean up temporary files on disk
        try:
            shutil.rmtree(local_run_dir, ignore_errors=True)
        except Exception as cleanup_err:
            print(f"[CodingService] Failed to cleanup temp directory {local_run_dir}: {cleanup_err}")

    return {
        "stdout": stdout.decode("utf-8", errors="replace"),
        "stderr": stderr.decode("utf-8", errors="replace"),
        "exit_code": exit_code,
        "timed_out": timed_out
    }

async def cleanup_container(container_name: str):
    """
    Cleans up/kills a timed out sandbox container.
    """
    try:
        proc = await asyncio.create_subprocess_exec(
            "docker", "rm", "-f", container_name,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL
        )
        await proc.wait()
        print(f"[CodingService] Forcefully removed container {container_name}")
    except Exception as err:
        print(f"[CodingService] Failed to clean up container {container_name}: {err}")

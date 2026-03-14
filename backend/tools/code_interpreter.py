"""Code interpreter tool — sandboxed Python/JS execution via subprocess."""

import asyncio
import logging
import os
import tempfile
from typing import Any

from tools.base import BaseTool
from tools.registry import tool_registry

logger = logging.getLogger(__name__)

TIMEOUT_SECONDS = 60
MAX_OUTPUT_CHARS = 10_000

_LANGUAGE_CONFIG: dict[str, dict[str, Any]] = {
    "python": {
        "executable": "python3",
        "suffix": ".py",
    },
    "javascript": {
        "executable": "node",
        "suffix": ".js",
    },
    "js": {
        "executable": "node",
        "suffix": ".js",
    },
}


class CodeInterpreterTool(BaseTool):
    """Execute Python or JavaScript code in a sandboxed subprocess environment."""

    name = "code_interpreter"
    description = "Execute Python or JavaScript code in a sandboxed environment"

    async def execute(self, **kwargs: Any) -> str:
        """Run code and return combined stdout/stderr output.

        Args:
            code: Source code to execute
            language: 'python' (default), 'javascript', or 'js'
        """
        code = kwargs.get("code", "")
        language = kwargs.get("language", "python").lower()

        if not code.strip():
            return "No code provided."

        config = _LANGUAGE_CONFIG.get(language)
        if config is None:
            supported = list(_LANGUAGE_CONFIG.keys())
            return f"Unsupported language '{language}'. Supported: {supported}"

        return await self._run_in_subprocess(code, config)

    async def _run_in_subprocess(self, code: str, config: dict[str, Any]) -> str:
        executable = config["executable"]
        suffix = config["suffix"]

        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=suffix,
            delete=False,
            encoding="utf-8",
        ) as temp_file:
            temp_file.write(code)
            temp_path = temp_file.name

        try:
            process = await asyncio.create_subprocess_exec(
                executable,
                temp_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env={
                    "PATH": os.environ.get("PATH", "/usr/bin:/bin"),
                    "HOME": tempfile.gettempdir(),
                    "PYTHONDONTWRITEBYTECODE": "1",
                    "LANG": "en_US.UTF-8",
                },
            )
            try:
                stdout_bytes, stderr_bytes = await asyncio.wait_for(
                    process.communicate(), timeout=TIMEOUT_SECONDS
                )
            except asyncio.TimeoutError:
                process.kill()
                await process.communicate()
                return f"Execution timed out after {TIMEOUT_SECONDS} seconds."

            stdout = stdout_bytes.decode("utf-8", errors="replace")
            stderr = stderr_bytes.decode("utf-8", errors="replace")

            output_parts = []
            if stdout:
                output_parts.append(stdout)
            if stderr:
                output_parts.append(f"[stderr]\n{stderr}")

            output = "\n".join(output_parts) if output_parts else "(no output)"

            if len(output) > MAX_OUTPUT_CHARS:
                output = output[:MAX_OUTPUT_CHARS] + f"\n... [truncated at {MAX_OUTPUT_CHARS} chars]"

            exit_code = process.returncode
            if exit_code != 0:
                output += f"\n[exit code: {exit_code}]"

            logger.info(f"code_interpreter executed {executable}, exit={exit_code}")
            return output

        finally:
            try:
                os.unlink(temp_path)
            except OSError:
                pass


tool_registry.register(CodeInterpreterTool())

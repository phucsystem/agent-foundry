"""Terminal tool — bash command runner with safety restrictions."""

import asyncio
import logging
import shlex
from typing import Any

from tools.base import BaseTool
from tools.registry import tool_registry

logger = logging.getLogger(__name__)

TIMEOUT_SECONDS = 30
MAX_OUTPUT_CHARS = 10_000

ALLOWED_COMMANDS = {
    "ls", "cat", "head", "tail", "echo", "pwd", "date", "wc",
    "find", "grep", "rg", "sort", "uniq", "diff", "tree",
    "python3", "python", "node", "npm", "pip", "git",
    "make", "docker", "curl", "wget",
}

BLOCKED_PATTERNS = [
    "rm -rf /", "rm -rf ~", "sudo ", "chmod 777", "mkfs",
    "dd if=", "> /dev/", ":(){ :|:& };:",
]


class TerminalTool(BaseTool):
    """Run bash commands with allowlist-first safety restrictions."""

    name = "terminal"
    description = "Run bash commands with safety restrictions"

    async def execute(self, **kwargs: Any) -> str:
        """Execute a bash command after safety validation."""
        command = kwargs.get("command", "").strip()
        if not command:
            return "No command provided."

        rejection = self._validate_command(command)
        if rejection:
            logger.warning(f"terminal blocked: {rejection} — {command!r}")
            return f"Command blocked: {rejection}"

        return await self._run_command(command)

    def _validate_command(self, command: str) -> str | None:
        """Validate command. Returns rejection reason or None if safe."""
        normalized = " ".join(command.lower().split())

        for pattern in BLOCKED_PATTERNS:
            if pattern in normalized:
                return f"contains disallowed pattern '{pattern}'"

        try:
            tokens = shlex.split(command)
        except ValueError:
            return "could not parse command safely"

        if not tokens:
            return "empty command"

        base_command = tokens[0].split("/")[-1]
        if base_command not in ALLOWED_COMMANDS:
            return f"command '{base_command}' not in allowlist"

        return None

    async def _run_command(self, command: str) -> str:
        try:
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            try:
                stdout_bytes, stderr_bytes = await asyncio.wait_for(
                    process.communicate(), timeout=TIMEOUT_SECONDS
                )
            except asyncio.TimeoutError:
                process.kill()
                await process.communicate()
                return f"Command timed out after {TIMEOUT_SECONDS} seconds."

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

            return output

        except Exception as error:
            logger.error(f"terminal error: {error}")
            return f"Error executing command: {error}"


tool_registry.register(TerminalTool())

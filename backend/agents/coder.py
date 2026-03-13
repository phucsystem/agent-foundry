"""Coder agent — code generation, review, and debugging."""

from agents.base import BaseAgent, TaskInput, TaskResult


class CoderAgent(BaseAgent):
    """Agent specialised in code generation and software engineering tasks."""

    agent_id = "coder"
    name = "Code Expert"
    role = "Senior software engineer"

    async def execute(self, task: TaskInput) -> TaskResult:
        """Execute coding task."""
        return TaskResult(
            status="completed",
            output=f"Stub: would process coding task — {task.goal}",
        )

"""Base agent class defining the agent contract."""

from abc import ABC, abstractmethod
from typing import Any

from pydantic import BaseModel


class TaskInput(BaseModel):
    """Input contract for agent task execution."""

    goal: str
    context: str | None = None
    budget_usd: float = 10.0
    timeout_seconds: int = 300


class TaskResult(BaseModel):
    """Output contract for agent task execution."""

    status: str
    output: str
    tokens_used: int = 0
    cost_usd: float = 0.0
    metadata: dict[str, Any] | None = None


class BaseAgent(ABC):
    """Abstract base agent — all agents inherit from this."""

    agent_id: str
    name: str
    role: str

    @abstractmethod
    async def execute(self, task: TaskInput) -> TaskResult:
        """Execute a task and return structured result."""
        ...

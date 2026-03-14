"""Pydantic state models for workflow orchestration."""

from pydantic import BaseModel, Field


class AgentResult(BaseModel):
    agent_id: str
    status: str  # completed, failed
    output: str
    cost_usd: float = 0.0
    duration_seconds: float = 0.0


class WorkflowState(BaseModel):
    task_id: str
    goal: str
    context: str = ""
    agent_results: dict[str, AgentResult] = Field(default_factory=dict)
    current_step: str = "routing"
    error_count: int = 0
    max_errors: int = 3

    @property
    def total_cost(self) -> float:
        return sum(result.cost_usd for result in self.agent_results.values())

    @property
    def is_complete(self) -> bool:
        return self.current_step == "complete"

    @property
    def has_failures(self) -> bool:
        return any(result.status == "failed" for result in self.agent_results.values())

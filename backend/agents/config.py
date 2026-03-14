"""Pydantic models for agent configuration and task I/O contracts."""

from typing import Any, Literal

from pydantic import BaseModel, Field

TaskStatus = Literal["completed", "failed", "partial"]


class LLMConfig(BaseModel):
    """LLM provider configuration routed through LiteLLM proxy."""

    model: str = "claude-sonnet"
    base_url: str = "http://litellm.localhost/v1"
    api_key: str = "dummy"
    temperature: float = 0.3
    max_tokens: int = 4096


class ToolConfig(BaseModel):
    """Configuration for a single tool."""

    name: str
    enabled: bool = True
    config: dict[str, Any] = Field(default_factory=dict)


class GuardrailConfig(BaseModel):
    """Guardrail limits for an agent."""

    max_budget_usd: float = 10.0
    max_runtime_seconds: int = 300
    output_schema: str = "TaskResult"
    block_prompt_injection: bool = True


class AgentConfig(BaseModel):
    """Full agent configuration loaded from YAML."""

    id: str
    name: str
    version: str = "1.0"
    role: str
    goal: str
    backstory: str = ""
    llm: LLMConfig = Field(default_factory=LLMConfig)
    tools: list[str] = Field(default_factory=list)
    memory_enabled: bool = True
    guardrails: GuardrailConfig = Field(default_factory=GuardrailConfig)
    pricing_cents_per_run: int = 50
    extends: str | None = None


class TaskInput(BaseModel):
    """Input contract for agent task execution."""

    task_id: str = ""
    agent_id: str = ""
    goal: str
    context: str | None = None
    budget_usd: float = 10.0
    timeout_seconds: int = 300
    metadata: dict[str, Any] = Field(default_factory=dict)


class TaskResult(BaseModel):
    """Output contract for agent task execution."""

    task_id: str = ""
    agent_id: str = ""
    status: TaskStatus
    output: str
    error: str | None = None
    tokens_used: int = 0
    cost_usd: float = 0.0
    duration_seconds: float = 0.0
    metadata: dict[str, Any] | None = None

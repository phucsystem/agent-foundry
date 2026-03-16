"""API request/response Pydantic models for the gateway."""

from typing import Literal
from datetime import datetime

from pydantic import BaseModel, Field


class CreateContentTaskRequest(BaseModel):
    """POST /api/tasks/content request body."""

    topic: str = Field(..., min_length=3, max_length=500)
    content_type: Literal["blog", "email", "social"] = "blog"
    brand_config_id: str = Field(default="default")
    target_word_count: int = Field(default=2000, ge=200, le=10000)
    keywords: list[str] = Field(default_factory=list)
    competitor_urls: list[str] = Field(default_factory=list)
    additional_context: str | None = None


class TaskResponse(BaseModel):
    """Task summary response."""

    task_id: str
    status: str
    task_type: str = "blog"
    topic: str = ""
    created_at: datetime | None = None
    completed_at: datetime | None = None


class TaskDetailResponse(TaskResponse):
    """Task detail with output."""

    output: dict | None = None
    tokens_used: int = 0
    cost_cents: int = 0


class CreateTaskResponse(BaseModel):
    """POST /api/tasks/content response."""

    task_id: str
    status: str = "pending"
    estimated_cost_cents: int = 50


class UserProfileResponse(BaseModel):
    """GET /api/users/me response."""

    user_id: str
    email: str
    credit_balance_cents: int = 500


class AgentResponse(BaseModel):
    """Agent listing response."""

    agent_id: str
    name: str
    description: str
    pricing_cents: int
    status: str = "available"


class CreateTopupRequest(BaseModel):
    """POST /api/credits/topup request."""

    package: Literal["small", "medium", "large"]


class TopupResponse(BaseModel):
    """Stripe checkout session response."""

    checkout_url: str
    session_id: str


class ErrorResponse(BaseModel):
    """Standard error response."""

    error: str
    message: str
    details: dict | None = None

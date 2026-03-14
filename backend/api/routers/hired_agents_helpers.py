"""Shared helpers for hired agent endpoints."""

import re

from fastapi import HTTPException
from pydantic import BaseModel, Field

UUID_PATTERN = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE)


class HireAgentRequest(BaseModel):
    plan: str = "solo"
    weekly_budget_usd: float = 100.00


class UpdateSettingsRequest(BaseModel):
    custom_instructions: str = Field(max_length=10_000)


class HiredAgentSummary(BaseModel):
    hire_id: str
    agent_id: str
    agent_name: str
    agent_role: str
    agent_color: str
    status: str
    plan: str
    weekly_budget_usd: float
    hired_at: str
    renews_at: str | None
    stats: dict
    has_custom_instructions: bool
    knowledge_file_count: int


def agent_color(agent_id: str) -> str:
    colors = {
        "coder": "#3B82F6", "research": "#10B981", "pm": "#F59E0B",
        "qa": "#EF4444", "copywriter": "#8B5CF6",
        "image-design": "#EC4899", "video-design": "#06B6D4",
    }
    return colors.get(agent_id, "#64748B")


def validate_uuid(value: str, label: str = "ID") -> str:
    if not UUID_PATTERN.match(value):
        raise HTTPException(status_code=400, detail=f"Invalid {label}: {value}")
    return value


async def get_hire_or_404(database, hire_id: str, user_id: str):
    validate_uuid(hire_id, "hire_id")
    row = await database.fetchrow(
        "SELECT * FROM hired_agents WHERE id = $1::uuid AND user_id = $2::uuid",
        hire_id, user_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Hired agent not found")
    return row


async def task_stats(database, hire_id: str) -> dict:
    row = await database.fetchrow(
        """SELECT
               COUNT(*) AS total_tasks,
               COUNT(*) FILTER (WHERE status = 'completed') AS completed,
               COUNT(*) FILTER (WHERE status = 'failed') AS failed,
               COUNT(*) FILTER (WHERE status IN ('running', 'queued')) AS active,
               COALESCE(AVG(cost_usd) FILTER (WHERE status = 'completed'), 0) AS avg_cost,
               COALESCE(AVG(runtime_seconds) FILTER (WHERE status = 'completed'), 0) AS avg_runtime,
               COALESCE(SUM(cost_usd), 0) AS total_spent
           FROM tasks WHERE hire_id = $1::uuid""",
        hire_id,
    )
    total = int(row["total_tasks"])
    completed = int(row["completed"])
    return {
        "total_tasks": total,
        "completed": completed,
        "failed": int(row["failed"]),
        "active": int(row["active"]),
        "success_rate": round(completed / total * 100, 1) if total > 0 else 0,
        "avg_cost_usd": round(float(row["avg_cost"]), 4),
        "avg_runtime_seconds": round(float(row["avg_runtime"]), 1),
        "total_spent_usd": round(float(row["total_spent"]), 4),
    }

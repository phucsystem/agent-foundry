"""Hired agent detail, settings, and knowledge file endpoints."""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, UploadFile, File

from api.routers.hired_agents_helpers import (
    UpdateSettingsRequest, agent_color, get_hire_or_404, task_stats, validate_uuid,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/{hire_id}")
async def get_hired_agent_detail(hire_id: str) -> dict:
    """Get full detail for a hired agent including settings, stats, and cost."""
    from database.connection import database
    from agents import agent_registry
    from agents.exceptions import AgentNotFoundError

    row = await get_hire_or_404(database, hire_id)

    agent_name = row["agent_id"].title()
    agent_role = row["agent_id"]
    agent_tools: list[str] = []
    agent_llm = "Claude Sonnet via LiteLLM"
    try:
        config = agent_registry.get_config(row["agent_id"])
        agent_name = config.name
        agent_role = config.role
        agent_tools = [tool.name for tool in (config.tools or [])] if hasattr(config, "tools") and config.tools else []
        if hasattr(config, "llm") and config.llm:
            agent_llm = config.llm.model if hasattr(config.llm, "model") else str(config.llm)
    except (AgentNotFoundError, Exception):
        pass

    stats = await task_stats(database, hire_id)
    knowledge_rows = await database.fetch(
        "SELECT id, file_name, size_bytes, uploaded_at FROM knowledge_files WHERE hire_id = $1::uuid ORDER BY uploaded_at",
        hire_id,
    )
    knowledge_files = [
        {"id": str(kf["id"]), "name": kf["file_name"], "size_bytes": kf["size_bytes"],
         "uploaded_at": kf["uploaded_at"].isoformat()}
        for kf in knowledge_rows
    ]

    daily_tasks = await database.fetch(
        """SELECT DATE(created_at) AS day, COUNT(*) AS count
           FROM tasks WHERE hire_id = $1::uuid AND created_at >= now() - interval '7 days'
           GROUP BY DATE(created_at) ORDER BY day""",
        hire_id,
    )
    daily_counts = [0] * 7
    today = datetime.now(timezone.utc).date()
    for dt_row in daily_tasks:
        day_offset = (today - dt_row["day"]).days
        if 0 <= day_offset < 7:
            daily_counts[6 - day_offset] = int(dt_row["count"])

    cost_row = await database.fetchrow(
        """SELECT COALESCE(SUM(cost_usd), 0) AS total,
                  COALESCE(SUM(cost_usd) FILTER (WHERE created_at >= now() - interval '7 days'), 0) AS this_week,
                  COALESCE(SUM(cost_usd) FILTER (WHERE created_at >= now() - interval '14 days'
                      AND created_at < now() - interval '7 days'), 0) AS last_week
           FROM tasks WHERE hire_id = $1::uuid""",
        hire_id,
    )

    return {
        "hire_id": str(row["id"]),
        "agent_id": row["agent_id"],
        "agent_name": agent_name,
        "agent_role": agent_role,
        "agent_color": agent_color(row["agent_id"]),
        "agent_tools": agent_tools,
        "agent_llm": agent_llm,
        "status": row["status"],
        "plan": row["plan"],
        "weekly_budget_usd": float(row["weekly_budget_usd"]),
        "hired_at": row["hired_at"].isoformat(),
        "renews_at": row["renews_at"].isoformat() if row["renews_at"] else None,
        "settings": {
            "custom_instructions": row["custom_instructions"] or "",
            "knowledge_files": knowledge_files,
        },
        "stats": {**stats, "daily_tasks": daily_counts},
        "cost": {
            "spent_usd": round(float(cost_row["total"]), 2),
            "budget_usd": float(row["weekly_budget_usd"]),
            "last_week_spent_usd": round(float(cost_row["last_week"]), 2),
            "this_week_spent_usd": round(float(cost_row["this_week"]), 2),
            "breakdown": [
                {"label": "LLM Tokens", "amount": round(float(cost_row["total"]) * 0.7, 2), "percentage": 70, "color": "#3B82F6"},
                {"label": "Tool Calls", "amount": round(float(cost_row["total"]) * 0.2, 2), "percentage": 20, "color": "#10B981"},
                {"label": "Overhead", "amount": round(float(cost_row["total"]) * 0.1, 2), "percentage": 10, "color": "#F59E0B"},
            ],
        },
    }


@router.put("/{hire_id}/settings")
async def update_settings(hire_id: str, request: UpdateSettingsRequest) -> dict:
    """Update custom instructions for a hired agent."""
    from database.connection import database

    await get_hire_or_404(database, hire_id)
    await database.execute(
        """UPDATE hired_agents SET custom_instructions = $1, updated_at = now()
           WHERE id = $2::uuid""",
        request.custom_instructions, hire_id,
    )
    return {"hire_id": hire_id, "custom_instructions": request.custom_instructions}


@router.post("/{hire_id}/knowledge", status_code=201)
async def upload_knowledge(hire_id: str, file: UploadFile = File(...)) -> dict:
    """Upload a knowledge file (.md, max 5MB) for a hired agent."""
    from database.connection import database

    await get_hire_or_404(database, hire_id)

    if not file.filename or not file.filename.endswith(".md"):
        raise HTTPException(status_code=400, detail="Only .md files are allowed")

    content_bytes = await file.read()
    if len(content_bytes) > 5_242_880:
        raise HTTPException(status_code=400, detail="File exceeds 5MB limit")
    if len(content_bytes) == 0:
        raise HTTPException(status_code=400, detail="File is empty")

    content_text = content_bytes.decode("utf-8", errors="replace")
    row = await database.fetchrow(
        """INSERT INTO knowledge_files (hire_id, file_name, size_bytes, content_text)
           VALUES ($1::uuid, $2, $3, $4)
           RETURNING id, uploaded_at""",
        hire_id, file.filename, len(content_bytes), content_text,
    )

    return {
        "id": str(row["id"]),
        "name": file.filename,
        "size_bytes": len(content_bytes),
        "uploaded_at": row["uploaded_at"].isoformat(),
    }


@router.delete("/{hire_id}/knowledge/{file_id}", status_code=204)
async def delete_knowledge(hire_id: str, file_id: str) -> None:
    """Delete a knowledge file."""
    from database.connection import database

    await get_hire_or_404(database, hire_id)
    validate_uuid(file_id, "file_id")
    result = await database.execute(
        "DELETE FROM knowledge_files WHERE id = $1::uuid AND hire_id = $2::uuid",
        file_id, hire_id,
    )
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Knowledge file not found")

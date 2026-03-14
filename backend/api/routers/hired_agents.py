"""Hired agent management endpoints — core hire lifecycle."""

import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Query

from api.routers.hired_agents_helpers import (
    MOCK_USER_ID, HireAgentRequest, HiredAgentSummary,
    agent_color, get_hire_or_404,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/{agent_id}/hire", status_code=201)
async def hire_agent(agent_id: str, request: HireAgentRequest) -> dict:
    """Hire an agent on a weekly subscription."""
    from agents import agent_registry
    from agents.exceptions import AgentNotFoundError
    from database.connection import database

    try:
        config = agent_registry.get_config(agent_id)
    except AgentNotFoundError:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    existing = await database.fetchrow(
        """SELECT id FROM hired_agents
           WHERE user_id = $1::uuid AND agent_id = $2 AND status IN ('active', 'renewing_soon')""",
        MOCK_USER_ID, agent_id,
    )
    if existing:
        raise HTTPException(status_code=409, detail=f"Agent '{agent_id}' already hired")

    renews_at = datetime.now(timezone.utc) + timedelta(weeks=1)
    try:
        row = await database.fetchrow(
            """INSERT INTO hired_agents (user_id, agent_id, status, plan, weekly_budget_usd, hired_at, renews_at)
               VALUES ($1::uuid, $2, 'active', $3, $4, now(), $5)
               RETURNING id, hired_at""",
            MOCK_USER_ID, agent_id, request.plan, request.weekly_budget_usd, renews_at,
        )
    except Exception as exc:
        if "unique" in str(exc).lower():
            raise HTTPException(status_code=409, detail=f"Agent '{agent_id}' already hired")
        raise

    return {
        "hire_id": str(row["id"]),
        "agent_id": agent_id,
        "agent_name": config.name,
        "status": "active",
        "plan": request.plan,
        "hired_at": row["hired_at"].isoformat(),
        "renews_at": renews_at.isoformat(),
    }


@router.get("/")
async def list_hired_agents() -> dict:
    """List all hired agents for current user with summary stats."""
    from database.connection import database

    if not database.is_connected:
        return {"hired_agents": []}

    rows = await database.fetch(
        """SELECT ha.*, ac.name AS agent_name, ac.role AS agent_role,
                  (SELECT COUNT(*) FROM knowledge_files kf WHERE kf.hire_id = ha.id) AS knowledge_count,
                  COALESCE(ts.total_tasks, 0) AS total_tasks,
                  COALESCE(ts.success_rate, 0) AS success_rate,
                  COALESCE(ts.avg_cost, 0) AS avg_cost
           FROM hired_agents ha
           LEFT JOIN agent_configs ac ON ac.agent_id = ha.agent_id
           LEFT JOIN LATERAL (
               SELECT COUNT(*) AS total_tasks,
                      CASE WHEN COUNT(*) > 0
                           THEN ROUND(COUNT(*) FILTER (WHERE status = 'completed')::numeric / COUNT(*) * 100, 1)
                           ELSE 0 END AS success_rate,
                      COALESCE(AVG(cost_usd) FILTER (WHERE status = 'completed'), 0) AS avg_cost
               FROM tasks WHERE hire_id = ha.id
           ) ts ON true
           WHERE ha.user_id = $1::uuid
           ORDER BY ha.hired_at DESC""",
        MOCK_USER_ID,
    )

    hired_list = []
    for row in rows:
        hired_list.append(HiredAgentSummary(
            hire_id=str(row["id"]),
            agent_id=row["agent_id"],
            agent_name=row["agent_name"] or row["agent_id"].title(),
            agent_role=row["agent_role"] or row["agent_id"],
            agent_color=agent_color(row["agent_id"]),
            status=row["status"],
            plan=row["plan"],
            weekly_budget_usd=float(row["weekly_budget_usd"]),
            hired_at=row["hired_at"].isoformat(),
            renews_at=row["renews_at"].isoformat() if row["renews_at"] else None,
            stats={
                "total_tasks": int(row["total_tasks"]),
                "success_rate": float(row["success_rate"]),
                "avg_cost_usd": round(float(row["avg_cost"]), 4),
            },
            has_custom_instructions=bool(row["custom_instructions"]),
            knowledge_file_count=int(row["knowledge_count"]),
        ).model_dump())

    return {"hired_agents": hired_list}


@router.delete("/{hire_id}", status_code=200)
async def cancel_hire(hire_id: str) -> dict:
    """Cancel a hired agent subscription."""
    from database.connection import database

    row = await get_hire_or_404(database, hire_id)
    if row["status"] == "cancelled":
        raise HTTPException(status_code=400, detail="Already cancelled")

    await database.execute(
        """UPDATE hired_agents SET status = 'cancelled', cancelled_at = now(), updated_at = now()
           WHERE id = $1::uuid""",
        hire_id,
    )
    return {"hire_id": hire_id, "status": "cancelled"}


@router.post("/{hire_id}/rehire", status_code=200)
async def rehire_agent(hire_id: str) -> dict:
    """Rehire a cancelled agent."""
    from database.connection import database

    row = await get_hire_or_404(database, hire_id)
    if row["status"] in ("active", "renewing_soon"):
        raise HTTPException(status_code=400, detail="Agent is already active")

    renews_at = datetime.now(timezone.utc) + timedelta(weeks=1)
    await database.execute(
        """UPDATE hired_agents SET status = 'active', cancelled_at = NULL,
               renews_at = $1, updated_at = now()
           WHERE id = $2::uuid""",
        renews_at, hire_id,
    )
    return {"hire_id": hire_id, "status": "active", "renews_at": renews_at.isoformat()}


@router.get("/{hire_id}/tasks")
async def get_hired_agent_tasks(
    hire_id: str,
    limit: int = Query(default=10, le=50),
    offset: int = Query(default=0, ge=0),
) -> dict:
    """Get paginated tasks for a hired agent."""
    from database.connection import database

    await get_hire_or_404(database, hire_id)

    total = await database.fetchval(
        "SELECT COUNT(*) FROM tasks WHERE hire_id = $1::uuid", hire_id
    )

    rows = await database.fetch(
        """SELECT id, agent_id, goal, status, cost_usd, tokens_used, runtime_seconds,
                  created_at, completed_at
           FROM tasks WHERE hire_id = $1::uuid
           ORDER BY created_at DESC LIMIT $2 OFFSET $3""",
        hire_id, limit, offset,
    )

    tasks = [
        {
            "task_id": str(row["id"]),
            "agent_id": row["agent_id"],
            "goal": row["goal"],
            "status": row["status"],
            "cost_usd": float(row["cost_usd"]) if row["cost_usd"] else None,
            "tokens_used": row["tokens_used"],
            "runtime_seconds": float(row["runtime_seconds"]) if row["runtime_seconds"] else None,
            "created_at": row["created_at"].isoformat() if row["created_at"] else None,
            "completed_at": row["completed_at"].isoformat() if row["completed_at"] else None,
        }
        for row in rows
    ]

    return {"tasks": tasks, "total": int(total), "limit": limit, "offset": offset}

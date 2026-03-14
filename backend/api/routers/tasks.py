"""Task management endpoints."""

import asyncio
import json
import logging
import uuid

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from workers.celery_app import celery_app
from workers.tasks import execute_agent_task

logger = logging.getLogger(__name__)

router = APIRouter()


class CreateTaskRequest(BaseModel):
    agent_id: str
    goal: str
    context: str | None = None
    budget_usd: float = 10.0


class TaskResponse(BaseModel):
    task_id: str
    status: str


@router.get("/")
async def list_tasks() -> dict:
    """List tasks from PostgreSQL."""
    from database.connection import database

    if not database.is_connected:
        return {"tasks": []}

    rows = await database.fetch(
        """SELECT id, agent_id, goal, status, cost_usd, tokens_used,
                  runtime_seconds, created_at, completed_at
           FROM tasks ORDER BY created_at DESC LIMIT 50"""
    )

    tasks_list = []
    for row in rows:
        tasks_list.append({
            "task_id": str(row["id"]),
            "agent_id": row["agent_id"],
            "goal": row["goal"],
            "status": row["status"],
            "cost_usd": float(row["cost_usd"]) if row["cost_usd"] else None,
            "tokens_used": row["tokens_used"],
            "runtime_seconds": float(row["runtime_seconds"]) if row["runtime_seconds"] else None,
            "created_at": row["created_at"].isoformat() if row["created_at"] else None,
            "completed_at": row["completed_at"].isoformat() if row["completed_at"] else None,
        })

    return {"tasks": tasks_list}


@router.post("/", response_model=TaskResponse, status_code=202)
async def create_task(request: CreateTaskRequest) -> TaskResponse:
    """Create task, store in DB, and enqueue for execution."""
    from agents import agent_registry
    from agents.exceptions import AgentNotFoundError
    from database.connection import database

    try:
        agent_registry.get_config(request.agent_id)
    except AgentNotFoundError:
        raise HTTPException(status_code=404, detail=f"Agent '{request.agent_id}' not found")

    task_id = str(uuid.uuid4())
    input_data = {
        "goal": request.goal,
        "context": request.context,
        "budget_usd": request.budget_usd,
    }

    if database.is_connected:
        await database.execute(
            """INSERT INTO tasks (id, agent_id, goal, context, status, input_data)
               VALUES ($1::uuid, $2, $3, $4, 'queued', $5::jsonb)""",
            task_id, request.agent_id, request.goal,
            request.context, json.dumps(input_data),
        )

    execute_agent_task.apply_async(
        kwargs={"task_id": task_id, "agent_id": request.agent_id, "input_data": input_data},
        task_id=task_id,
    )

    logger.info("Enqueued task %s for agent %s", task_id, request.agent_id)
    return TaskResponse(task_id=task_id, status="queued")


@router.get("/{task_id}")
async def get_task(task_id: str) -> dict:
    """Get task from DB first, fall back to Celery result."""
    from database.connection import database

    if database.is_connected:
        row = await database.fetchrow(
            "SELECT * FROM tasks WHERE id = $1::uuid", task_id
        )
        if row:
            return {
                "task_id": str(row["id"]),
                "agent_id": row["agent_id"],
                "goal": row["goal"],
                "status": row["status"],
                "output": row["output_data"],
                "cost_usd": float(row["cost_usd"]) if row["cost_usd"] else None,
                "created_at": row["created_at"].isoformat() if row["created_at"] else None,
            }

    async_result = celery_app.AsyncResult(task_id)
    response: dict = {
        "task_id": task_id,
        "status": (async_result.status or "unknown").lower(),
    }
    if async_result.ready():
        if async_result.successful():
            response["result"] = async_result.result
            response["status"] = "completed"
        else:
            response["error"] = str(async_result.result)
            response["status"] = "failed"

    return response


@router.get("/{task_id}/stream")
async def stream_task_progress(task_id: str) -> StreamingResponse:
    """SSE endpoint for real-time task progress."""
    max_heartbeats = 3600

    async def event_generator():
        heartbeat_count = 0
        from workers.progress import progress_publisher

        pubsub = progress_publisher.subscribe(task_id)
        try:
            while heartbeat_count < max_heartbeats:
                message = pubsub.get_message(timeout=1.0)
                if message and message["type"] == "message":
                    raw = message["data"]
                    if isinstance(raw, bytes):
                        raw = raw.decode()
                    yield f"data: {raw}\n\n"
                    parsed = json.loads(raw) if isinstance(raw, str) else {}
                    if parsed.get("type") in ("complete", "error"):
                        break
                else:
                    yield f"data: {json.dumps({'type': 'heartbeat'})}\n\n"
                    heartbeat_count += 1
                await asyncio.sleep(0.5)
        finally:
            pubsub.unsubscribe()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

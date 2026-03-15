"""Task management endpoints."""

import asyncio
import json
import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from api.auth.dependencies import CurrentUser, get_current_user
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
async def list_tasks(user: CurrentUser = Depends(get_current_user)) -> dict:
    """List tasks from PostgreSQL."""
    from database.connection import database

    if not database.is_connected:
        return {"tasks": []}

    rows = await database.fetch(
        """SELECT id, agent_id, goal, status, cost_usd, tokens_used,
                  runtime_seconds, created_at, completed_at, output_data, input_data
           FROM tasks WHERE user_id = $1::uuid ORDER BY created_at DESC LIMIT 50""",
        user.user_id,
    )

    tasks_list = []
    for row in rows:
        output = row.get("output_data") or {}
        input_d = row.get("input_data") or {}
        if isinstance(output, str):
            import json as _json
            output = _json.loads(output)
        if isinstance(input_d, str):
            import json as _json
            input_d = _json.loads(input_d)
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
            "output_data": output,
            "input_data": input_d,
        })

    return {"tasks": tasks_list}


@router.post("/", response_model=TaskResponse, status_code=202)
async def create_task(
    request: CreateTaskRequest,
    user: CurrentUser = Depends(get_current_user),
) -> TaskResponse:
    """Create task, store in DB, and enqueue for execution."""
    from agents import agent_registry
    from agents.exceptions import AgentNotFoundError
    from database.connection import database

    try:
        agent_registry.get_config(request.agent_id)
    except AgentNotFoundError:
        raise HTTPException(status_code=404, detail=f"Agent '{request.agent_id}' not found")

    task_id = str(uuid.uuid4())
    enriched_context = request.context or ""
    hire_id = None

    if database.is_connected:
        hire_row = await database.fetchrow(
            """SELECT id, custom_instructions FROM hired_agents
               WHERE user_id = $1::uuid AND agent_id = $2 AND status = 'active'""",
            user.user_id, request.agent_id,
        )
        if hire_row:
            hire_id = str(hire_row["id"])
            if hire_row["custom_instructions"]:
                enriched_context = f"[INSTRUCTIONS]\n{hire_row['custom_instructions']}\n\n{enriched_context}"
            knowledge_rows = await database.fetch(
                "SELECT content_text FROM knowledge_files WHERE hire_id = $1::uuid ORDER BY uploaded_at",
                hire_id,
            )
            if knowledge_rows:
                knowledge_text = "\n---\n".join(row["content_text"] for row in knowledge_rows)
                enriched_context = f"[KNOWLEDGE]\n{knowledge_text}\n\n{enriched_context}"

    input_data = {
        "goal": request.goal,
        "context": enriched_context or request.context,
        "budget_usd": request.budget_usd,
    }

    if database.is_connected:
        await database.execute(
            """INSERT INTO tasks (id, user_id, agent_id, goal, context, status, input_data, hire_id)
               VALUES ($1::uuid, $2::uuid, $3, $4, $5, 'queued', $6::jsonb, $7::uuid)""",
            task_id, user.user_id, request.agent_id, request.goal,
            enriched_context or request.context, json.dumps(input_data), hire_id,
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
            output = row.get("output_data") or {}
            input_d = row.get("input_data") or {}
            if isinstance(output, str):
                import json as _json
                output = _json.loads(output)
            if isinstance(input_d, str):
                import json as _json
                input_d = _json.loads(input_d)
            return {
                "task_id": str(row["id"]),
                "agent_id": row["agent_id"],
                "goal": row["goal"],
                "status": row["status"],
                "cost_usd": float(row["cost_usd"]) if row["cost_usd"] else None,
                "tokens_used": row["tokens_used"],
                "runtime_seconds": float(row["runtime_seconds"]) if row["runtime_seconds"] else None,
                "created_at": row["created_at"].isoformat() if row["created_at"] else None,
                "completed_at": row["completed_at"].isoformat() if row["completed_at"] else None,
                "output_data": output,
                "input_data": input_d,
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

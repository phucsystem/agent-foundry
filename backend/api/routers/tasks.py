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
    """Request body for creating a new agent task."""

    agent_id: str
    goal: str
    context: str | None = None
    budget_usd: float = 10.0


class TaskResponse(BaseModel):
    """Response payload returned after task creation."""

    task_id: str
    status: str


@router.get("/")
async def list_tasks() -> dict:
    """List recent tasks. DB integration in next phase."""
    return {"tasks": []}


@router.post("/", response_model=TaskResponse, status_code=202)
async def create_task(request: CreateTaskRequest) -> TaskResponse:
    """Create and enqueue a new agent task."""
    from agents import agent_registry
    from agents.exceptions import AgentNotFoundError

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

    execute_agent_task.apply_async(
        kwargs={"task_id": task_id, "agent_id": request.agent_id, "input_data": input_data},
        task_id=task_id,
    )

    logger.info("Enqueued task %s for agent %s", task_id, request.agent_id)
    return TaskResponse(task_id=task_id, status="queued")


@router.get("/{task_id}")
async def get_task(task_id: str) -> dict:
    """Get task status and result by Celery task ID."""
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
    """SSE endpoint for real-time task progress via Redis pub/sub."""

    max_duration_seconds = 1800
    heartbeat_count = 0
    max_heartbeats = max_duration_seconds * 2

    async def event_generator():
        nonlocal heartbeat_count
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
                    heartbeat = json.dumps({"type": "heartbeat"})
                    yield f"data: {heartbeat}\n\n"
                    heartbeat_count += 1
                await asyncio.sleep(0.5)
        finally:
            pubsub.unsubscribe()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )

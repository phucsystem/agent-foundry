"""Content task endpoints — create, get, list."""

import logging

from fastapi import APIRouter, Depends, HTTPException

from gateway.auth.dependencies import CurrentUser, get_current_user
from gateway.models.api_models import (
    CreateContentTaskRequest,
    CreateTaskResponse,
    TaskDetailResponse,
    TaskResponse,
)
from gateway.services.credit_service import credit_service
from gateway.services.task_service import task_service
from gateway.services.agentcore_invoker import agentcore_invoker

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/content", response_model=CreateTaskResponse, status_code=202)
def create_content_task(
    request: CreateContentTaskRequest,
    user: CurrentUser = Depends(get_current_user),
):
    """Create a content generation task.

    Deducts credits, creates task record, invokes AgentCore Runtime.
    """
    task_cost = credit_service.get_task_cost(request.content_type)

    input_data = request.model_dump()
    task_row = task_service.create_task(
        user_id=user.user_id,
        brand_config_id=request.brand_config_id,
        task_type=request.content_type,
        input_data=input_data,
    )
    task_id = str(task_row["id"])

    if not credit_service.deduct_credits(user.user_id, task_cost, task_id):
        task_service.mark_task_failed(task_id, "Insufficient credits")
        raise HTTPException(
            status_code=402,
            detail={"error": "INSUFFICIENT_CREDITS", "message": f"Need {task_cost} credits"},
        )

    try:
        result = agentcore_invoker.invoke_content_agent(
            task_id=task_id,
            topic=request.topic,
            brand_config_id=request.brand_config_id,
            user_id=user.user_id,
            content_type=request.content_type,
            target_word_count=request.target_word_count,
            keywords=request.keywords,
            competitor_urls=request.competitor_urls,
            additional_context=request.additional_context,
        )

        token_usage = result.get("token_usage", {})
        total_tokens = token_usage.get("input_tokens", 0) + token_usage.get("output_tokens", 0)

        task_service.update_task_result(
            task_id=task_id,
            output_data=result,
            tokens_used=total_tokens,
            cost_cents=task_cost,
        )

    except Exception as error:
        logger.error("Agent invocation failed for task %s: %s", task_id, error)
        credit_service.refund_credits(user.user_id, task_cost, task_id)
        task_service.mark_task_failed(task_id, str(error))
        raise HTTPException(status_code=500, detail={"error": "AGENT_FAILURE", "message": str(error)})

    return CreateTaskResponse(task_id=task_id, status="completed", estimated_cost_cents=task_cost)


@router.get("/{task_id}", response_model=TaskDetailResponse)
def get_task(task_id: str, user: CurrentUser = Depends(get_current_user)):
    """Get task details by ID."""
    task = task_service.get_task(task_id, user.user_id)
    if not task:
        raise HTTPException(status_code=404, detail={"error": "NOT_FOUND", "message": "Task not found"})

    topic = ""
    if task.get("input_json"):
        topic = task["input_json"].get("topic", "") if isinstance(task["input_json"], dict) else ""

    return TaskDetailResponse(
        task_id=str(task["id"]),
        status=task["status"],
        task_type=task["task_type"],
        topic=topic,
        created_at=task["created_at"],
        completed_at=task.get("completed_at"),
        output=task.get("output_json"),
        tokens_used=task.get("tokens_used", 0),
        cost_cents=task.get("cost_cents", 0),
    )


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    status: str | None = None,
    limit: int = 20,
    offset: int = 0,
    user: CurrentUser = Depends(get_current_user),
):
    """List user's content tasks."""
    limit = min(limit, 100)
    tasks = task_service.list_tasks(user.user_id, status=status, limit=limit, offset=offset)
    results = []
    for task in tasks:
        topic = ""
        if task.get("input_json"):
            topic = task["input_json"].get("topic", "") if isinstance(task["input_json"], dict) else ""
        results.append(
            TaskResponse(
                task_id=str(task["id"]),
                status=task["status"],
                task_type=task["task_type"],
                topic=topic,
                created_at=task["created_at"],
                completed_at=task.get("completed_at"),
            )
        )
    return results

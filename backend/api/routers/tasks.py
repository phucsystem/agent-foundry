"""Task management endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.post("/")
async def create_task() -> dict[str, str]:
    """Create a new task."""
    return {"status": "stub"}


@router.get("/{task_id}")
async def get_task(task_id: str) -> dict[str, str]:
    """Get task status and result."""
    return {"task_id": task_id, "status": "stub"}

"""Agent management endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_agents() -> dict[str, list]:
    """List available agents."""
    return {"agents": []}


@router.get("/{agent_id}")
async def get_agent(agent_id: str) -> dict[str, str]:
    """Get agent details by ID."""
    return {"agent_id": agent_id, "status": "stub"}

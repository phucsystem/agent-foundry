"""Agent management endpoints."""

from fastapi import APIRouter, HTTPException

from agents.registry import agent_registry
from agents.exceptions import AgentNotFoundError

router = APIRouter()


@router.get("/")
async def list_agents() -> dict:
    """List available agents with config summaries."""
    configs = agent_registry.list_agents()
    return {
        "agents": [
            {
                "id": config.id,
                "name": config.name,
                "role": config.role,
                "version": config.version,
                "pricing_cents_per_run": config.pricing_cents_per_run,
                "tools": config.tools,
            }
            for config in configs
        ]
    }


@router.get("/{agent_id}")
async def get_agent(agent_id: str) -> dict:
    """Get agent details by ID."""
    try:
        config = agent_registry.get_config(agent_id)
    except AgentNotFoundError:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    return {
        "id": config.id,
        "name": config.name,
        "role": config.role,
        "goal": config.goal,
        "backstory": config.backstory,
        "version": config.version,
        "tools": config.tools,
        "pricing_cents_per_run": config.pricing_cents_per_run,
    }

"""Agent listing endpoint — static for MVP."""

from fastapi import APIRouter

from gateway.models.api_models import AgentResponse

router = APIRouter()

AVAILABLE_AGENTS = [
    AgentResponse(
        agent_id="content-editor",
        name="Content Editor",
        description=(
            "AI-powered content creation crew: researches topics, writes engaging articles, "
            "edits for brand voice and SEO, and repurposes into social media variants."
        ),
        pricing_cents=50,
        status="available",
    ),
]


@router.get("", response_model=list[AgentResponse])
async def list_agents():
    """List available agents. MVP: Content Editor only."""
    return AVAILABLE_AGENTS


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str):
    """Get agent details by ID."""
    for agent in AVAILABLE_AGENTS:
        if agent.agent_id == agent_id:
            return agent
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail={"error": "NOT_FOUND", "message": "Agent not found"})

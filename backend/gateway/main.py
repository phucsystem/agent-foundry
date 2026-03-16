"""API Gateway — FastAPI app with Mangum handler for Lambda deployment."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from gateway.routers import content_tasks, agents, users, credits

logger = logging.getLogger(__name__)


def create_gateway_app() -> FastAPI:
    """Create and configure the API Gateway FastAPI application."""
    application = FastAPI(
        title="Agent Foundry API",
        description="API Gateway for Agent Foundry — content generation platform",
        version="1.0.0",
    )

    from gateway.config import settings
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(agents.router, prefix="/api/agents", tags=["agents"])
    application.include_router(content_tasks.router, prefix="/api/tasks", tags=["tasks"])
    application.include_router(users.router, prefix="/api/users", tags=["users"])
    application.include_router(credits.router, prefix="/api/credits", tags=["credits"])

    @application.get("/health")
    async def health_check():
        return {"status": "ok", "service": "agent-foundry-gateway"}

    return application


app = create_gateway_app()

# Lambda handler via Mangum
handler = Mangum(app, lifespan="off")

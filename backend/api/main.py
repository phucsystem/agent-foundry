"""Agent Foundry API — FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import agents, health, tasks


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    application = FastAPI(
        title="Agent Foundry API",
        description="Build and hire specialised AI agents",
        version="0.1.0",
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(health.router)
    application.include_router(agents.router, prefix="/api/agents", tags=["agents"])
    application.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])

    return application


app = create_app()

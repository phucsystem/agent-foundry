"""Agent Foundry API — FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import agents, health, tasks

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Application startup and shutdown lifecycle."""
    from agents import initialize_agents
    from database.connection import database

    initialize_agents()
    logger.info("Agent framework initialized")

    try:
        await database.connect()
        logger.info("Database connected")
    except Exception as error:
        logger.warning(f"Database connection failed (non-fatal): {error}")

    yield

    from database.connection import database as db_shutdown
    await db_shutdown.disconnect()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    application = FastAPI(
        title="Agent Foundry API",
        description="Build and hire specialised AI agents",
        version="0.1.0",
        lifespan=lifespan,
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

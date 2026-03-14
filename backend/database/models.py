"""Pydantic record models for database rows (raw SQL + Pydantic, no SQLAlchemy)."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel


class UserRecord(BaseModel):
    id: str
    email: str
    name: str | None = None
    tier: str = "free"
    api_key: str | None = None
    created_at: datetime | None = None


class TaskRecord(BaseModel):
    id: str
    user_id: str | None = None
    agent_id: str
    goal: str
    context: str | None = None
    status: str = "pending"
    input_data: dict[str, Any] | None = None
    output_data: dict[str, Any] | None = None
    cost_usd: float | None = None
    tokens_used: int | None = None
    runtime_seconds: float | None = None
    created_at: datetime | None = None
    completed_at: datetime | None = None


class AgentMemoryRecord(BaseModel):
    id: int | None = None
    agent_id: str
    chunk_text: str
    source: str | None = None
    metadata: dict[str, Any] | None = None
    created_at: datetime | None = None


class HiredAgentRecord(BaseModel):
    id: str
    user_id: str
    agent_id: str
    status: str = "active"
    plan: str = "solo"
    custom_instructions: str | None = None
    weekly_budget_usd: float = 100.00
    hired_at: datetime | None = None
    renews_at: datetime | None = None
    cancelled_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class KnowledgeFileRecord(BaseModel):
    id: str
    hire_id: str
    file_name: str
    size_bytes: int
    content_text: str
    storage_path: str | None = None
    uploaded_at: datetime | None = None


# ---------------------------------------------------------------------------
# Reference SQL schema — applied once via infra/init.sql or a migration tool.
# ---------------------------------------------------------------------------

SCHEMA_SQL = """
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT UNIQUE NOT NULL,
    name        TEXT,
    tier        TEXT NOT NULL DEFAULT 'free',
    api_key     TEXT UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
    agent_id         TEXT NOT NULL,
    goal             TEXT NOT NULL,
    context          TEXT,
    status           TEXT NOT NULL DEFAULT 'pending',
    input_data       JSONB,
    output_data      JSONB,
    cost_usd         NUMERIC(10, 6),
    tokens_used      INTEGER,
    runtime_seconds  NUMERIC(10, 3),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at     TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS agent_memories (
    id          BIGSERIAL PRIMARY KEY,
    agent_id    TEXT NOT NULL,
    chunk_text  TEXT NOT NULL,
    embedding   vector(1536),
    source      TEXT,
    metadata    JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memories_agent
    ON agent_memories(agent_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_memories_embedding
    ON agent_memories USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_tasks_agent
    ON tasks(agent_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_user
    ON tasks(user_id, created_at DESC);
"""

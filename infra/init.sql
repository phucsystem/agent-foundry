-- pgvector extension + app tables run against the default (agentfoundry) database.
-- Langfuse database is created via a separate shell script (see init-langfuse-db.sh)
-- because CREATE DATABASE cannot run inside a transaction.

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    tier TEXT NOT NULL DEFAULT 'free',
    api_key TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    agent_id TEXT NOT NULL,
    goal TEXT NOT NULL,
    context TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    input_data JSONB,
    output_data JSONB,
    cost_usd NUMERIC(10, 6),
    tokens_used INTEGER,
    runtime_seconds NUMERIC(10, 3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- Agent memories (pgvector)
CREATE TABLE IF NOT EXISTS agent_memories (
    id BIGSERIAL PRIMARY KEY,
    agent_id TEXT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536),
    source TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent configs (registry cache)
CREATE TABLE IF NOT EXISTS agent_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    config_yaml TEXT NOT NULL,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_agent ON tasks(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_memories_agent ON agent_memories(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS agent_memories_hnsw ON agent_memories USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS agent_memories_agent_id ON agent_memories (agent_id);


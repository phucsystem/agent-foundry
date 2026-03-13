-- pgvector extension + app tables run against the default (agentfoundry) database.
-- Langfuse database is created via a separate shell script (see init-langfuse-db.sh)
-- because CREATE DATABASE cannot run inside a transaction.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS agent_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT NOT NULL,
    client_id TEXT,
    task_id TEXT,
    content TEXT NOT NULL,
    embedding vector(1536),
    memory_type TEXT DEFAULT 'episodic',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agent_memories_hnsw ON agent_memories USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS agent_memories_agent_id ON agent_memories (agent_id);

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

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT NOT NULL,
    client_id TEXT,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    result JSONB,
    tokens_used INT DEFAULT 0,
    cost_usd NUMERIC(10, 6) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);


-- Agent Foundry: Initial schema for AWS RDS PostgreSQL
-- Tables: users, brand_configs, content_tasks, credit_transactions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    logto_id VARCHAR(255) UNIQUE NOT NULL,
    credit_balance_cents INTEGER NOT NULL DEFAULT 500,  -- $5.00 free signup credit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brand_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    voice_yaml TEXT NOT NULL,  -- YAML serialized BrandVoiceConfig
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE task_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE content_type AS ENUM ('blog', 'email', 'social');

CREATE TABLE IF NOT EXISTS content_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_config_id UUID REFERENCES brand_configs(id) ON DELETE SET NULL,
    task_type content_type NOT NULL DEFAULT 'blog',
    status task_status NOT NULL DEFAULT 'pending',
    input_json JSONB NOT NULL DEFAULT '{}',
    output_json JSONB,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    cost_cents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TYPE credit_tx_type AS ENUM ('signup_bonus', 'topup', 'deduction', 'refund');

CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,  -- positive for topup/refund, negative for deduction
    type credit_tx_type NOT NULL,
    task_id UUID REFERENCES content_tasks(id) ON DELETE SET NULL,
    description VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_brand_configs_user_id ON brand_configs(user_id);
CREATE INDEX idx_content_tasks_user_id ON content_tasks(user_id);
CREATE INDEX idx_content_tasks_status ON content_tasks(status);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_task_id ON credit_transactions(task_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_configs_updated_at
    BEFORE UPDATE ON brand_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed: mock user for development (matches MOCK_USER_ID in gateway)
INSERT INTO users (id, email, logto_id, credit_balance_cents)
VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'mock', 500)
ON CONFLICT (id) DO NOTHING;

-- Seed: default brand config (referenced by frontend as "default")
INSERT INTO brand_configs (id, user_id, name, voice_yaml)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Default',
    'core_values:
  - clarity
  - accuracy
  - helpfulness
tone: professional yet approachable
audience: business professionals
avoid_words:
  - synergy
  - leverage
  - disrupt
examples:
  - "Clear, data-driven insights for informed decisions."
sentence_length_avg: 15'
) ON CONFLICT (id) DO NOTHING;

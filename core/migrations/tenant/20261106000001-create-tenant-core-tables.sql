CREATE TABLE IF NOT EXISTS client_companies (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    corporate_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255) NOT NULL,
    document_number VARCHAR(32) NOT NULL,
    max_concurrent_sessions INTEGER NOT NULL DEFAULT 5,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    license_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_client_companies_org ON client_companies (organization_id);

CREATE TABLE IF NOT EXISTS requesters (
    id UUID PRIMARY KEY,
    client_company_id UUID NOT NULL REFERENCES client_companies(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    machine_hostname VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_requesters_company ON requesters (client_company_id);

CREATE TABLE IF NOT EXISTS queues (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_queues_org ON queues (organization_id);

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    protocol_number VARCHAR(64) NOT NULL UNIQUE,
    client_company_id UUID NOT NULL REFERENCES client_companies(id),
    requester_id UUID NOT NULL REFERENCES requesters(id),
    queue_id UUID NOT NULL REFERENCES queues(id),
    agent_id UUID,
    status VARCHAR(32) NOT NULL DEFAULT 'WAITING_QUEUE',
    active_channel VARCHAR(32) NOT NULL DEFAULT 'CHAT_ONLY',
    entered_queue_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    claimed_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    queue_wait_time_sec INTEGER,
    total_duration_sec INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tickets_org_status ON tickets (organization_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_queue ON tickets (queue_id, status);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES tickets(id),
    sender_id UUID NOT NULL,
    sender_type VARCHAR(32) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'TEXT',
    content TEXT NOT NULL,
    media_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_ticket ON messages (ticket_id, created_at);

CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY,
    ticket_id UUID NOT NULL UNIQUE REFERENCES tickets(id),
    requester_id UUID NOT NULL REFERENCES requesters(id),
    agent_id UUID,
    score INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ratings_ticket ON ratings (ticket_id);

# Data Model Specification: Drizzle PostgreSQL Schemas

**Feature**: PostgreSQL Persistence Layer with Drizzle ORM and Multi-Tenant Migrations  
**Branch**: `002-drizzle-persistence-layer`  
**Date**: 2026-11-06  

---

## 1. Manager Database Schema (`core/src/database/schema/manager.schema.ts`)

### `organizations`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PRIMARY KEY | Organization UUID |
| `name` | `varchar(255)` | NOT NULL | Organization business name |
| `document_number` | `varchar(32)` | NOT NULL, UNIQUE | Fiscal ID (CNPJ/TaxId) |
| `max_concurrent_tickets` | `integer` | NOT NULL, DEFAULT 10 | Contracted concurrent ticket limit |
| `is_active` | `boolean` | NOT NULL, DEFAULT true | Active status |
| `connection` | `jsonb` | NULLABLE | Tenant DB connection VO (`host`, `port`, `database`, `username`, `password`, `schema`, `ssl`) |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT now() | Created timestamp |
| `updated_at` | `timestamp with time zone` | NULLABLE | Updated timestamp |

---

## 2. Tenant Database Schema (`core/src/database/schema/tenant.schema.ts`)

### `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PRIMARY KEY | User UUID |
| `organization_id` | `uuid` | NOT NULL | Organization UUID (logical binding) |
| `name` | `varchar(255)` | NOT NULL | User full name |
| `email` | `varchar(255)` | NOT NULL, UNIQUE | User email address |
| `password_hash` | `varchar(255)` | NOT NULL | Password hash (bcrypt/argon2) |
| `role` | `varchar(32)` | NOT NULL | Enum: `ADMIN`, `SUPERVISOR`, `AGENT` |
| `status` | `varchar(32)` | NOT NULL, DEFAULT 'OFFLINE' | Enum: `ONLINE`, `BUSY`, `AWAY`, `OFFLINE` |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT now() | Created timestamp |
| `updated_at` | `timestamp with time zone` | NULLABLE | Updated timestamp |

### `client_companies`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PRIMARY KEY | Client company UUID |
| `organization_id` | `uuid` | NOT NULL | Organization UUID |
| `corporate_name` | `varchar(255)` | NOT NULL | Legal corporate name |
| `trade_name` | `varchar(255)` | NOT NULL | Trade/fantasy name |
| `document_number` | `varchar(32)` | NOT NULL | Fiscal ID (CNPJ/TaxId) |
| `max_concurrent_sessions` | `integer` | NOT NULL, DEFAULT 5 | Contracted concurrent session capacity |
| `is_active` | `boolean` | NOT NULL, DEFAULT true | Active status |
| `license_expires_at` | `timestamp with time zone` | NULLABLE | Optional license expiration |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT now() | Created timestamp |
| `updated_at` | `timestamp with time zone` | NULLABLE | Updated timestamp |

### `requesters`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PRIMARY KEY | Requester UUID |
| `client_company_id` | `uuid` | NOT NULL, REFERENCES client_companies(id) | Client company ID |
| `name` | `varchar(255)` | NOT NULL | Requester full name |
| `email` | `varchar(255)` | NOT NULL | Requester email |
| `phone` | `varchar(32)` | NULLABLE | Contact phone |
| `machine_hostname` | `varchar(255)` | NULLABLE | Machine hostname |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT now() | Created timestamp |
| `updated_at` | `timestamp with time zone` | NULLABLE | Updated timestamp |

### `queues`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PRIMARY KEY | Queue UUID |
| `organization_id` | `uuid` | NOT NULL | Organization UUID |
| `name` | `varchar(255)` | NOT NULL | Queue name (e.g., Tier 1, Infrastructure) |
| `priority` | `integer` | NOT NULL, DEFAULT 1 | Priority (1 = normal, 2 = high, 3 = urgent) |
| `is_active` | `boolean` | NOT NULL, DEFAULT true | Active status |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT now() | Created timestamp |
| `updated_at` | `timestamp with time zone` | NULLABLE | Updated timestamp |

### `tickets`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PRIMARY KEY | Ticket UUID |
| `organization_id` | `uuid` | NOT NULL | Organization UUID |
| `protocol_number` | `varchar(64)` | NOT NULL, UNIQUE | Protocol number (e.g. `TCK-20261105-ABCD`) |
| `client_company_id` | `uuid` | NOT NULL, REFERENCES client_companies(id) | Client company |
| `requester_id` | `uuid` | NOT NULL, REFERENCES requesters(id) | Requester |
| `queue_id` | `uuid` | NOT NULL, REFERENCES queues(id) | Queue |
| `agent_id` | `uuid` | NULLABLE, REFERENCES users(id) | Assigned agent |
| `status` | `varchar(32)` | NOT NULL, DEFAULT 'WAITING_QUEUE' | Enum: `WAITING_QUEUE`, `IN_PROGRESS`, `PAUSED`, `RESOLVED`, `CLOSED`, `CANCELLED` |
| `active_channel` | `varchar(32)` | NOT NULL, DEFAULT 'CHAT_ONLY' | Enum: `CHAT_ONLY`, `VOICE_CALL`, `VIDEO_CALL`, `SCREEN_SHARE`, `REMOTE_CONTROL` |
| `entered_queue_at` | `timestamp with time zone` | NOT NULL, DEFAULT now() | Queue entry timestamp |
| `claimed_at` | `timestamp with time zone` | NULLABLE | Claim timestamp |
| `resolved_at` | `timestamp with time zone` | NULLABLE | Resolution timestamp |
| `closed_at` | `timestamp with time zone` | NULLABLE | Close timestamp |
| `queue_wait_time_sec` | `integer` | NULLABLE | Computed seconds waiting in queue |
| `total_duration_sec` | `integer` | NULLABLE | Computed seconds from claim to resolve |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT now() | Created timestamp |
| `updated_at` | `timestamp with time zone` | NULLABLE | Updated timestamp |

### `messages`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PRIMARY KEY | Message UUID |
| `ticket_id` | `uuid` | NOT NULL, REFERENCES tickets(id) | Ticket |
| `sender_id` | `uuid` | NOT NULL | User or Requester UUID |
| `sender_type` | `varchar(32)` | NOT NULL | Enum: `AGENT`, `REQUESTER`, `SYSTEM` |
| `type` | `varchar(32)` | NOT NULL, DEFAULT 'TEXT' | Enum: `TEXT`, `AUDIO`, `SCREENSHOT`, `SCREEN_RECORDING`, `IMAGE`, `FILE` |
| `content` | `text` | NOT NULL | Text body or summary |
| `media_url` | `text` | NULLABLE | Storage media URL |
| `metadata` | `jsonb` | NULLABLE | Voice duration, waveform, image dimensions |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT now() | Timestamp |

### `ratings`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PRIMARY KEY | Rating UUID |
| `ticket_id` | `uuid` | NOT NULL, UNIQUE, REFERENCES tickets(id) | Ticket |
| `requester_id` | `uuid` | NOT NULL, REFERENCES requesters(id) | Requester |
| `agent_id` | `uuid` | NULLABLE, REFERENCES users(id) | Evaluated agent |
| `score` | `integer` | NOT NULL | Score 1 to 5 |
| `comment` | `text` | NULLABLE | Requester feedback text |
| `created_at` | `timestamp with time zone` | NOT NULL, DEFAULT now() | Timestamp |


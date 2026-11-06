# Feature Specification: PostgreSQL Persistence Layer with Drizzle ORM and Multi-Tenant Migrations

**Feature Branch**: `002-drizzle-persistence-layer`  
**Created**: 2026-11-06  
**Status**: Ready for Planning  
**Input**: Multi-tenant PostgreSQL persistence layer using Drizzle ORM, dual-database architecture (Manager DB vs Tenant DB), DDD entity mappers, atomic transaction locking for ticket claims, and timestamped SQL migrations.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Central Manager Database & Organization Persistence (Priority: P1)

As the AlusDesk Global Platform, I want to persist and query subscriber Organizations in a central PostgreSQL Manager database using Drizzle ORM so that tenant connection configurations and contracted capacities can be managed reliably.

**Why this priority**: Without the central Manager database, no tenant connection can be resolved, and the system cannot route incoming requests to isolated tenant databases.

**Independent Test**: Can be tested independently by running Manager database migrations, inserting an Organization with connection credentials via Drizzle `OrganizationRepository`, and verifying that the record is persisted and mapped back to the domain `Organization` entity.

**Acceptance Scenarios**:
1. **Given** a connected Manager PostgreSQL database, **When** manager migrations run, **Then** the `organizations` table is created with unique document numbers, capacity limits, and JSONB/structured connection credentials.
2. **Given** an `Organization` domain entity, **When** `organizationRepository.insert(organization)` is executed, **Then** the record is stored in the manager database and mapped to domain output without data loss.
3. **Given** an existing organization, **When** `organizationRepository.findById(id)` or `findByDocumentNumber(doc)` is called, **Then** the record is retrieved and returned as a domain entity instance.

---

### User Story 2 - Tenant Database Schemas & Foundation Repositories (Priority: P1)

As an Organization Admin and System Operator, I want user accounts, client companies, end-user requesters, and support queues persisted in dedicated tenant PostgreSQL databases via Drizzle ORM so that each tenant's operational data remains strictly isolated.

**Why this priority**: Essential domain boundary. Each organization must have its own isolated tables for staff (`users`), clients (`client_companies`), requesters (`requesters`), and queues (`queues`).

**Independent Test**: Can be tested by running tenant migrations against a tenant database, executing CRUD operations via `UserRepository`, `ClientCompanyRepository`, and `QueueRepository`, and verifying strict schema isolation.

**Acceptance Scenarios**:
1. **Given** a provisioned tenant database, **When** tenant migrations run, **Then** tables `users`, `client_companies`, `requesters`, and `queues` are created with appropriate indexes and foreign keys.
2. **Given** a `ClientCompany` entity, **When** saved via `ClientCompanyRepository`, **Then** company licensing fields (`maxConcurrentSessions`, `isActive`) are persisted and retrievable.
3. **Given** search parameters with pagination and filters, **When** querying repositories, **Then** results return strongly-typed `SearchResult` matching the `@core/repository` contract.

---

### User Story 3 - Helpdesk Repositories & Atomic Concurrency for Queue Claims (Priority: P1)

As a Support Agent and Requester, I want tickets, messages, and CSAT ratings persisted in the tenant database, with atomic row locking on ticket claims, so that race conditions are impossible even under high concurrency.

**Why this priority**: Core transactional engine. Multiple agents claiming the same ticket at the exact same millisecond must not cause double-claims or invalid state transitions.

**Independent Test**: Can be tested by simulating 10 concurrent claim attempts on the same ticket via `TicketRepository.claimTicketAtomically`; exactly 1 attempt must succeed and commit `IN_PROGRESS`, while 9 must fail.

**Acceptance Scenarios**:
1. **Given** a ticket in `WAITING_QUEUE`, **When** `claimTicketAtomically` is invoked, **Then** an atomic PostgreSQL `UPDATE ... WHERE id = :id AND status = 'WAITING_QUEUE' RETURNING *` or `SELECT ... FOR UPDATE` executes inside a transaction, setting `status = 'IN_PROGRESS'` and `claimedAt = NOW()`.
2. **Given** concurrent claim requests for the same ticket, **When** one succeeds, **Then** all concurrent requests receive a rejection error.
3. **Given** an active ticket, **When** messages (with multimedia metadata) or CSAT ratings (score 1-5) are added, **Then** they are stored in `messages` and `ratings` tables with referential integrity.

---

### User Story 4 - Dynamic Tenant Drizzle Pool Provider & Request-Scoped CLS (Priority: P1)

As the Backend API, I want incoming requests to dynamically obtain the correct Drizzle database client based on the authenticated tenant without opening new pools on every request.

**Why this priority**: High-performance multi-tenancy. Connection pools must be cached per tenant (`host:port:database`), and the active Drizzle instance must be bound to the request via `TenantConnectionContext` (`AsyncLocalStorage`).

**Independent Test**: Can be tested by issuing two concurrent requests targeting different tenant databases; each request must execute queries on its respective tenant database without cross-contamination.

**Acceptance Scenarios**:
1. **Given** a request with an opaque token, **When** `TenantAuthMiddleware` authenticates the request, **Then** the cached connection pool from `TenantConnectionRegistry` is resolved and bound to `TenantConnectionContext`.
2. **Given** a tenant repository call, **When** executing queries, **Then** the repository uses the active Drizzle instance from the CLS context.
3. **Given** a manager repository call, **When** executing queries, **Then** the repository always uses the primary Manager database client.

---

### User Story 5 - Automated Multi-Tenant Migration Runner CLI (Priority: P2)

As a DevOps Engineer and Platform Admin, I want a migration runner CLI to execute timestamped SQL migrations on both the central Manager database and all registered tenant databases.

**Why this priority**: Operational reliability. Schema updates must propagate deterministically across all tenant databases.

**Independent Test**: Can be tested by running the migration CLI; all pending SQL files from `core/migrations/manager` and `core/migrations/tenant` must execute in timestamp order with migration history tracked in a `__drizzle_migrations` table.

**Acceptance Scenarios**:
1. **Given** new migration files in `core/migrations/manager/`, **When** the manager migration command runs, **Then** all unapplied migrations are executed against the Manager DB in timestamp order.
2. **Given** new migration files in `core/migrations/tenant/`, **When** the tenant migration command runs, **Then** the migrations are executed sequentially across all active registered tenant databases.
3. **Given** an already executed migration, **When** the runner executes again, **Then** it skips previously applied migrations idempotently.

---

## Edge Cases

- **Tenant DB Unreachable**: If a tenant database host is offline or credentials fail, `ConnectMultiTenantUseCase` must throw `error.tenant_database_connection_failed` and reject the request with HTTP 503 rather than crashing the backend.
- **Connection Pool Exhaustion**: Tenant connection pools must be configured with sensible pool limits (`max: 10`, `idleTimeoutMillis: 30000`) to prevent leaking connections when hundreds of tenants are active.
- **Migration Rollback / Failure**: If a migration script fails on a tenant database, the transaction for that migration must roll back and log the failure without interrupting the entire cluster.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST define Drizzle ORM schemas for the Manager database (`organizations`) and Tenant database (`users`, `client_companies`, `requesters`, `queues`, `tickets`, `messages`, `ratings`).
- **FR-002**: System MUST store timestamped SQL migration files under `core/migrations/manager/` and `core/migrations/tenant/` matching the format `YYYYMMDDHHMMSS-<descriptive-action>.sql`.
- **FR-003**: System MUST implement Drizzle model mappers (`<entity>-model.mapper.ts`) for each aggregate root to maintain pure domain entities decoupled from the ORM.
- **FR-004**: System MUST implement repository interfaces extending `ISearchableRepository<Entity, EntityId, SearchResult>`.
- **FR-005**: System MUST implement atomic queue claiming in `TicketRepository` using transactions and row-level locking (`SELECT ... FOR UPDATE` or atomic condition updates).
- **FR-006**: System MUST manage a pooled cache of Drizzle clients in `TenantConnectionRegistry` keyed by `${host}:${port}:${database}`.
- **FR-007**: System MUST provide an automated migration runner capable of applying migrations to the Manager DB and all active tenant databases.

### Key Entities

- **OrganizationModel (`manager`)**: Stores `id`, `name`, `document_number`, `max_concurrent_tickets`, `is_active`, and JSONB `connection` parameters (`host`, `port`, `database`, `username`, `password`, `schema`, `ssl`).
- **UserModel (`tenant`)**: Stores `id`, `organization_id`, `name`, `email`, `password_hash`, `role`, `status`.
- **ClientCompanyModel (`tenant`)**: Stores `id`, `corporate_name`, `trade_name`, `document_number`, `max_concurrent_sessions`, `is_active`, `license_expires_at`.
- **RequesterModel (`tenant`)**: Stores `id`, `client_company_id`, `name`, `email`, `phone`, `machine_hostname`.
- **QueueModel (`tenant`)**: Stores `id`, `name`, `priority`, `is_active`.
- **TicketModel (`tenant`)**: Stores `id`, `protocol_number`, `client_company_id`, `requester_id`, `queue_id`, `agent_id`, `status`, `active_channel`, `entered_queue_at`, `claimed_at`, `resolved_at`, `closed_at`, `queue_wait_time_sec`, `total_duration_sec`.
- **MessageModel (`tenant`)**: Stores `id`, `ticket_id`, `sender_id`, `sender_type`, `type`, `content`, `media_url`, `metadata`.
- **RatingModel (`tenant`)**: Stores `id`, `ticket_id`, `requester_id`, `agent_id`, `score`, `comment`.

---

## Success Criteria *(mandatory)*

- **SC-001**: 100% of domain repository contracts (`IOrganizationRepository`, `IClientCompanyRepository`, `ITicketRepository`, `IMessageRepository`, `IRatingRepository`) have working Drizzle ORM implementations.
- **SC-002**: Concurrency test verifies zero race conditions when claiming tickets concurrently.
- **SC-003**: Drizzle migration runner successfully executes all SQL migrations against both Manager and Tenant databases.
- **SC-004**: 100% test pass rate with unit and integration tests for all models, mappers, and repositories.

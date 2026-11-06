# Technical Research & Architecture Decisions

**Feature**: PostgreSQL Persistence Layer with Drizzle ORM and Multi-Tenant Migrations  
**Branch**: `002-drizzle-persistence-layer`  
**Date**: 2026-11-06  

---

### Decision 1: ORM Engine & Driver
- **Decision**: Adopt **Drizzle ORM** paired with the native PostgreSQL driver `pg` (`node-postgres`) and `@types/pg`.
- **Rationale**: Drizzle is zero-overhead, highly performant, fully type-safe, and does not require heavyweight runtime binaries (unlike Prisma). Instantiating Drizzle on top of a tenant connection pool takes sub-millisecond overhead.
- **Alternatives Considered**:
  - *Prisma*: Heavyweight C++/Rust engine, excessive memory consumption when instantiating clients per tenant, poor multi-tenant migration ergonomics.
  - *Sequelize*: Legacy ActiveRecord pattern with heavy memory footprint, older decorator-based TypeScript types.
  - *TypeORM*: Slow connection initialization, maintenance and bug issues in complex migrations.

---

### Decision 2: Dual-Database Schema Architecture
- **Decision**: Partition schemas into two distinct modules:
  - **Manager DB**: `organizations` table holding global subscriber accounts, contracted concurrent tickets, and structured/JSONB `connection` parameters.
  - **Tenant DB**: Domain tables for each subscriber: `users`, `client_companies`, `requesters`, `queues`, `tickets`, `messages`, `ratings`.
- **Rationale**: Strict physical separation guarantees that tenant operational data is completely isolated from other organizations and platform management records.

---

### Decision 3: Dynamic Tenant Connection Pooling & CLS Scoping
- **Decision**: Manage a pool cache in `TenantConnectionRegistry` keyed by `${host}:${port}:${database}`. During request execution, `TenantAuthMiddleware` binds the tenant Drizzle client to `TenantConnectionContext` using `nestjs-cls` (`AsyncLocalStorage`).
- **Rationale**: Eliminates the overhead of opening new TCP connection pools on every HTTP request while preventing cross-tenant data leakage across concurrent async operations.

---

### Decision 4: Atomic Concurrency for Ticket Claims
- **Decision**: Implement `claimTicketAtomically` using a single atomic conditional SQL operation inside a transaction:
  ```sql
  UPDATE tickets
  SET status = 'IN_PROGRESS', agent_id = $1, claimed_at = NOW(), queue_wait_time_sec = EXTRACT(EPOCH FROM (NOW() - entered_queue_at))
  WHERE id = $2 AND status = 'WAITING_QUEUE'
  RETURNING *;
  ```
- **Rationale**: Prevents race conditions at the database engine level with zero reliance on external distributed locks. If two agents click "Claim" at the same millisecond, exactly one row update succeeds; the other returns 0 rows and immediately throws `error.ticket_already_claimed_or_processed`.

---

### Decision 5: Migration Strategy
- **Decision**: Maintain timestamped raw SQL files under `core/migrations/manager/` and `core/migrations/tenant/` using `drizzle-kit generate` or manual DDL scripts following `YYYYMMDDHHMMSS-<action>.sql`. Provide an automated migration runner in `core/src/database/migrator.ts` that applies pending migrations idempotently using a tracking table `__drizzle_migrations`.
- **Rationale**: Satisfies the mandatory rule in `AGENTS.md` (1.4) while enabling easy automated provisioning of new tenant databases upon organization onboarding.

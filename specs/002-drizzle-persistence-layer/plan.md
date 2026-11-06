# Implementation Plan: PostgreSQL Persistence Layer with Drizzle ORM and Multi-Tenant Migrations

**Branch**: `002-drizzle-persistence-layer` | **Date**: 2026-11-06 | **Spec**: [Feature Specification](spec.md)  
**Input**: Multi-tenant PostgreSQL persistence layer using Drizzle ORM, dual-database architecture (Manager DB vs Tenant DB), DDD entity mappers, atomic transaction locking for ticket claims, and timestamped SQL migrations.

## Summary

This feature establishes the production database persistence layer for AlusDesk using Drizzle ORM with PostgreSQL (`pg`). It implements a clean separation between the central Manager database (holding `Organization` records and connection configs) and isolated tenant databases (storing `User`, `ClientCompany`, `Requester`, `Queue`, `Ticket`, `Message`, and `Rating` records). Repositories adhere strictly to `@core/repository` interfaces with DDD mappers, concurrency-safe atomic operations on ticket claims, and timestamped raw SQL migrations.

## Technical Context

**Language/Version**: TypeScript 5.4+ (Node.js 20+ LTS)  
**Primary Dependencies**:
- Persistence: `drizzle-orm`, `drizzle-kit`, `pg`, `@types/pg`
- Context/DI: `nestjs-cls`, `@nestjs/common`, `@nestjs/config`
**Storage**: PostgreSQL 16+ (dual database topology: Manager DB + Tenant DBs)  
**Testing**: Jest + in-memory / mocked PostgreSQL pg clients  
**Project Type**: Monorepo (`core/`, `backend/`)  
**Performance Goals**: <5ms query execution on indexed lookups; zero connection leaks via cached pools in `TenantConnectionRegistry`.  
**Constraints**:
- Strictly zero ORM decorators on domain entities (`core/src/domain/entity.ts` remains pure).
- Timestamped SQL migrations (`YYYYMMDDHHMMSS-<name>.sql`) in `core/migrations/manager/` and `core/migrations/tenant/`.
- Concurrency-safe queue claim transactions without race conditions.

## Constitution & Engineering Guidelines Check

- [x] **Zero Unnecessary Comments**: Self-documenting code with expressive naming.
- [x] **100% English**: All symbols, types, tests, variables, and documentation in US English.
- [x] **i18n Applied**: Error strings accessed via `i18n.t(...)`.
- [x] **Repository Decoupling**: Repositories extend `ISearchableRepository` with mappers in `infra/database/`.
- [x] **Mandatory Migrations**: SQL migration files with timestamps created in `core/migrations/`.
- [x] **Clean Pipeline**: Integrates seamlessly with `Controller -> Service -> Use Case -> Repository`.

## Project Structure

```text
alusdesk/
├── core/
│   ├── src/
│   │   ├── database/
│   │   │   ├── drizzle.connection.ts               # Drizzle client factory with pg.Pool
│   │   │   ├── migrator.ts                         # Automated SQL migration runner
│   │   │   └── schema/
│   │   │       ├── manager.schema.ts               # organizations table
│   │   │       └── tenant.schema.ts                # users, client_companies, requesters, queues, tickets, messages, ratings
│   │   └── modules/
│   │       ├── organization/
│   │       │   └── domain/organization/infra/database/
│   │       │       ├── organization.model.ts       # Drizzle repository implementation
│   │       │       ├── organization-model.mapper.ts
│   │       │       └── organization.model.spec.ts
│   │       ├── customer/
│   │       │   └── domain/client-company/infra/database/
│   │       │       ├── client-company.model.ts
│   │       │       ├── client-company-model.mapper.ts
│   │       │       └── client-company.model.spec.ts
│   │       └── helpdesk/
│   │           ├── domain/ticket/infra/database/
│   │           │   ├── ticket.model.ts             # ITicketRepository with claimTicketAtomically
│   │           │   ├── ticket-model.mapper.ts
│   │           │   └── ticket.model.spec.ts
│   │           ├── domain/message/infra/database/
│   │           │   ├── message.model.ts
│   │           │   ├── message-model.mapper.ts
│   │           │   └── message.model.spec.ts
│   │           └── domain/rating/infra/database/
│   │               ├── rating.model.ts
│   │               ├── rating-model.mapper.ts
│   │               └── rating.model.spec.ts
│   └── migrations/
│       ├── manager/
│       │   └── 20261106000000-create-manager-organizations.sql
│       └── tenant/
│           └── 20261106000001-create-tenant-core-tables.sql
│
└── backend/
    └── src/
        ├── database/
        │   ├── drizzle-database.connection.ts      # Implements IDatabaseConnection via Drizzle
        │   ├── tenant-connection.registry.ts       # Caches pg.Pool & Drizzle per tenant
        │   └── tenant-connection.context.ts        # Request-scoped CLS accessor
        └── use-cases/
            └── organization/connect-multi-tenant/
```


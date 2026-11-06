# Tasks: PostgreSQL Persistence Layer with Drizzle ORM and Multi-Tenant Migrations

**Input**: Design documents from `/specs/002-drizzle-persistence-layer/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`)  
**Branch**: `002-drizzle-persistence-layer`  
**Prerequisites**: Monorepo workspaces (`core/`, `backend/`)

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel without blocking dependencies
- **[Story]**: User Story label (`US1`, `US2`, `US3`, `US4`, `US5`)

---

## Phase 1: Setup & Dependencies

**Purpose**: Install Drizzle ORM and PostgreSQL driver dependencies across workspaces.

- [x] T001 Install `drizzle-orm` and `pg` in `@alusdesk/core` and `drizzle-kit`, `@types/pg` in devDependencies.
- [x] T002 [P] Install `pg` and `@types/pg` in `@alusdesk/backend`.
- [x] T003 Configure `drizzle.config.ts` in `core/` for manager and tenant schema management.

---

## Phase 2: Foundational Schemas & Migrations

**Purpose**: Define Drizzle PostgreSQL schema definitions and timestamped SQL migrations.

- [x] T004 [P] Define central manager schema in `core/src/database/schema/manager.schema.ts` (`organizations`).
- [x] T005 [P] Define tenant schema in `core/src/database/schema/tenant.schema.ts` (`users`, `client_companies`, `requesters`, `queues`, `tickets`, `messages`, `ratings`).
- [x] T006 Create timestamped SQL migration for Manager DB in `core/migrations/manager/20261106000000-create-manager-organizations.sql`.
- [x] T007 Create timestamped SQL migration for Tenant DB in `core/migrations/tenant/20261106000001-create-tenant-core-tables.sql`.

---

## Phase 3: User Story 1 - Central Manager DB & Organization Persistence (Priority: P1) 🎯 MVP

**Goal**: Persist and query `Organization` records in the central Manager database with DDD mapper and repository.  
**Independent Test**: Execute manager migration, insert an `Organization`, and retrieve it via `OrganizationModelMapper` and `DrizzleOrganizationRepository`.

- [x] T008 [P] [US1] Implement `OrganizationModelMapper` in `core/src/modules/organization/domain/organization/infra/database/organization-model.mapper.ts`.
- [x] T009 [US1] Implement `DrizzleOrganizationRepository` implementing `IOrganizationRepository` in `core/src/modules/organization/domain/organization/infra/database/organization.model.ts`.
- [x] T010 [US1] Verify and write unit/integration tests in `core/src/modules/organization/domain/organization/infra/database/organization.model.spec.ts`.

---

## Phase 4: User Story 2 - Tenant Foundation Repositories (Priority: P1)

**Goal**: Persist users, client companies, requesters, and queues in tenant databases.  
**Independent Test**: Save a `ClientCompany` and query it with pagination via `DrizzleClientCompanyRepository`.

- [x] T011 [P] [US2] Implement `ClientCompanyModelMapper` and `DrizzleClientCompanyRepository` in `core/src/modules/customer/domain/client-company/infra/database/`.
- [x] T012 [P] [US2] Implement `UserModelMapper` and `DrizzleUserRepository` in `core/src/modules/identity/domain/user/infra/database/`.
- [x] T013 [P] [US2] Implement `QueueModelMapper` and `DrizzleQueueRepository` in `core/src/modules/helpdesk/domain/queue/infra/database/`.
- [x] T014 [US2] Verify and write unit/integration tests for tenant foundation repositories (`client-company.model.spec.ts`, etc.).

---

## Phase 5: User Story 3 - Helpdesk Repositories & Concurrency-Safe Claims (Priority: P1)

**Goal**: Persist tickets, messages, and CSAT ratings with atomic locking on queue claims.  
**Independent Test**: Run concurrent `claimTicketAtomically` calls; ensure only 1 claim succeeds and returns `IN_PROGRESS`.

- [x] T015 [US3] Implement `TicketModelMapper` and `DrizzleTicketRepository` in `core/src/modules/helpdesk/domain/ticket/infra/database/ticket.model.ts` with atomic conditional `UPDATE` query.
- [x] T016 [P] [US3] Implement `MessageModelMapper` and `DrizzleMessageRepository` in `core/src/modules/helpdesk/domain/message/infra/database/message.model.ts`.
- [x] T017 [P] [US3] Implement `RatingModelMapper` and `DrizzleRatingRepository` in `core/src/modules/helpdesk/domain/rating/infra/database/rating.model.ts`.
- [x] T018 [US3] Verify and write unit/integration tests for helpdesk repositories (`ticket.model.spec.ts`, `message.model.spec.ts`, `rating.model.spec.ts`).

---

## Phase 6: User Story 4 - Dynamic Tenant Drizzle Pool Provider & CLS (Priority: P1)

**Goal**: Wire dynamic tenant Drizzle clients into `IDatabaseConnection` and `TenantConnectionRegistry`.  
**Independent Test**: Execute queries against two different tenant connections concurrently via `TenantConnectionContext`.

- [x] T019 [US4] Implement `DrizzleDatabaseConnection` in `backend/src/database/drizzle-database.connection.ts` implementing `IDatabaseConnection`.
- [x] T020 [US4] Integrate `DrizzleDatabaseConnection` with `TenantConnectionRegistry` and `TenantConnectionContext` in `backend/src/database/`.
- [x] T021 [US4] Unit test dynamic connection switching and tenant context resolution in `backend/src/database/drizzle-database.connection.spec.ts`.

---

## Phase 7: User Story 5 - Automated Multi-Tenant Migration Runner CLI (Priority: P2)

**Goal**: Run timestamped migrations automatically across Manager DB and all active Tenant DBs.  
**Independent Test**: Run migration CLI; verify that all unapplied SQL scripts execute idempotently.

- [x] T022 [US5] Implement SQL migration runner in `core/src/database/migrator.ts` using `pg` and `__drizzle_migrations` tracking table.
- [x] T023 [US5] Add CLI migration scripts in `core/package.json` (`npm run migrate:manager`, `npm run migrate:tenants`).

---

## Phase 8: Polish & Verification

- [x] T024 Run full test suite pass verification (`npm run test --workspaces`).
- [x] T025 Run `speckit.analyze` consistency analysis.

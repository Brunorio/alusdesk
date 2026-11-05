# Tasks: Multi-Tenant Corporate Helpdesk and Remote Control Core Platform

**Input**: Design documents from `/specs/001-multi-tenant-helpdesk-core/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`)  
**Branch**: `001-multi-tenant-helpdesk-core`  
**Prerequisites**: Monorepo workspaces (`core/`, `backend/`, `frontend/`, `agent/`)

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel without blocking dependencies
- **[Story]**: User Story label (`US1`, `US2`, `US3`, `US4`, `US5`)

---

## Phase 1: Setup & Monorepo Foundation

**Purpose**: Core workspace structure, TypeScript configs, and shared DDD primitives.

- [x] T001 Initialize root monorepo `package.json`, `pnpm-workspace.yaml`, and root `tsconfig.json`.
- [x] T002 [P] Create base domain utilities in `core/src/domain/`: `Entity`, `EntityRules`, `Input`, `Output`.
- [x] T003 [P] Create strongly-typed Value Objects in `core/src/domain/value-object/`: `Uuid`.
- [x] T004 [P] Create repository contracts in `core/src/repository/`: `ISearchableRepository`, `SearchParams`, `SearchResult`.
- [x] T005 [P] Setup base use case interface in `core/src/use-cases/use-case.interface.ts` (`IUseCase<Input, Output>`).

---

## Phase 2: User Story 1 - Organization Onboarding & Staff Management (Priority: P1) 🎯 MVP

**Goal**: Provision multi-tenant organizations, configure staff roles (`ADMIN`, `SUPERVISOR`, `AGENT`), and define departmental queues.  
**Independent Test**: Register an Organization, create support agents and queues, and verify tenant-isolated access.

- [x] T006 [P] [US1] Implement `Organization` domain entity, rules, and value objects in `core/src/modules/organization/domain/organization/domain/`.
- [x] T007 [P] [US1] Define `IOrganizationRepository` interface in `core/src/modules/organization/domain/organization/domain/organization.repository.ts`.
- [x] T008 [US1] Implement `CreateOrganizationUseCase` in `backend/src/use-cases/organization/create-organization/create-organization.use-case.ts`.
- [ ] T009 [P] [US1] Implement `User` domain entity, role enums, and repository contract in `core/src/modules/identity/domain/user/domain/`.
- [ ] T010 [P] [US1] Implement `Queue` domain entity and repository contract in `core/src/modules/helpdesk/domain/queue/domain/`.
- [ ] T011 [US1] Implement `CreateUserUseCase` and `CreateQueueUseCase` in `backend/src/use-cases/identity/` and `backend/src/use-cases/helpdesk/queue/`.
- [x] T012 [US1] Verify and execute unit tests in `core/src/modules/organization/domain/organization/domain/organization.spec.ts` and `create-organization.use-case.spec.ts`.

---

## Phase 3: User Story 2 - Customer Company Licensing & Real-Time Ticket Queue (Priority: P1)

**Goal**: Validate client company concurrent licenses, generate protocol numbers, and atomically claim tickets from the queue.  
**Independent Test**: Submit a ticket from a client company, observe queue event over WebSocket, and claim the ticket atomically with concurrency rejection on duplicates.

- [x] T013 [P] [US2] Implement `ClientCompany` domain entity, licensing invariants (`canOpenSession`), and repository contract in `core/src/modules/customer/domain/client-company/domain/`.
- [x] T014 [P] [US2] Implement `Ticket` domain entity, state machine, and SLA calculations in `core/src/modules/helpdesk/domain/ticket/domain/`.
- [x] T015 [P] [US2] Define `ITicketRepository` interface with `claimTicketAtomically` in `core/src/modules/helpdesk/domain/ticket/domain/ticket.repository.ts`.
- [x] T016 [US2] Implement `CreateTicketUseCase` with dual capacity checks (Org + ClientCompany) in `backend/src/use-cases/helpdesk/ticket/create-ticket/create-ticket.use-case.ts`.
- [x] T017 [US2] Implement `ClaimTicketUseCase` with atomic transaction in `backend/src/use-cases/helpdesk/ticket/claim-ticket/claim-ticket.use-case.ts`.
- [ ] T018 [US2] Implement `QueueGateway` in `backend/src/realtime/queue/queue.gateway.ts` listening to `ticket.created` and `ticket.claimed` domain events.
- [x] T019 [US2] Execute and verify integration tests in `ticket.spec.ts`, `client-company.spec.ts`, `create-ticket.use-case.spec.ts`, and `claim-ticket.use-case.spec.ts`.

---

## Phase 4: User Story 3 - Omnichannel Multimedia Messaging & Media Switching (Priority: P1)

**Goal**: Deliver text, audio waveforms, images, screen snips, and screen recordings over WebSockets with media channel escalation.  
**Independent Test**: Exchange multimedia messages between customer and agent in active tickets with real-time delivery and channel switching.

- [x] T020 [P] [US3] Implement `Message` domain entity, media types, and repository contract in `core/src/modules/helpdesk/domain/message/domain/`.
- [x] T021 [US3] Implement `SendMessageUseCase` in `backend/src/use-cases/helpdesk/message/send-message/send-message.use-case.ts`.
- [ ] T022 [US3] Implement `ChatGateway` in `backend/src/realtime/chat/chat.gateway.ts` managing isolated ticket rooms (`ticket:{id}`).
- [ ] T023 [US3] Implement channel switching use case `SwitchTicketChannelUseCase` in `backend/src/use-cases/helpdesk/ticket/switch-channel/`.
- [x] T024 [US3] Execute and verify tests in `message.spec.ts` and `send-message.use-case.spec.ts`.

---

## Phase 5: User Story 4 - Remote Desktop Assistance via Rust Agent (Priority: P2)

**Goal**: Connect the native Rust daemon via WebRTC to stream screen frames and inject validated keyboard/mouse inputs.  
**Independent Test**: Establish WebRTC DataChannel connection between Rust daemon and browser agent console with affirmative user opt-in and emergency kill-switch.

- [ ] T025 [P] [US4] Initialize Rust cargo package in `agent/` with dependencies (`xcap`, `enigo`, `tokio`, `webrtc`).
- [ ] T026 [P] [US4] Implement screen frame capture module in `agent/src/capture.rs`.
- [ ] T027 [P] [US4] Implement input injection module with bounds sanitization in `agent/src/input.rs`.
- [ ] T028 [US4] Implement WebRTC signaling bridge in `backend/src/realtime/remote/remote.gateway.ts`.
- [ ] T029 [US4] Implement client consent modal prompt and kill-switch in `frontend/src/views/helpdesk/ticket/components/RemoteControlDialog.tsx`.

---

## Phase 6: User Story 5 - Ticket Resolution, CSAT Rating & Operational Analytics (Priority: P2)

**Goal**: Resolve tickets, prompt requesters for 1-to-5 star CSAT ratings, calculate total duration, and aggregate SLA analytics.  
**Independent Test**: Resolve an active ticket, submit a rating, verify terminal transition to `CLOSED`, and verify SLA dashboard metrics.

- [x] T030 [P] [US5] Implement `Rating` domain entity, validation invariants (score 1-5), and repository contract in `core/src/modules/helpdesk/domain/rating/domain/`.
- [ ] T031 [US5] Implement `ResolveTicketUseCase` in `backend/src/use-cases/helpdesk/ticket/resolve-ticket/resolve-ticket.use-case.ts`.
- [x] T032 [US5] Implement `SubmitRatingUseCase` in `backend/src/use-cases/helpdesk/rating/submit-rating/submit-rating.use-case.ts`.
- [ ] T033 [US5] Implement `GetQueueAnalyticsUseCase` in `backend/src/use-cases/analytics/get-queue-analytics/`.
- [x] T034 [US5] Execute and verify tests in `rating.spec.ts` and `submit-rating.use-case.spec.ts`.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T035 [P] Setup timestamped database migrations in `core/migrations/` for all entities.
- [ ] T036 Run `speckit.analyze` consistency analysis across `spec.md`, `plan.md`, and `tasks.md`.
- [ ] T037 Run full test suite pass verification (`core` unit tests, `backend` use case integration tests, `agent` tests).


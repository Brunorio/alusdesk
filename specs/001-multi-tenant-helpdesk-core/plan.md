# Implementation Plan: Multi-Tenant Corporate Helpdesk and Remote Control Core Platform

**Branch**: `001-multi-tenant-helpdesk-core` | **Date**: 2026-11-05 | **Spec**: [Feature Specification](spec.md)  
**Input**: Multi-tenant corporate helpdesk, real-time omnichannel triage, and native remote desktop assistance platform.

## Summary

The platform is designed following the Clean 4-Tier Pipeline (`Controller -> Service -> Use Case -> Repository`) and Domain-Driven Design (DDD) rules established in `AGENTS.md`. It guarantees tenant isolation across Organizations, supports concurrency-safe queue claims, real-time multimedia chat over WebSockets, WebRTC signaling for media and remote control, and a native Rust daemon for screen capture and input injection.

## Technical Context

**Language/Version**: TypeScript 5.4+ (Node.js 20+ LTS) and Rust 1.78+ (2021 Edition)  
**Primary Dependencies**:
- Backend: NestJS, `@nestjs/websockets`, `socket.io`, `@nestjs/event-emitter`, `class-validator`, `class-transformer`
- Persistence: PostgreSQL 16+ via Prisma / Sequelize migration scripts
- Frontend: React 19, Vite, Tailwind CSS 4, Radix UI, Zustand
- Agent Host: Rust (`xcap`, `enigo`, `tokio`, `webrtc-rs` / `tokio-tungstenite`)  
**Storage**: PostgreSQL (ACID relational transactional data) + Redis (Socket.io adapter / PubSub) + S3-compatible object store (multimedia voice notes, screenshots, video recordings)  
**Testing**: Jest + Supertest (TypeScript unit/integration specs), Cargo test (Rust unit tests)  
**Target Platform**: Linux/Docker (Cloud Deployments), Cross-platform Desktop for Rust Agent (Windows, Linux, macOS)  
**Project Type**: Monorepo (`core/`, `backend/`, `frontend/`, `agent/`)  
**Performance Goals**: <150ms real-time event delivery; <100ms P2P remote control latency at 30-60 FPS  
**Constraints**: Zero race conditions on queue claims (atomic transactions); mandatory customer opt-in consent for remote control; zero raw HTML input primitives on frontend; zero Swagger annotations per user specification.

## Constitution & Engineering Guidelines Check

- [x] **Zero Unnecessary Comments**: Self-documenting code with expressive naming.
- [x] **100% English**: All symbols, types, tests, variables, and documentation in US English.
- [x] **i18n Applied**: Error strings accessed via `i18n.t(...)`.
- [x] **Repository Decoupling**: Repositories extend `ISearchableRepository` with no framework imports in `domain/`.
- [x] **Pipeline Strictness**: All backend operations follow `Controller -> Service -> Use Case -> Repository`.
- [x] **No Swagger**: Swagger decorators explicitly excluded.
- [x] **Frontend Standards**: `<ResponsiveData>`, `useDialog`, and custom standardized inputs.

## Project Structure

```text
alusdesk/
├── core/                                         # Pure Domain & Persistence Contracts
│   ├── src/
│   │   ├── domain/                               # Entity, Uuid, EntityRules
│   │   ├── repository/                           # ISearchableRepository, SearchParams, SearchResult
│   │   ├── use-cases/                            # IUseCase<Input, Output>
│   │   └── modules/
│   │       ├── organization/domain/organization/ # Organization root & licensing capacity
│   │       ├── customer/domain/client-company/   # Client companies & concurrent limits
│   │       ├── customer/domain/requester/        # End-user requesters
│   │       └── helpdesk/
│   │           ├── domain/queue/                 # Triage queues
│   │           ├── domain/ticket/                # Ticket aggregate root & state machine
│   │           ├── domain/message/               # Multimedia communication
│   │           └── domain/rating/                # CSAT ratings
│   └── migrations/                               # Timestamped SQL migrations
│
├── backend/                                      # NestJS Application & Realtime Server
│   ├── src/
│   │   ├── routes/                               # Thin controllers & services
│   │   ├── use-cases/                            # Atomic application actions
│   │   └── realtime/                             # Socket.io gateways (/queue, /chat)
│
├── frontend/                                     # React 19 SPA
│   ├── src/
│   │   ├── components/                           # StandardInput, ResponsiveData, PageHeader
│   │   ├── requests/                             # Typed request classes extending BaseRequest
│   │   └── views/                                # Modular views using custom hooks
│
└── agent/                                        # Rust Host Daemon
    ├── src/
    │   ├── main.rs                               # Daemon entrypoint
    │   ├── capture.rs                            # Desktop screen capture via xcap
    │   └── input.rs                              # Keyboard/mouse synthesis via enigo
```


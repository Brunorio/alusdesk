# Technical & Functional Specification - AlusDesk

## 1. System Overview & Objectives
This document establishes the technical, architectural, and business rule specifications for the implementation, maintenance, and evolution of the **AlusDesk** platform. AlusDesk is a high-performance, multi-tenant corporate platform providing **Helpdesk, Real-Time Omnichannel Support, and Remote Control Assistance**.

The core objective is to deliver a unified enterprise solution that manages:
1. **Multi-Tenancy & Platform Licensing:** Isolation per **Organization** (the platform subscriber / service desk company), allowing each organization to manage its own support team, customer companies, concurrent session quotas, and queues.
2. **Real-Time Triage & Queue Distribution:** Queue dispatching engine with sub-second WebSocket updates, SLA tracking, and accurate queue wait time calculation.
3. **Omnichannel & Multimedia Customer Experience:** Real-time text messaging, integrated in-browser voice note recording with audio waveform previews, image/video uploads, in-browser screen snipping, and quick screen recording clips.
4. **Dynamic Media Escalation & Remote Desktop Control:** Fluid transitions between Chat, Voice Call, Video Call, and Screen Sharing, with native remote control enabled via a lightweight high-performance daemon written in **Rust**.
5. **Customer Satisfaction (CSAT/NPS) & Real-Time Operational Analytics:** Mandatory or configurable satisfaction ratings upon ticket resolution, feeding live analytics dashboards for supervisors and administrators.

---

## 2. Multi-Tenant Actor Hierarchy & Nomenclature

To eliminate conceptual ambiguity, the platform establishes the following domain hierarchy:

```
AlusDesk Global Platform (Manager Layer)
  └── Organization (The Subscriber / Service Desk Provider)
        ├── Support Team (Internal Users: Admin, Supervisor, Agent)
        ├── Queues (Tier 1, Tier 2, Billing, Infrastructure)
        └── Customer Companies (Corporate Clients serviced by the Organization)
              └── Requesters (End-user employees opening support tickets)
```

### Actor Roles:
- **Global Administrator (Platform Owner):** Manages subscriber Organizations, global plans, and billing/provisioning.
- **Organization Admin:** Manages organization support staff, assigns supervisor/agent roles, configures queues, registers customer companies, and monitors analytics.
- **Support Supervisor:** Monitors real-time queue states, active sessions, team workloads, and SLA compliance across queues.
- **Support Agent (Operator):** Views incoming tickets in the queue, claims tickets atomically, handles omnichannel communication, requests remote access, and resolves tickets.
- **Customer Company:** A corporate client registered under an Organization, bounded by a contractually defined maximum concurrent ticket capacity (`maxConcurrentSessions`).
- **Requester (End-User):** An employee of a customer company who requests assistance via the customer widget or portal, exchanges multimedia messages, grants remote control access, and rates tickets.

---

## 3. Technology Stack & Architectural Patterns

The project follows strict **Domain-Driven Design (DDD)** and **Clean Architecture** organized within a TypeScript/Rust monorepo.

### 3.1. Monorepo Package Boundaries
```
alusdesk/
├── core/         # Pure domain rules (DDD), entities, value objects, use-case contracts, DB models
├── backend/      # NestJS API, controllers, services, use cases, Socket.io gateways & WebRTC signaling
├── frontend/     # React 19 + Vite SPA, views, custom hooks, standardized inputs & request classes
└── agent/        # Rust host daemon for remote screen capture (xcap) and input injection (enigo)
```

### 3.2. Clean 4-Tier Application Pipeline
Every backend operation follows a unidirectional pipeline:
$$\text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Use Case} \longrightarrow \text{Repository}$$

- **Controllers:** Thin routing, validation via class-validator, and RBAC guards (`@AllowedFor(...)`). Swagger is omitted at this phase.
- **Services:** Injectable facades delegating to specialized single-responsibility Use Cases.
- **Use Cases:** Atomic business actions implementing `IUseCase<Input, Output>`.
- **Repositories:** Abstract interfaces extending `ISearchableRepository`, injected via tokens (`@Inject('ITicketRepository')`).

---

## 4. Multi-Tenancy Strategy

Each Organization is strictly isolated:
- Every tenant resource (`User`, `CustomerCompany`, `Requester`, `Queue`, `Ticket`, `Message`, `Rating`) is bound to an `organizationId`.
- Cross-tenant queries are blocked at both the application level (NestJS tenant guards/interceptors) and persistence layer queries.
- Tenant database isolation can be configured as **Row-Level Partitioning** with PostgreSQL Row Level Security (RLS) or **Dedicated Tenant Database/Schema** per organization.

---

## 5. Non-Functional Requirements

1. **Sub-Second Real-Time Latency:**
   - Chat messaging and queue state updates must propagate in under 150ms over standard broadband connections.
   - Remote control video frames and input feedback loops target <100ms in local networks and <250ms via STUN/TURN relays at 30-60 FPS.
2. **Concurrency & Atomic Queue Claims:**
   - Ticket claims from the queue must execute inside serialized database transactions. If two agents attempt to claim the same ticket at the exact same millisecond, exactly one succeeds and the other receives an immediate conflict rejection (`error.ticket_already_claimed_or_processed`).
3. **Explicit Consent & Safety:**
   - Remote screen control and media upgrades require explicit user approval via a modal dialog (*opt-in*).
   - The user has a prominent floating stop button (*kill-switch*) to terminate remote control instantly at any moment.
4. **License Enforcement:**
   - Before a ticket transitions to `WAITING_QUEUE`, the customer company's active concurrent ticket count is validated against its `maxConcurrentSessions`. If exceeded, ticket creation is rejected with `error.concurrent_limit_exceeded`.

---

## 6. Ticket State Machine & Lifecycle

Tickets follow a deterministic lifecycle:

```
       [New Ticket Request]
                 │
                 ▼
         ( WAITING_QUEUE ) ──────────► ( CANCELLED )
                 │ (Atomic claim by Agent)
                 ▼
          ( IN_PROGRESS ) ◄──────────┐
            │          │             │ (Resume)
            │          ▼             │
            │      ( PAUSED ) ───────┘
            │
            ▼ (Agent Resolves)
          ( RESOLVED )
            │ (Requester submits Rating / Timeout)
            ▼
           ( CLOSED ) [Terminal State]
```

### Legal Transitions Matrix:
| Current State | Permitted Next State | Trigger / Condition |
| :--- | :--- | :--- |
| `WAITING_QUEUE` | `IN_PROGRESS` | Support agent claims ticket from the queue |
| `WAITING_QUEUE` | `CANCELLED` | Requester cancels before being answered |
| `IN_PROGRESS` | `PAUSED` | Waiting for external action or requester response |
| `IN_PROGRESS` | `RESOLVED` | Agent concludes technical resolution |
| `IN_PROGRESS` | `CLOSED` | Direct administrative close |
| `PAUSED` | `IN_PROGRESS` | Ticket resumed by agent or new customer message |
| `RESOLVED` | `IN_PROGRESS` | Requester reopens stating issue persists |
| `RESOLVED` | `CLOSED` | Rating submitted or 24-hour timeout without response |
| `CLOSED` | *None* | Final read-only state |
| `CANCELLED` | *None* | Final read-only state |

---

## 7. Real-Time WebSocket Event Catalog

### 7.1. Namespace `/queue` (Monitored by Agents & Supervisors)
- `queue:ticket_entered`: Dispatched when a new ticket is queued.
- `queue:ticket_claim`: Agent action to claim a ticket `{ ticketId }`.
- `queue:ticket_claimed`: Broadcast to all agents removing the ticket from view `{ ticketId, agentId, agentName }`.
- `queue:metrics_update`: Live aggregate counts of waiting, in-progress, and average wait time.

### 7.2. Namespace `/chat` (Isolated Room: `ticket:{ticketId}`)
- `chat:join`: Client/Agent joins ticket room.
- `chat:message_send`: Send message (text or multimedia URL + metadata).
- `chat:message_received`: Broadcast to ticket participants with server timestamp.
- `session:upgrade_request`: Agent requests Voice, Video, or Remote Control.
- `session:consent_response`: Requester approves or denies media session request.
- `session:webrtc_signal`: Relays SDP offers, answers, and ICE candidates between browser and Rust host.
- `ticket:rating_prompt`: Prompts the requester's UI with the rating modal upon resolution.
- `ticket:rating_submitted`: Requester submits score (1-5) and feedback.

---

## 8. Rust Remote Agent Host (`agent/`)
- Native daemon compiled with memory safety and zero unnecessary allocations.
- Frame capture using `xcap` crate or native platform display APIs.
- Keyboard/mouse event injection using `enigo` crate.
- Asynchronous networking and signaling managed by `tokio` and WebRTC DataChannels.
- Validates and sanitizes incoming binary control frames to prevent unauthorized system injection.

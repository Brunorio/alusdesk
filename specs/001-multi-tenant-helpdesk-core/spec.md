# Feature Specification: Multi-Tenant Corporate Helpdesk and Remote Control Core Platform

**Feature Branch**: `001-multi-tenant-helpdesk-core`  
**Created**: 2026-11-05  
**Status**: Ready for Planning  
**Input**: Multi-tenant corporate helpdesk, real-time omnichannel triage, and native remote desktop assistance platform.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Organization Onboarding & Staff Management (Priority: P1)

As a Service Desk Provider (Organization Owner), I want to create and configure my Organization, provision support staff (Admins, Supervisors, and Agents), and define departmental queues so that my team can start servicing client companies.

**Why this priority**: Essential foundation for multi-tenancy. Without an Organization and staff, no tickets can be received, assigned, or processed.

**Independent Test**: Can be independently tested by registering an Organization, inviting support agents, configuring queues, and verifying authentication and tenant-bound access.

**Acceptance Scenarios**:
1. **Given** valid registration details, **When** an Organization is created, **Then** a dedicated tenant context is provisioned with active status and contracted concurrent ticket limits.
2. **Given** an Organization Admin, **When** they add support agents with specific roles (`AGENT`, `SUPERVISOR`), **Then** credentials and permissions are created and scoped exclusively to that Organization.
3. **Given** an authenticated agent, **When** they access queues, **Then** only queues belonging to their own Organization are visible.

---

### User Story 2 - Customer Company Licensing & Real-Time Ticket Queue (Priority: P1)

As a Requester working for a Customer Company, I want to request support and enter a real-time queue, and as a Support Agent, I want to view waiting tickets and claim one atomically to begin assistance.

**Why this priority**: Core revenue-generating transaction of the system. Handles ticket intake, concurrent license verification, and queue dispatching.

**Independent Test**: Can be tested by submitting a ticket from a licensed customer company, observing it appear in the agent queue via WebSocket, and having an agent claim it atomically without race conditions.

**Acceptance Scenarios**:
1. **Given** a Customer Company with available concurrent capacity (`activeSessions < maxConcurrentSessions`), **When** a Requester submits a ticket, **Then** the ticket is assigned status `WAITING_QUEUE`, a protocol number is generated, and all online agents receive a `queue:ticket_entered` WebSocket notification.
2. **Given** a Customer Company at its maximum concurrent capacity (`activeSessions == maxConcurrentSessions`), **When** a Requester submits a ticket, **Then** the system rejects creation with `error.concurrent_limit_exceeded`.
3. **Given** a ticket in `WAITING_QUEUE`, **When** Agent A claims it, **Then** its status transitions to `IN_PROGRESS`, `claimedAt` and `queueWaitTimeSec` are recorded, and a broadcast removes the ticket from all other agents' queues.
4. **Given** a ticket currently being claimed by Agent A, **When** Agent B attempts to claim the exact same ticket simultaneously, **Then** Agent B's request is rejected with `error.ticket_already_claimed_or_processed`.

---

### User Story 3 - Omnichannel Multimedia Messaging & Media Switching (Priority: P1)

As a Requester and Support Agent in an active ticket session, we want to communicate using real-time text, recorded audio voice notes, captured screen snips, and quick screen recording videos, with the ability to dynamically switch to voice or video calls.

**Why this priority**: Essential to diagnose and solve customer issues faster compared to traditional plain-text email ticketing.

**Independent Test**: Can be tested by establishing an active ticket session, exchanging text messages, recording in-browser audio waveforms, uploading screen snips, and validating sub-second delivery.

**Acceptance Scenarios**:
1. **Given** an `IN_PROGRESS` ticket, **When** a participant sends a message (text, recorded audio, image, video clip, or screen capture), **Then** the message is persisted and broadcast to the isolated ticket room (`ticket:{id}`) within 150ms.
2. **Given** a ticket in `CLOSED` state, **When** a participant attempts to send a message, **Then** the operation is rejected with `error.ticket_is_closed`.
3. **Given** an active chat, **When** either party requests a channel switch (Voice Call, Video Call, or Screen Share), **Then** the counterparty receives a real-time modal prompt to accept or decline before the media stream is initialized.

---

### User Story 4 - Remote Desktop Assistance via Rust Agent (Priority: P2)

As a Support Agent, I want to request remote desktop control of the Requester's workstation, and as a Requester, I want to explicitly grant permission, watch the agent operate my desktop in real-time, and retain an instant kill-switch.

**Why this priority**: Differentiating technical capability that empowers support agents to resolve complex issues directly on customer machines without requiring third-party tools (TeamViewer/AnyDesk).

**Independent Test**: Can be tested by initiating a remote control request from the browser, running the Rust agent on the host, establishing a WebRTC DataChannel, and transmitting mouse/keyboard events.

**Acceptance Scenarios**:
1. **Given** an `IN_PROGRESS` ticket, **When** the Agent clicks "Request Remote Control", **Then** the Requester receives an explicit consent dialog with terms of access.
2. **Given** granted consent, **When** the Rust host connects via WebRTC signaling, **Then** screen frames are captured via `xcap` and streamed to the agent console, while mouse/keyboard inputs from the agent are safely forwarded to `enigo`.
3. **Given** an active remote session, **When** the Requester triggers the floating kill-switch (or closes the window), **Then** all remote input injection ceases immediately and the session terminates.

---

### User Story 5 - Ticket Resolution, CSAT Rating & Operational Analytics (Priority: P2)

As an Agent or Requester, I want to resolve the ticket, collect a mandatory 1-to-5 star satisfaction rating with feedback, and feed real-time analytics dashboards for Supervisors and Admins.

**Why this priority**: Closes the feedback loop, measures team efficiency, and validates SLA compliance.

**Independent Test**: Can be tested by marking a ticket resolved, submitting a customer rating, verifying transition to `CLOSED`, and inspecting aggregate analytics (TMA, avg wait time, CSAT distribution).

**Acceptance Scenarios**:
1. **Given** an `IN_PROGRESS` ticket, **When** the Agent clicks "Resolve Ticket", **Then** `resolvedAt` is set, `totalDurationSec` is calculated, and the Requester is prompted with the Rating Dialog.
2. **Given** a resolved ticket, **When** the Requester submits score (1 to 5) and feedback, **Then** the rating is saved, the ticket moves to `CLOSED`, and subsequent rating attempts are rejected with `error.ticket_already_rated`.
3. **Given** closed tickets, **When** a Supervisor views the Analytics dashboard, **Then** aggregate metrics (average queue wait time, total duration, CSAT score) update accurately in real time.

---

### Edge Cases

- **Agent Disconnection During Active Call/Remote Session**: If an agent socket disconnects, a 60-second grace period is initiated. If unrecovered, the ticket automatically pauses (`PAUSED`) and alerts the supervisor.
- **Concurrent Request Limit Exceeded**: When a customer company opens multiple browser tabs requesting support past their quota, tab requests past quota receive an informative banner and queue entry is withheld until an existing ticket closes.
- **Requester Inactivity After Resolution**: If a resolved ticket receives no rating within 24 hours, an automated scheduled job transitions it from `RESOLVED` to `CLOSED` with no rating.
- **Invalid Score Submission**: Submitting a rating score below 1 or above 5 throws `error.rating_score_must_be_between_1_and_5`.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST isolate all resources (`Users`, `ClientCompanies`, `Requesters`, `Queues`, `Tickets`, `Messages`, `Ratings`) by `organizationId`.
- **FR-002**: System MUST validate that an Organization is active and below its contracted capacity before processing tickets (`canAcceptNewTicket`).
- **FR-003**: System MUST enforce that each ClientCompany cannot exceed its `maxConcurrentSessions`.
- **FR-004**: System MUST generate an unforgeable sequential protocol number for each ticket upon creation.
- **FR-005**: System MUST execute the ticket claim operation inside an atomic database transaction with strict status verification (`WAITING_QUEUE` $\rightarrow$ `IN_PROGRESS`).
- **FR-006**: System MUST automatically compute `queueWaitTimeSec = claimedAt - enteredQueueAt` upon ticket claim.
- **FR-007**: System MUST automatically compute `totalDurationSec = closedAt - claimedAt` upon ticket resolution.
- **FR-008**: System MUST deliver chat messages (text, audio, image, video, screen capture) within isolated rooms (`ticket:{id}`) over WebSockets.
- **FR-009**: System MUST reject messages sent to tickets in `CLOSED` or `CANCELLED` states.
- **FR-010**: System MUST enforce explicit user consent before upgrading any session to Remote Control.
- **FR-011**: System MUST provide an unblockable, top-level kill-switch on the client host to terminate remote sessions instantaneously.
- **FR-012**: System MUST enforce rating score constraints between 1 and 5 stars.
- **FR-013**: System MUST prevent duplicate rating submissions on the same ticket.
- **FR-014**: System MUST transition tickets to the terminal `CLOSED` state immediately after rating submission.
- **FR-015**: System MUST emit domain events (`ticket.created`, `ticket.claimed`, `ticket.resolved`, `ticket.closed`, `chat.message_sent`) to decouple business logic from WebSocket gateways.

### Key Entities

- **Organization**: Represents the subscriber service desk company. Attributes: `id`, `name`, `documentNumber`, `maxConcurrentTickets`, `isActive`, `createdAt`, `updatedAt`.
- **User**: Internal support staff. Attributes: `id`, `organizationId`, `name`, `email`, `passwordHash`, `role` (`ADMIN`, `SUPERVISOR`, `AGENT`), `status` (`ONLINE`, `BUSY`, `AWAY`, `OFFLINE`).
- **ClientCompany**: Client corporate organization serviced by the support team. Attributes: `id`, `organizationId`, `corporateName`, `tradeName`, `documentNumber`, `maxConcurrentSessions`, `isActive`, `licenseExpiresAt`.
- **Requester**: End-user employee of a client company. Attributes: `id`, `clientCompanyId`, `name`, `email`, `phone`, `machineHostname`.
- **Queue**: Departmental triage queue. Attributes: `id`, `organizationId`, `name`, `priority`, `isActive`.
- **Ticket**: Lifecycle aggregate root. Attributes: `id`, `organizationId`, `protocolNumber`, `clientCompanyId`, `requesterId`, `queueId`, `agentId`, `status`, `activeChannel`, `enteredQueueAt`, `claimedAt`, `resolvedAt`, `closedAt`, `queueWaitTimeSec`, `totalDurationSec`.
- **Message**: Communication atom. Attributes: `id`, `ticketId`, `senderType`, `userId`, `requesterId`, `type`, `content`, `mediaUrl`, `mediaMetadata`, `createdAt`.
- **Rating**: Customer satisfaction feedback. Attributes: `id`, `ticketId`, `requesterId`, `agentId`, `score`, `feedback`, `createdAt`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001 (Zero Race Conditions)**: Under concurrent load testing of 50 simultaneous claim requests for a single ticket, exactly 1 succeeds and 49 receive immediate structured conflict errors.
- **SC-002 (Real-Time Propagation)**: Queue state updates and chat messages propagate to connected WebSockets in under 150ms.
- **SC-003 (SLA Accuracy)**: Queue wait time (`queueWaitTimeSec`) and total duration (`totalDurationSec`) are computed to sub-second precision upon transitions.
- **SC-004 (License Enforcement)**: 100% of ticket requests exceeding client company concurrent capacity are blocked before queue insertion.
- **SC-005 (Safety Compliance)**: 100% of remote control sessions require explicit affirmative consent and cease immediately when the kill-switch is triggered.
- **SC-006 (Test Coverage)**: 100% test pass rate across all domain entities, validation rules, and use-case integration tests.

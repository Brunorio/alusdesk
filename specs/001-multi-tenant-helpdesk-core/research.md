# Technical Research & Architecture Decisions

**Feature**: Multi-Tenant Corporate Helpdesk and Remote Control Core Platform  
**Branch**: `001-multi-tenant-helpdesk-core`  
**Date**: 2026-11-05  

---

### Decision 1: Multi-Tenancy Model & Actor Hierarchy
- **Decision**: Adopt `Organization` as the primary tenant aggregate root. All resources (`Users`, `ClientCompanies`, `Requesters`, `Queues`, `Tickets`, `Messages`, `Ratings`) are strictly partitioned by `organizationId`.
- **Rationale**: Eliminates semantic confusion between the provider operating the helpdesk platform and their client companies receiving support. Enforces strict logical and physical data isolation.
- **Alternatives Considered**:
  - *Single-tenant deployments*: Higher infrastructure cost and maintenance overhead.
  - *Naming as "Tenant"*: Overly infrastructure-centric rather than business domain expressive.

---

### Decision 2: Atomic Queue Claim & Race Condition Prevention
- **Decision**: Execute ticket claim operations inside serialized database transactions (`claimTicketAtomically`) utilizing optimistic locking or `SELECT ... FOR UPDATE` row locks with condition `status = 'WAITING_QUEUE'`.
- **Rationale**: Guarantees that when 50 agents simultaneously click "Claim" on the same inbound ticket, exactly one transaction succeeds and commits `IN_PROGRESS`, while 49 fail with `error.ticket_already_claimed_or_processed`.
- **Alternatives Considered**:
  - *In-memory Redis lock*: Introduces distributed lock expiration risks if the backend node crashes before state persistence.
  - *Application-level mutex*: Fails across multi-replica or clustered backend deployments.

---

### Decision 3: Real-Time Event Architecture & Decoupling
- **Decision**: Decouple application use cases from Socket.io instances via NestJS `EventEmitter2`. Gateways listen for local/distributed events (`ticket.created`, `ticket.claimed`, `chat.message_sent`) and handle room broadcasts.
- **Rationale**: Keeps use cases strictly focused on business logic without dependency on network socket primitives. Allows easy addition of audit logging, webhooks, or push notifications without altering core use cases.
- **Alternatives Considered**:
  - *Injecting Socket.io Server directly into Use Cases*: Violates Single Responsibility and complicates unit testing.

---

### Decision 4: Remote Control Video & Input Protocol
- **Decision**: Pure Rust daemon utilizing `xcap` for screen capture and `enigo` for input injection, communicating via WebRTC DataChannels for low-latency binary input serialization and MediaStream for video frames.
- **Rationale**: Rust provides native OS API access with zero GC pauses, sub-10ms frame capture, and robust memory safety.
- **Alternatives Considered**:
  - *Electron-based host agent*: High memory footprint (>200MB) and poor capture performance compared to native Rust.
  - *VNC/RDP wrapping*: Heavyweight, difficult to negotiate NAT/firewalls, lacks dynamic browser embedding.

---

### Decision 5: Omnichannel Media Storage & Delivery
- **Decision**: In-browser recording via Web MediaStream Recording API (WebM/Opus for audio, WebM/VP8/VP9 for screen video). Media is streamed to S3-compatible storage (MinIO/AWS S3) and referenced via signed URL in `Message.mediaUrl`.
- **Rationale**: Offloads binary blob storage from PostgreSQL while preserving metadata (`durationSec`, `width`, `height`, `sizeBytes`) in structured JSON columns.

# AI AGENT CODING STANDARDS & ARCHITECTURAL GUIDELINES (AGENTS.md)

This document establishes the mandatory architectural patterns, engineering rules, conventions, and design standards for the **AlusDesk** project.

All AI coding assistants and developers MUST strictly follow this guide when reading, creating, modifying, refactoring, or testing code in this workspace.

---

## 1. GENERAL PRINCIPLES & GOLDEN RULES

### 1.1. Zero Unnecessary Comments (Self-Documenting Code)
- **Do not include redundant or obvious comments**. The code must be expressive, clean, and self-explanatory.
- Avoid obvious comments such as:
  - `// Get id`
  - `// Constructor`
  - `// Execute use case`
  - `// Save entity to database`
  - `// Handle socket message`
- Comments are strictly reserved for:
  - Complex domain formulas or critical time calculations (e.g., SLA elapsed formulas).
  - WebRTC signaling renegotiation workarounds or low-level binary protocol conversions for the Rust agent.
  - Legal or regulatory compliance notes explicitly required by customer privacy rules.

### 1.2. 100% English for Code Artifacts
- **All code must be written in American English (`en-US`)**.
- This applies to:
  - Class names, interfaces, types, enums, functions, methods, variables, and parameters.
  - File names, directories, git commits, and code symbols.
- **Exception**: Specific user-facing strings or local legal identifiers (e.g., `CNPJ`, `CPF`) where translating would cause semantic ambiguity, but structural naming, verbs, and variables must remain in English (e.g., `documentNumber`, `taxId`).

### 1.3. Internationalization (i18n)
- Never hardcode user-facing strings or localized error messages directly in domain logic, use cases, or core services.
- **Backend & Core**: Use `@core/i18n` with keys defined in `core/src/i18n/locales/` (e.g., `i18n.t('error.ticket_already_claimed')`).
- **Frontend**: Use locale translation dictionaries or structured constants.

### 1.4. Mandatory Database Migrations for Any Schema Change
- **Whenever an entity, model, table schema, or repository contract changes, a database migration MUST be created**.
- Never alter model fields without writing the corresponding migration.
- Migration files are stored under `core/migrations/`.
- **Naming Convention**: `YYYYMMDDHHMMSS-<descriptive-action>.sql`.
  - Example: `20261105150000-create-tickets-table.sql`

---

## 2. MONOREPO STRUCTURE & BOUNDARIES

The codebase is organized into four main packages:

```
alusdesk/
├── core/         # Pure Domain rules (DDD), entities, value objects, use-case interfaces & DB models/migrations
├── backend/      # NestJS API, controllers, services, use cases, Socket.io gateways & WebRTC signaling
├── frontend/     # React 19 + Vite SPA, views, custom hooks, standardized inputs & request classes
└── agent/        # Rust host daemon for remote screen capture (xcap) and input injection (enigo)
```

---

## 3. CORE PACKAGE (`core/`)

The `core` package houses the Domain-Driven Design (DDD) domain rules and database infrastructure. It is divided strictly into `domain` and `infra`.

### 3.1. Directory Layout per Module
Every module in `core/src/modules/<context>/domain/<entity>/` follows this structure:

```
core/src/modules/<context>/domain/<entity>/
├── domain/
│   ├── <entity>.ts               # Domain Entity (extends Entity)
│   ├── <entity>.id.ts            # Strongly-typed Identifier Value Object (extends Uuid)
│   ├── <entity>.input.ts         # Input DTO interface (extends Input)
│   ├── <entity>.output.ts        # Output DTO interface (extends Output)
│   ├── <entity>.rules.ts         # Business validation rules (extends EntityRules)
│   ├── <entity>.repository.ts    # Repository interface (extends ISearchableRepository)
│   └── <entity>.spec.ts          # Unit tests for domain entity & business validation
└── infra/
    └── database/
        ├── <entity>.model.ts        # Persistence Model & Repository implementation
        ├── <entity>-model.mapper.ts # Model <-> Entity mapper
        └── <entity>.model.spec.ts   # Repository/model integration tests
```

### 3.2. Domain Rules
1. **Domain Entities (`<entity>.ts`)**:
   - Must extend `Entity` (from `@core/domain/entity`).
   - All state fields must be `private` or `protected` to preserve encapsulation.
   - Must implement `getId(): <EntityId>` and `getOutput(): <EntityOutput>`.
   - Invariants must be enforced inside the entity constructor via `this.validate(new <EntityRules>(this))`.
2. **Identifier Value Objects (`<entity>.id.ts`)**:
   - Must extend `Uuid` (from `@core/domain/value-object/uuid.vo`).
3. **Validation Rules (`<entity>.rules.ts`)**:
   - Must extend `EntityRules`.
   - Use `class-validator` decorators (`@IsNotEmpty()`, `@IsString()`, `@Min()`, etc.) to enforce field invariants.
4. **Repository Interfaces (`<entity>.repository.ts`)**:
   - Must extend `ISearchableRepository<Entity, EntityId, SearchResult>`.
   - Never import ORM or framework classes in the domain layer.

---

## 4. BACKEND PACKAGE (`backend/`)

The backend is built with NestJS and follows a clean 4-tier pipeline:
**Controller -> Service -> Use Case -> Repository**

### 4.1. Directory Structure
```
backend/src/
├── routes/<context>/<entity>/
│   ├── <entity>.controller.ts    # HTTP Controller (thin routing & parameter validation)
│   ├── <entity>.service.ts       # Service orchestrating use cases
│   ├── <entity>.service.spec.ts  # Service unit/integration tests
│   ├── <entity>.module.ts        # NestJS feature module
│   └── input/                    # Controller input DTOs with class-validator
├── use-cases/<context>/<entity>/<action>/
│   ├── <action>.use-case.ts      # Application business logic (implements IUseCase)
│   └── <action>.use-case.spec.ts # Mandatory use case unit/integration test
└── realtime/                     # Socket.io Gateways and WebRTC Signaling
    ├── queue/
    │   └── queue.gateway.ts
    └── chat/
        └── chat.gateway.ts
```

### 4.2. Controllers
- **Controllers must remain thin**: Only handle HTTP routing, query/body parameter parsing, and authorization guards (`@AllowedFor(...)`).
- Do not place application logic, database access, or transaction orchestration inside controllers.
- *Note:* Swagger annotations are omitted at this stage as per project specification.

### 4.3. Services
- Annotated with `@Injectable()`.
- Act as a facade for the controller, injecting and executing the appropriate Use Cases.

### 4.4. Use Cases
- Located in `backend/src/use-cases/<context>/<entity>/<action>/`.
- Must implement `IUseCase<Input, Output>` (from `@core/use-cases/use-case.interface`).
- Inject repositories via tokens: `@Inject('I<Entity>Repository') private readonly repository: I<Entity>Repository`.
- Single responsibility: Each use case class represents exactly one business action (e.g., `CreateTicketUseCase`, `ClaimTicketUseCase`, `SubmitRatingUseCase`).
- Throw translated exceptions using `i18n.t(...)` (e.g., `throw new Error(i18n.t('error.ticket_not_found'))`).

### 4.5. Concurrency and Atomic Queue Claims
- When an agent claims a ticket from the queue, it MUST be wrapped in an atomic database transaction with state verification (`WAITING_QUEUE` -> `IN_PROGRESS`) to prevent multiple agents claiming the same ticket concurrently.
- Trigger real-time gateway broadcasts using NestJS `EventEmitter2` (`this.eventEmitter.emit('ticket.claimed', ...)`) rather than calling Socket instances directly from Use Cases.

### 4.6. Mandatory Backend Testing
- **Every Use Case and Service MUST have tests**.
- Verify successful execution, state transitions, duplicate prevention, and error scenarios.

---

## 5. FRONTEND PACKAGE (`frontend/`)

The frontend is built with React 19, Vite, Tailwind CSS, Radix UI, Zustand, and React Router.

### 5.1. Directory Structure per View
Views are located in `frontend/src/views/<context>/<entity>/` (e.g., `frontend/src/views/helpdesk/queue/`):

```
frontend/src/views/<context>/<entity>/
├── index.tsx                     # Listing view (using ResponsiveData)
├── hooks/
│   └── use<Entity>.ts            # Custom hook for listing, search, pagination, realtime updates
├── form/
│   ├── index.tsx                 # Form page (Create/Edit)
│   ├── hooks/
│   │   └── useSave<Entity>.ts    # Custom hook for form state, validation, save
│   └── <SubEntity>Dialog.tsx     # Isolated sub-dialogs/modals
└── <Entity>Dialog/               # Optional modal-based quick view/create
```

### 5.2. Mandatory Custom Hooks Rule
- **Never embed business logic, data fetching, or complex state management directly inside JSX view components**.
- All stateful behavior must be extracted into custom hooks:
  - Listing views use `use<Entity>()`:
    - Handles pagination, sorting, search triggering, and delete confirmation with toasts.
    - Subscribes to real-time events when applicable.
  - Form views use `useSave<Entity>()`:
    - Manages entity input state and validation errors.
    - Coordinates API requests (`Create<Entity>Request`, `Update<Entity>Request`).
    - Dispatches user feedback using toasts.

### 5.3. Isolated Components & Single Responsibility
- **Every component must have a single, well-defined responsibility**.
- View pages (`index.tsx`, `form/index.tsx`) serve strictly as compositional layouts using:
  - `<PageHeader title="..." subtitle="..." actions={[...]} />`
  - `<PageContent className="w-full">`
  - `<ResponsiveData searchResult={...} onChangeSearchParams={...} mobile={...} desktop={...} />`
- **Mandatory Use of `useDialog` for Modals/Dialogs**: Never instantiate standalone `<Dialog>` or raw Radix primitive components directly inside views. All dialogs must be opened through the global `useDialog` hook.
- **Dialog Backdrop Dismissal Control (`disableBackdropClose`)**: Whenever a dialog should not be dismissed by clicking outside on the backdrop (e.g., forms, remote control permission requests, rating modal), set `disableBackdropClose: true` in `useDialog.openDialog(content, { disableBackdropClose: true })`.

### 5.4. Mandatory Use of `ResponsiveData` for Tables and Data Displays
- **Whenever tabular or listing data is rendered, developers and AI agents MUST use the `<ResponsiveData>` component rather than raw `<table>` elements.**
- This guarantees unified, responsive presentation across desktop (sortable columns, actions, pagination) and mobile (card/grid layout) devices.

### 5.5. Form Page Layouts (Full-Width & Replicated Save Action)
- **Full-Width Page Utilization**: Form and configuration views must utilize the full width of `<PageContent>` (`w-full`) rather than artificially restricting the container to narrow max-widths.
- **Dual Save Buttons (Top & Bottom)**: Every form page MUST provide a save action in BOTH locations:
  1. **Top**: Inside `<PageHeader actions={[<Button ...>Save</Button>]} />`.
  2. **Bottom**: Replicated at the bottom of the form content (`<div className="flex justify-end pt-4 border-t"><Button ...>Save</Button></div>`).

### 5.6. Mandatory Standard Input Components (Zero Raw HTML `<input>`, `<select>`, `<textarea>`)
- **Never use native HTML input primitives (`<input>`, `<select>`, `<textarea>`) anywhere in the application**.
- Always use the standardized input components located in `frontend/src/components/`:
  - `StandardInput`: General text, numbers, search inputs.
  - `StandardSelect`: Dropdown selection menus.
  - `StandardTextarea`: Multiline text input and chat messages.
  - `DatePickerInput`: Dates and date-time pickers.
  - `DocumentInput`: Document numbers (CPF/CNPJ) with automatic masking.
  - `PhoneNumberInput`: Phone numbers with formatting masks.
  - `PasswordInput`: Passwords with visibility toggle.
  - `StandardSwitch`: Boolean toggles and setting switches.

### 5.7. Request Layer (`frontend/src/requests/`)
- All HTTP calls must use dedicated request classes located in `frontend/src/requests/<context>/<entity>/`.
- Classes must inherit from the base request classes (`CreateRequest<Input, Output>`, `UpdateRequest<Input, Output>`, `DeleteRequest`, `SearchRequest<Output>`, `GetRequest<Output>`).
- Never use raw `axios` or `fetch` calls directly inside views or hooks.

---

## 6. REMOTE AGENT MODULE (`agent/` - RUST)

- Developed in pure **Rust** with memory safety and zero unnecessary allocations.
- Screen capture via `xcap` crate or native OS displays.
- Mouse and keyboard event synthesizing via `enigo` crate.
- WebSocket / WebRTC connection managed via asynchronous `tokio` runtime.
- Remote control events received through WebRTC DataChannels must be validated and sanitized before being forwarded to `enigo` to prevent unauthorized keystrokes or host system compromise.

---

## 7. CODE GENERATION CHECKLIST FOR AI AGENTS

Before finalizing any generated code or modification, verify:

1. [ ] **Self-Documenting**: Are there any unnecessary or obvious comments? If so, remove them.
2. [ ] **English Only**: Are all variables, functions, types, and files named in English?
3. [ ] **i18n Applied**: Are user-facing error and notification messages referenced via `i18n.t(...)` rather than hardcoded?
4. [ ] **Migrations Created**: Did any repository, model, or schema change? If yes, is a timestamped migration included in `core/migrations/`?
5. [ ] **Core Architecture**:
   - Is domain pure and decoupled in `domain/`?
   - Is persistence code restricted to `infra/`?
   - Does the entity extend `Entity` and validate invariants via `EntityRules`?
6. [ ] **Backend Architecture**:
   - Does the flow strictly follow `Controller -> Service -> Use Case -> Repository`?
   - Is the controller thin with proper authorization guards?
   - Does the use case implement `IUseCase` and inject the repository via token?
   - Are comprehensive unit/integration tests written for the use case and service?
7. [ ] **Frontend Architecture**:
   - Is all state and business logic inside dedicated custom hooks (`use<Entity>`, `useSave<Entity>`)?
   - Are components isolated with a single responsibility?
   - Is tabular or list data rendered using `<ResponsiveData>` rather than raw `<table>` elements?
   - Does data interaction go through request classes extending base request types?
   - Are form pages utilizing full width (`w-full`) with Save button duplicated (top and bottom)?
   - Are modals displayed using `useDialog` with `disableBackdropClose: true` for forms/critical actions?
   - Are all inputs using standard components (`StandardInput`, `StandardSelect`, `StandardTextarea`, etc.) instead of raw HTML elements?


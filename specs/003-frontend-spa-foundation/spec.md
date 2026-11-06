# Feature Specification: Frontend SPA Foundation with React 19, Vite, and Standardized UI Architecture

**Feature Branch**: `003-frontend-spa-foundation`  
**Created**: 2026-11-06  
**Status**: Ready for Planning  
**Input**: Frontend single-page application using React 19, Vite, Tailwind CSS, Radix UI, Zustand, React Router, standardized input components (zero raw HTML inputs), `ResponsiveData` table abstraction, `useDialog` modal manager, and typed request classes with opaque token authentication.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Application Shell & Architectural Core Layout (Priority: P1) 🎯 MVP

As a Platform Operator, Agent, or Admin, I want to load the AlusDesk web application and navigate through a clean, responsive layout shell so that I have access to helpdesk views, queues, configuration, and session controls.

**Why this priority**: Foundational entrypoint. Without the Vite setup, routing tree, and application layout shell, no views or features can be accessed.

**Independent Test**: Can be tested independently by running `npm run dev -w @alusdesk/frontend`, navigating to the app, and verifying header, sidebar, full-width content area (`<PageContent className="w-full">`), and responsive navigation.

**Acceptance Scenarios**:
1. **Given** a user opening the application root, **When** loading the app, **Then** the application shell renders with topbar, collapsible sidebar, and full-width content canvas.
2. **Given** a screen resize from desktop to mobile (viewport < 768px), **When** viewed on mobile, **Then** the sidebar collapses into a drawer/hamburger menu without breaking layout.
3. **Given** an unauthenticated state, **When** visiting protected routes, **Then** the router redirects the user to the `/login` route.

---

### User Story 2 - Standardized Input Library & Dialog Provider (Priority: P1)

As a Frontend Developer and User, I want all user input and modal interactions to strictly use standardized, accessible components so that the application maintains 100% visual and behavioral consistency with zero raw HTML input primitives.

**Why this priority**: Mandatory engineering standard in `AGENTS.md` (5.3 & 5.6). Guarantees unified validation, masks (CPF/CNPJ, phone), accessibility, and backdrop dismissal prevention for critical actions.

**Independent Test**: Can be tested by rendering each standard component in isolation, verifying automatic formatting masks, error state styling, and modal backdrop click prevention (`disableBackdropClose: true`).

**Acceptance Scenarios**:
1. **Given** form fields, **When** rendered, **Then** they use `StandardInput`, `StandardSelect`, `StandardTextarea`, `PasswordInput`, `DocumentInput`, `PhoneNumberInput`, `DatePickerInput`, or `StandardSwitch` (zero raw `<input>`, `<select>`, `<textarea>`).
2. **Given** `DocumentInput`, **When** the user types digits, **Then** appropriate masking (CPF/CNPJ) is applied dynamically.
3. **Given** `PasswordInput`, **When** clicking the eye icon, **Then** password visibility toggles between masked and plaintext.
4. **Given** a modal opened via `useDialog` with `{ disableBackdropClose: true }`, **When** the user clicks on the backdrop overlay, **Then** the dialog remains open.

---

### User Story 3 - Base Request Classes & Opaque Token HTTP Layer (Priority: P1)

As the Frontend Application, I want all HTTP communication to flow through typed Request classes that automatically attach the opaque UUID token so that API calls are strongly typed and authenticated.

**Why this priority**: Required data communication layer (`AGENTS.md` 5.7). Eliminates raw `fetch`/`axios` calls inside views and hooks while enforcing the opaque token pattern in Redis.

**Independent Test**: Can be tested by issuing an authenticated API request via a class extending `GetRequest` or `SearchRequest`; verify `Authorization: Bearer <uuid>` header is attached and 401 responses trigger logout/redirect.

**Acceptance Scenarios**:
1. **Given** an active session with an opaque UUID token, **When** a request class (`SearchRequest`, `GetRequest`, `CreateRequest`, `UpdateRequest`, `DeleteRequest`) executes, **Then** header `Authorization: Bearer <uuid>` is attached automatically.
2. **Given** an API response returning 401 Unauthorized, **When** intercepted, **Then** the session is cleared and the user is redirected to `/login`.
3. **Given** an API request failure (400/500), **When** an error occurs, **Then** a toast notification is dispatched with user feedback.

---

### User Story 4 - ResponsiveData Tabular & Listing Component (Priority: P1)

As a Support Supervisor or Admin viewing operational records (organizations, users, tickets), I want data presented through `<ResponsiveData>` so that desktop view displays sortable tabular columns while mobile view automatically shifts to touch-friendly cards.

**Why this priority**: Mandatory table display standard (`AGENTS.md` 5.4). Guarantees zero raw `<table>` elements and unified responsive pagination and sorting across the platform.

**Independent Test**: Can be tested by feeding mock `SearchResult` data into `<ResponsiveData>`; desktop viewport displays table columns with sorting and pagination, while mobile viewport renders cards.

**Acceptance Scenarios**:
1. **Given** a list of items, **When** rendered on desktop, **Then** `<ResponsiveData>` displays sortable column headers, pagination controls, and action buttons.
2. **Given** the same list on a mobile viewport (< 768px), **When** rendered, **Then** `<ResponsiveData>` renders the provided `mobile` card template with touch-friendly spacing.
3. **Given** page or sorting changes, **When** triggered by the user, **Then** `onChangeSearchParams` callback fires with updated `SearchParams`.

---

### User Story 5 - Authentication Flow & Custom Hooks Pattern (Priority: P1)

As a Support Staff member or Administrator, I want to log in using my email and password via a dedicated login view using custom hooks (`useLogin`) so that my credentials exchange for an opaque token and establish my authenticated session.

**Why this priority**: Completes the end-to-end integration with the backend `GenerateAndSaveTokenUseCase` and `TenantAuthMiddleware`.

**Independent Test**: Can be tested by filling the login form, submitting credentials, verifying the opaque UUID token is stored in localStorage/Zustand, and navigating to the dashboard.

**Acceptance Scenarios**:
1. **Given** the `/login` view, **When** the user inputs valid credentials, **Then** `useLogin` executes `AuthRequest`, receives the opaque UUID token, saves it to Zustand/localStorage, and redirects to the dashboard.
2. **Given** invalid credentials, **When** login fails, **Then** error message is shown via toast without navigating.
3. **Given** an authenticated user, **When** clicking "Logout", **Then** the token is revoked and the session is cleared.

---

## Edge Cases

- **Session Expiry During Active Form**: If a user is filling a form and their token expires (Redis TTL ends), the request layer must prompt the user or save their draft state to sessionStorage before redirecting.
- **Slow Network / Offline State**: Request classes must handle network failures gracefully, showing retry buttons or non-blocking toasts.
- **Invalid Token in LocalStorage**: If the stored UUID is not recognized by Redis (e.g. server restarted or expired), the app must immediately clear local storage and route to `/login`.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST initialize `@alusdesk/frontend` using React 19, Vite, Tailwind CSS 4, Radix UI, Zustand, and React Router.
- **FR-002**: System MUST implement `<PageHeader>` and `<PageContent className="w-full">` compositional layout components.
- **FR-003**: System MUST provide the mandatory standard input suite in `frontend/src/components/`: `StandardInput`, `StandardSelect`, `StandardTextarea`, `DatePickerInput`, `DocumentInput`, `PhoneNumberInput`, `PasswordInput`, `StandardSwitch`. Raw HTML `<input>`, `<select>`, `<textarea>` primitives are strictly prohibited.
- **FR-004**: System MUST implement `useDialog` hook with support for `{ disableBackdropClose: true }` for modals.
- **FR-005**: System MUST implement `<ResponsiveData>` component displaying sortable columns on desktop and cards on mobile. Raw `<table>` elements are strictly prohibited in views.
- **FR-006**: System MUST implement base request classes in `frontend/src/requests/`: `BaseRequest`, `GetRequest`, `SearchRequest`, `CreateRequest`, `UpdateRequest`, `DeleteRequest`.
- **FR-007**: System MUST provide Zustand auth store storing user state and opaque UUID token with localStorage persistence.
- **FR-008**: System MUST separate all business logic and API orchestration into custom hooks (`use<Entity>`, `useSave<Entity>`).

---

## Success Criteria *(mandatory)*

- **SC-001**: 100% of input controls across the application utilize standardized input components.
- **SC-002**: Zero raw `<table>` elements used for listings; 100% powered by `<ResponsiveData>`.
- **SC-003**: Frontend builds cleanly with `npm run build -w @alusdesk/frontend` with zero TypeScript or Vite errors.
- **SC-004**: End-to-end login flow successfully exchanges credentials for an opaque token and routes to protected dashboard.

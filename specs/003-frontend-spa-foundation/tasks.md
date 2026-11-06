# Tasks: Frontend SPA Foundation with React 19, Vite, and Standardized UI Architecture

**Input**: Design documents from `/specs/003-frontend-spa-foundation/` (`spec.md`, `plan.md`, `research.md`)  
**Branch**: `003-frontend-spa-foundation`  
**Prerequisites**: Monorepo workspaces (`core/`, `backend/`, `frontend/`)

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel without blocking dependencies
- **[Story]**: User Story label (`US1`, `US2`, `US3`, `US4`, `US5`)

---

## Phase 1: Setup & Project Initialization

**Purpose**: Initialize the `@alusdesk/frontend` package with React 19, Vite, Tailwind CSS, TypeScript, and pnpm workspace integration.

- [ ] T001 Initialize `frontend/package.json`, `vite.config.ts`, `tsconfig.json`, and root `index.html`.
- [ ] T002 Install React 19, React DOM, React Router 6/7, Tailwind CSS, Lucide React, and Radix UI primitives.
- [ ] T003 Configure Tailwind CSS stylesheet in `frontend/src/index.css` and main entrypoint in `frontend/src/main.tsx`.

---

## Phase 2: User Story 1 - Application Shell & Core Layout (Priority: P1) 🎯 MVP

**Goal**: Deliver responsive application layout with topbar, collapsible sidebar, page header, and full-width content area.  
**Independent Test**: Load `/` and navigate through the app shell; verify responsive breakpoint transitions and full-width container.

- [ ] T004 [P] [US1] Implement `<PageHeader>` in `frontend/src/components/layout/PageHeader.tsx` supporting title, subtitle, breadcrumbs, and actions.
- [ ] T005 [P] [US1] Implement `<PageContent>` in `frontend/src/components/layout/PageContent.tsx` enforcing `w-full`.
- [ ] T006 [US1] Implement `<Sidebar>` and `<AppLayout>` in `frontend/src/components/layout/AppLayout.tsx`.
- [ ] T007 [US1] Configure client-side routing in `frontend/src/routes/index.tsx` with protected route guards.

---

## Phase 3: User Story 2 - Standardized Input Library & Dialog Provider (Priority: P1)

**Goal**: Deliver the mandatory standard input components (zero raw HTML inputs) and global dialog manager.  
**Independent Test**: Render each standard input and dialog; verify masks, visibility toggles, and backdrop dismissal prevention (`disableBackdropClose: true`).

- [ ] T008 [P] [US2] Implement `StandardInput` and `PasswordInput` (with toggle visibility) in `frontend/src/components/inputs/`.
- [ ] T009 [P] [US2] Implement `DocumentInput` (CPF/CNPJ dynamic mask) and `PhoneNumberInput` (phone mask) in `frontend/src/components/inputs/`.
- [ ] T010 [P] [US2] Implement `StandardSelect`, `StandardTextarea`, `DatePickerInput`, and `StandardSwitch` in `frontend/src/components/inputs/`.
- [ ] T011 [US2] Implement global `useDialog` hook and `DialogProvider` in `frontend/src/components/dialog/` with `disableBackdropClose` support.

---

## Phase 4: User Story 3 - Base Request Classes & Opaque Token HTTP Layer (Priority: P1)

**Goal**: Create strongly-typed HTTP request hierarchy with automatic `Authorization: Bearer <uuid>` attachment and 401 handling.  
**Independent Test**: Execute mock request using `GetRequest`; verify token header is attached and 401 triggers session eviction.

- [ ] T012 [P] [US3] Implement `BaseRequest` in `frontend/src/requests/base/base.request.ts` wrapping fetch with token injection and error interceptors.
- [ ] T013 [P] [US3] Implement `GetRequest`, `SearchRequest`, `CreateRequest`, `UpdateRequest`, and `DeleteRequest` in `frontend/src/requests/base/`.
- [ ] T014 [US3] Implement Toast notification system in `frontend/src/components/feedback/Toast.tsx` for error and success alerts.

---

## Phase 5: User Story 4 - ResponsiveData Component (Priority: P1)

**Goal**: Build unified tabular listing component ensuring zero raw `<table>` elements in views.  
**Independent Test**: Feed `SearchResult` data into `<ResponsiveData>`; verify desktop columns sort and paginate, and mobile renders card templates.

- [ ] T015 [US4] Implement `<ResponsiveData>` component in `frontend/src/components/data/ResponsiveData.tsx` with desktop table and mobile card renderers.
- [ ] T016 [US4] Implement pagination and column sorting controls inside `<ResponsiveData>`.

---

## Phase 6: User Story 5 - Authentication Flow & Custom Hooks Pattern (Priority: P1)

**Goal**: Provide user authentication view and Zustand session management.  
**Independent Test**: Log in with credentials; verify opaque token is saved and app routes to dashboard.

- [ ] T017 [P] [US5] Implement Zustand auth store in `frontend/src/store/auth.store.ts` with localStorage persistence.
- [ ] T018 [US5] Implement `AuthRequest` in `frontend/src/requests/auth/auth.request.ts`.
- [ ] T019 [US5] Implement `useLogin` custom hook in `frontend/src/views/auth/login/hooks/useLogin.ts`.
- [ ] T020 [US5] Implement `/login` page in `frontend/src/views/auth/login/index.tsx` using `StandardInput` and `PasswordInput`.
- [ ] T021 [US5] Implement placeholder landing dashboard in `frontend/src/views/dashboard/index.tsx`.

---

## Phase 7: Polish & Verification

- [ ] T022 Add npm scripts in root `package.json` to run frontend (`npm run dev -w @alusdesk/frontend`, `npm run build -w @alusdesk/frontend`).
- [ ] T023 Verify frontend build compiles with zero errors (`npm run build -w @alusdesk/frontend`).
- [ ] T024 Run full test suite pass verification (`npm run test --workspaces`).

# Technical Research & Architecture Decisions

**Feature**: Frontend SPA Foundation with React 19, Vite, and Standardized UI Architecture  
**Branch**: `003-frontend-spa-foundation`  
**Date**: 2026-11-06  

---

### Decision 1: Framework, Bundler & Styling
- **Decision**: Adopt **React 19** with **Vite**, **Tailwind CSS**, and **Radix UI** primitives.
- **Rationale**: Vite provides instant HMR (<50ms) and optimized production rollups. Radix UI primitives guarantee full WAI-ARIA keyboard and screen reader accessibility without prescriptive styling, allowing Tailwind CSS to provide a cohesive corporate design system.
- **Alternatives Considered**:
  - *Next.js*: Unnecessary SSR complexity and hosting overhead for an enterprise internal SPA behind authentication.
  - *Create React App*: Deprecated, sluggish build times.

---

### Decision 2: Zero Raw HTML Input Primitives & Strict Design System
- **Decision**: All views and forms MUST strictly use the standardized input components located in `frontend/src/components/`:
  - `StandardInput`: Text, search, numbers.
  - `StandardSelect`: Accessible select dropdown.
  - `StandardTextarea`: Multiline messages and notes.
  - `PasswordInput`: Passwords with visibility toggle.
  - `DocumentInput`: CPF/CNPJ formatting mask.
  - `PhoneNumberInput`: Phone formatting mask.
  - `DatePickerInput`: Dates and timestamps.
  - `StandardSwitch`: Boolean toggles.
- **Rationale**: Mandated in `AGENTS.md` (5.6). Prevents visual regressions, guarantees consistent focus/error states, and centralizes validation feedback.

---

### Decision 3: Tabular Display via `<ResponsiveData>`
- **Decision**: Mandate `<ResponsiveData>` across all data tables and listings. Zero raw `<table>` elements permitted in view files.
- **Rationale**: Ensures responsive parity between desktop (sortable columns, pagination controls) and mobile devices (card layout with touch-friendly spacing).

---

### Decision 4: Central Modal Management (`useDialog`)
- **Decision**: All modals and confirmation dialogs must be controlled via the global `useDialog` store with support for `disableBackdropClose: true`.
- **Rationale**: Mandated in `AGENTS.md` (5.3). Prevents accidental dismissal of unsaved forms and critical confirmation prompts when clicking outside on the backdrop.

---

### Decision 5: Base Request Hierarchy & Opaque Token Authentication
- **Decision**: Implement base request classes (`BaseRequest`, `GetRequest`, `SearchRequest`, `CreateRequest`, `UpdateRequest`, `DeleteRequest`) using native `fetch` or lightweight client that automatically injects `Authorization: Bearer <opaqueUuid>` and handles 401 token expiration.
- **Rationale**: Enforces DDD request boundaries, prevents raw `fetch`/`axios` calls from leaking into view components, and aligns with the backend Redis opaque token pattern.


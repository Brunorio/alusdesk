# Implementation Plan: Frontend SPA Foundation with React 19, Vite, and Standardized UI Architecture

**Branch**: `003-frontend-spa-foundation` | **Date**: 2026-11-06 | **Spec**: [Feature Specification](spec.md)  
**Input**: Frontend single-page application using React 19, Vite, Tailwind CSS, Radix UI, Zustand, React Router, standardized input components (zero raw HTML inputs), `ResponsiveData` table abstraction, `useDialog` modal manager, and typed request classes with opaque token authentication.

## Summary

This feature establishes the frontend single-page application (SPA) foundation for the AlusDesk platform. It initializes the `frontend/` workspace with React 19 and Vite, creates the core responsive application shell, delivers the mandatory standardized input library, provides the global modal manager (`useDialog`), standardizes table displays through `<ResponsiveData>`, and implements the strongly-typed base request hierarchy connecting to the backend via opaque UUID tokens.

## Technical Context

**Language/Version**: TypeScript 5.4+ (React 19, Vite 5+)  
**Primary Dependencies**:
- Core: `react`, `react-dom`, `react-router-dom`, `zustand`, `lucide-react`
- UI & Styling: `tailwindcss`, `@tailwindcss/vite`, `@radix-ui/react-*`, `clsx`, `tailwind-merge`
**Target Platform**: Modern Evergreen Desktop & Mobile Browsers (Chrome, Edge, Firefox, Safari)  
**Project Type**: SPA within Monorepo (`frontend/`)  
**Constraints**:
- Strictly zero raw HTML `<input>`, `<select>`, `<textarea>` primitives anywhere in views.
- Strictly zero raw `<table>` elements in views (all listings use `<ResponsiveData>`).
- All modals opened via `useDialog` with `disableBackdropClose: true` for forms.
- Full-width page layout utilization (`<PageContent className="w-full">`) with top & bottom duplicated save buttons on form pages.
- Zero raw `fetch`/`axios` calls inside views; all API interaction mediated via request classes extending base request types.

## Constitution & Engineering Guidelines Check

- [x] **Zero Obvious Comments**: Clean self-documenting code.
- [x] **100% English**: All symbol names, properties, hooks, and files in American English.
- [x] **Custom Hooks Isolation**: Business logic and state extracted into `use<Entity>` and `useSave<Entity>`.
- [x] **Component Isolation**: Compositional layout utilizing `<PageHeader>`, `<PageContent>`, and `<ResponsiveData>`.
- [x] **Standard Input Library**: Enforced across all form views.

## Project Structure

```text
alusdesk/
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── PageHeader.tsx                  # Standard page header with breadcrumb and actions
    │   │   │   ├── PageContent.tsx                 # Full-width content wrapper (w-full)
    │   │   │   ├── AppLayout.tsx                   # Topbar + collapsible sidebar shell
    │   │   │   └── Sidebar.tsx
    │   │   ├── inputs/
    │   │   │   ├── StandardInput.tsx               # General text, number, search input
    │   │   │   ├── StandardSelect.tsx              # Radix UI select dropdown
    │   │   │   ├── StandardTextarea.tsx            # Multiline text input
    │   │   │   ├── PasswordInput.tsx               # Password with eye toggle
    │   │   │   ├── DocumentInput.tsx               # CPF/CNPJ auto-masking input
    │   │   │   ├── PhoneNumberInput.tsx            # Phone auto-masking input
    │   │   │   ├── DatePickerInput.tsx             # Date picker input
    │   │   │   └── StandardSwitch.tsx              # Boolean toggle switch
    │   │   ├── dialog/
    │   │   │   ├── DialogProvider.tsx              # Global modal container
    │   │   │   └── useDialog.ts                    # Global dialog hook with disableBackdropClose
    │   │   ├── data/
    │   │   │   └── ResponsiveData.tsx              # Desktop table + Mobile card layout
    │   │   └── feedback/
    │   │       └── Toast.tsx                       # User feedback notifications
    │   │
    │   ├── requests/
    │   │   ├── base/
    │   │   │   ├── base.request.ts                 # Base HTTP client with Bearer <uuid> injection
    │   │   │   ├── get.request.ts
    │   │   │   ├── search.request.ts
    │   │   │   ├── create.request.ts
    │   │   │   ├── update.request.ts
    │   │   │   └── delete.request.ts
    │   │   └── auth/
    │   │       └── auth.request.ts
    │   │
    │   ├── store/
    │   │   └── auth.store.ts                       # Zustand auth session store
    │   │
    │   └── views/
    │       ├── auth/
    │       │   ├── login/
    │       │   │   ├── index.tsx                   # Login view
    │       │   │   └── hooks/useLogin.ts           # Login state & request hook
    │       └── dashboard/
    │           └── index.tsx                       # Initial landing dashboard
    │
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.js / style.css
    ├── tsconfig.json
    └── package.json
```

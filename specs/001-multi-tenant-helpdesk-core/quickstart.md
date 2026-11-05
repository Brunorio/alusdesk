# Quickstart Guide: AlusDesk

**Feature**: Multi-Tenant Corporate Helpdesk and Remote Control Core Platform  
**Branch**: `001-multi-tenant-helpdesk-core`  
**Date**: 2026-11-05  

---

## 1. Prerequisites
- **Node.js**: v20.x LTS or higher
- **pnpm**: v9.x or higher
- **Rust & Cargo**: v1.78+ (for `agent/`)
- **Docker & Docker Compose**: For local PostgreSQL, Redis, and MinIO storage

---

## 2. Environment Setup

### 2.1. Start Infrastructure Services
```bash
docker compose up -d postgres redis minio
```

### 2.2. Install Monorepo Dependencies
```bash
pnpm install
```

---

## 3. Running Test Suites

### 3.1. Domain & Core Unit Tests
```bash
pnpm --filter @alusdesk/core test
```

### 3.2. Backend Integration & Use Case Tests
```bash
pnpm --filter @alusdesk/backend test
```

### 3.3. Remote Agent Unit Tests
```bash
cd agent && cargo test
```

---

## 4. Running Development Servers

### 4.1. Start Backend API & WebSocket Server
```bash
pnpm --filter @alusdesk/backend dev
```

### 4.2. Start Frontend SPA
```bash
pnpm --filter @alusdesk/frontend dev
```

### 4.3. Run Rust Remote Host Daemon
```bash
cd agent && cargo run
```

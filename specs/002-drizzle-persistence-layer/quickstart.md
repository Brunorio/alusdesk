# Quickstart: Drizzle ORM Multi-Tenant Persistence

## 1. Installation
In `@alusdesk/core`:
```bash
npm i drizzle-orm pg
npm i -D drizzle-kit @types/pg
```

## 2. Environment Variables
```env
# Manager Database
DB_MANAGER_HOST=localhost
DB_MANAGER_PORT=5432
DB_MANAGER_DATABASE=alusdesk_manager
DB_MANAGER_USER=postgres
DB_MANAGER_PASSWORD=postgres
DB_MANAGER_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 3. Running Migrations
To run manager and tenant migrations:
```bash
npm run migrate:manager -w @alusdesk/core
npm run migrate:tenants -w @alusdesk/core
```


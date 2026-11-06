import * as path from 'path';
import { Pool } from 'pg';
import { DrizzleSqlMigrator } from './migrator';

async function main() {
  const target = process.argv[2] ?? 'manager';

  const pool = new Pool({
    host: process.env.DB_MANAGER_HOST ?? 'localhost',
    port: Number(process.env.DB_MANAGER_PORT ?? 5432),
    database: process.env.DB_MANAGER_DATABASE ?? 'alusdesk_manager',
    user: process.env.DB_MANAGER_USER ?? 'postgres',
    password: process.env.DB_MANAGER_PASSWORD ?? 'postgres',
    ssl: process.env.DB_MANAGER_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  const migrationsBaseDir = path.resolve(__dirname, '../../../migrations');
  const targetDir = path.join(migrationsBaseDir, target);

  try {
    const result = await DrizzleSqlMigrator.runMigrations(pool, targetDir);
    process.stdout.write(
      `Migrations completed for ${target}: applied ${result.applied.length}, skipped ${result.skipped.length}\n`,
    );
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    process.stderr.write(`Migration failed: ${err.message}\n`);
    process.exit(1);
  });
}


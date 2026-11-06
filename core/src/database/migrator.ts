import * as fs from 'fs';
import * as path from 'path';
import { Pool, PoolClient } from 'pg';

export interface MigrationResult {
  applied: string[];
  skipped: string[];
}

export class DrizzleSqlMigrator {
  static async runMigrations(
    pool: Pool,
    migrationsDir: string,
  ): Promise<MigrationResult> {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS __drizzle_migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      const appliedResult = await client.query<{ name: string }>(
        'SELECT name FROM __drizzle_migrations ORDER BY id ASC;',
      );
      const appliedSet = new Set(appliedResult.rows.map((r) => r.name));

      if (!fs.existsSync(migrationsDir)) {
        return { applied: [], skipped: [] };
      }

      const files = fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();

      const applied: string[] = [];
      const skipped: string[] = [];

      for (const file of files) {
        if (appliedSet.has(file)) {
          skipped.push(file);
          continue;
        }

        const filePath = path.join(migrationsDir, file);
        const sqlContent = fs.readFileSync(filePath, 'utf-8');

        await client.query('BEGIN');
        try {
          await client.query(sqlContent);
          await client.query(
            'INSERT INTO __drizzle_migrations (name) VALUES ($1);',
            [file],
          );
          await client.query('COMMIT');
          applied.push(file);
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      }

      return { applied, skipped };
    } finally {
      client.release();
    }
  }
}


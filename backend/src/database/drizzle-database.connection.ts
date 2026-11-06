import { Injectable } from '@nestjs/common';
import { Connection } from '@core/domain/value-object/connection.vo';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { IDatabaseConnection } from './database.connection.interface';
import { TenantConnectionRegistry } from './tenant-connection.registry';

@Injectable()
export class DrizzleDatabaseConnection implements IDatabaseConnection {
  private pools = new Map<string, Pool>();

  async connect(connection: Connection): Promise<NodePgDatabase<any>> {
    const key = TenantConnectionRegistry.buildKey(
      connection.host,
      connection.port,
      connection.database,
    );

    let db = TenantConnectionRegistry.get<NodePgDatabase<any>>(key);
    if (!db) {
      const pool = new Pool({
        host: connection.host,
        port: connection.port,
        database: connection.database,
        user: connection.username,
        password: connection.password,
        ssl: connection.ssl ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
      });

      this.pools.set(key, pool);
      db = drizzle(pool);
      TenantConnectionRegistry.set(key, db);
    }

    return db;
  }

  async disconnect(): Promise<void> {
    for (const pool of this.pools.values()) {
      await pool.end();
    }
    this.pools.clear();
    TenantConnectionRegistry.clear();
  }
}


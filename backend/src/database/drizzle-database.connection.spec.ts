import { Connection } from '@core/domain/value-object/connection.vo';
import { Pool } from 'pg';
import { DrizzleDatabaseConnection } from './drizzle-database.connection';
import { TenantConnectionRegistry } from './tenant-connection.registry';

jest.mock('pg', () => {
  const mockPool = {
    end: jest.fn().mockResolvedValue(undefined),
  };
  return {
    Pool: jest.fn(() => mockPool),
  };
});

jest.mock('drizzle-orm/node-postgres', () => ({
  drizzle: jest.fn(() => ({ dummyDrizzle: true })),
}));

describe('DrizzleDatabaseConnection Unit Tests', () => {
  let connectionService: DrizzleDatabaseConnection;

  beforeEach(() => {
    TenantConnectionRegistry.clear();
    connectionService = new DrizzleDatabaseConnection();
  });

  afterEach(async () => {
    await connectionService.disconnect();
  });

  it('should create new connection and cache it in registry', async () => {
    const connection = new Connection({
      host: 'localhost',
      port: 5432,
      database: 'tenant_db_1',
      username: 'user1',
      password: 'pwd',
    });

    const db1 = await connectionService.connect(connection);
    expect(db1).toBeDefined();
    expect(Pool).toHaveBeenCalledTimes(1);

    const key = TenantConnectionRegistry.buildKey(
      connection.host,
      connection.port,
      connection.database,
    );
    expect(TenantConnectionRegistry.has(key)).toBe(true);

    // Connecting again with same params must return cached instance
    const db2 = await connectionService.connect(connection);
    expect(db2).toBe(db1);
    expect(Pool).toHaveBeenCalledTimes(1);
  });

  it('should close all pools on disconnect', async () => {
    const connection = new Connection({
      host: 'localhost',
      port: 5432,
      database: 'tenant_db_2',
      username: 'user2',
      password: 'pwd',
    });

    await connectionService.connect(connection);
    await connectionService.disconnect();

    expect(TenantConnectionRegistry.has('localhost:5432:tenant_db_2')).toBe(false);
  });
});


import * as fs from 'fs';
import { DrizzleSqlMigrator } from './migrator';

describe('DrizzleSqlMigrator Unit Tests', () => {
  let mockClient: any;
  let mockPool: any;

  beforeEach(() => {
    mockClient = {
      query: jest.fn().mockImplementation((queryText: string) => {
        if (queryText.includes('SELECT name FROM __drizzle_migrations')) {
          return { rows: [{ name: '20261106000000-already-applied.sql' }] };
        }
        return { rows: [] };
      }),
      release: jest.fn(),
    };

    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
    };
  });

  it('should apply unapplied migrations and skip applied ones', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readdirSync').mockReturnValue([
      '20261106000000-already-applied.sql',
      '20261106000001-new-migration.sql',
    ] as any);
    jest.spyOn(fs, 'readFileSync').mockReturnValue('CREATE TABLE test ();');

    const result = await DrizzleSqlMigrator.runMigrations(mockPool, '/dummy/migrations');

    expect(result.skipped).toEqual(['20261106000000-already-applied.sql']);
    expect(result.applied).toEqual(['20261106000001-new-migration.sql']);
    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith('CREATE TABLE test ();');
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    expect(mockClient.release).toHaveBeenCalled();

    jest.restoreAllMocks();
  });

  it('should rollback if SQL execution fails', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readdirSync').mockReturnValue(['20261106000001-faulty.sql'] as any);
    jest.spyOn(fs, 'readFileSync').mockReturnValue('SYNTAX ERROR');

    mockClient.query.mockImplementation((queryText: string) => {
      if (queryText === 'SYNTAX ERROR') {
        throw new Error('syntax error at or near SYNTAX');
      }
      if (queryText.includes('SELECT name FROM __drizzle_migrations')) {
        return { rows: [] };
      }
      return { rows: [] };
    });

    await expect(
      DrizzleSqlMigrator.runMigrations(mockPool, '/dummy/migrations'),
    ).rejects.toThrow('syntax error at or near SYNTAX');

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalled();

    jest.restoreAllMocks();
  });
});


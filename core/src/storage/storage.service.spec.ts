import * as fs from 'fs';
import * as path from 'path';
import { StorageService } from './storage.service';

describe('StorageService Unit Tests', () => {
  const testDir = path.join(__dirname, '__test_storage__');
  let storage: StorageService;

  beforeAll(() => {
    storage = new StorageService({
      driver: 'local',
      localBasePath: testDir,
    });
  });

  afterAll(async () => {
    if (fs.existsSync(testDir)) {
      await fs.promises.rm(testDir, { recursive: true, force: true });
    }
  });

  it('should save, retrieve, and delete files using the generic interface', async () => {
    const filename = 'test-file.txt';
    const content = Buffer.from('Hello AlusDesk');

    const saved = await storage.save(filename, content);
    expect(saved).toBe(true);

    const retrieved = await storage.get(filename);
    expect(retrieved.toString()).toBe('Hello AlusDesk');

    const deleted = await storage.delete(filename);
    expect(deleted).toBe(true);
  });
});


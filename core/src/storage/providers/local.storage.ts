import * as fs from 'fs';
import * as path from 'path';
import { IStorage, StorageMetadata } from '../storage.interface';

export class LocalStorage implements IStorage {
  constructor(private readonly basePath: string) {
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }
  }

  async save(pathname: string, contents: Buffer, _metadata?: StorageMetadata): Promise<boolean> {
    try {
      const fullPath = path.join(this.basePath, pathname);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      await fs.promises.writeFile(fullPath, contents);
      return true;
    } catch {
      return false;
    }
  }

  async get(pathname: string): Promise<Buffer> {
    const fullPath = path.join(this.basePath, pathname);
    return await fs.promises.readFile(fullPath);
  }

  async delete(pathname: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.basePath, pathname);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
      return true;
    } catch {
      return false;
    }
  }

  async getSignedUrl(pathname: string): Promise<string> {
    return `/storage/${pathname}`;
  }
}

import { Storage, Bucket } from '@google-cloud/storage';
import { IStorage, StorageMetadata } from '../storage.interface';

export interface GcpStorageOptions {
  bucketName: string;
  projectId?: string;
  credentials?: Record<string, any>;
  keyFilename?: string;
}

export class GcpStorage implements IStorage {
  private readonly storage: Storage;
  private readonly bucket: Bucket;

  constructor(options: GcpStorageOptions) {
    this.storage = new Storage({
      projectId: options.projectId,
      credentials: options.credentials,
      keyFilename: options.keyFilename,
    });
    this.bucket = this.storage.bucket(options.bucketName);
  }

  async save(pathname: string, contents: Buffer, metadata?: StorageMetadata): Promise<boolean> {
    try {
      const file = this.bucket.file(pathname);
      await file.save(contents, {
        metadata: {
          contentType: metadata?.contentType || 'application/octet-stream',
          metadata: metadata,
        },
        resumable: false,
      });
      return true;
    } catch {
      return false;
    }
  }

  async get(pathname: string): Promise<Buffer> {
    const file = this.bucket.file(pathname);
    const [contents] = await file.download();
    return contents;
  }

  async delete(pathname: string): Promise<boolean> {
    try {
      const file = this.bucket.file(pathname);
      await file.delete({ ignoreNotFound: true });
      return true;
    } catch {
      return false;
    }
  }

  async getSignedUrl(pathname: string, expiresInMinutes: number = 60): Promise<string> {
    const file = this.bucket.file(pathname);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });
    return url;
  }
}


import { IStorage, StorageMetadata } from './storage.interface';
import { LocalStorage } from './providers/local.storage';
import { GcpStorage, GcpStorageOptions } from './providers/gcp.storage';
import { S3Storage, S3StorageOptions } from './providers/s3.storage';

export type StorageDriver = 'gcp' | 's3' | 'local';

export interface StorageConfig {
  driver: StorageDriver;
  localBasePath?: string;
  gcp?: GcpStorageOptions;
  s3?: S3StorageOptions;
}

export class StorageService implements IStorage {
  private readonly provider: IStorage;

  constructor(config: StorageConfig) {
    if (config.driver === 'gcp') {
      if (!config.gcp) {
        throw new Error('GCP Storage configuration required when driver is gcp');
      }
      this.provider = new GcpStorage(config.gcp);
    } else if (config.driver === 's3') {
      if (!config.s3) {
        throw new Error('S3 Storage configuration required when driver is s3');
      }
      this.provider = new S3Storage(config.s3);
    } else {
      this.provider = new LocalStorage(config.localBasePath || './storage');
    }
  }

  async save(pathname: string, contents: Buffer, metadata?: StorageMetadata): Promise<boolean> {
    return await this.provider.save(pathname, contents, metadata);
  }

  async get(pathname: string): Promise<Buffer> {
    return await this.provider.get(pathname);
  }

  async delete(pathname: string): Promise<boolean> {
    return await this.provider.delete(pathname);
  }

  async getSignedUrl(pathname: string, expiresInMinutes: number = 60): Promise<string> {
    if (this.provider.getSignedUrl) {
      return await this.provider.getSignedUrl(pathname, expiresInMinutes);
    }
    return `/storage/${pathname}`;
  }
}

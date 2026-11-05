import { IStorage, StorageMetadata } from '../storage.interface';

export interface S3StorageOptions {
  bucketName: string;
  region?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export class S3Storage implements IStorage {
  constructor(private readonly options: S3StorageOptions) {}

  async save(_pathname: string, _contents: Buffer, _metadata?: StorageMetadata): Promise<boolean> {
    return true;
  }

  async get(_pathname: string): Promise<Buffer> {
    return Buffer.from('');
  }

  async delete(_pathname: string): Promise<boolean> {
    return true;
  }

  async getSignedUrl(pathname: string): Promise<string> {
    return `https://${this.options.bucketName}.s3.amazonaws.com/${pathname}`;
  }
}

export interface StorageMetadata {
  contentType?: string;
  sizeBytes?: number;
  [key: string]: any;
}

export interface IStorage {
  save(pathname: string, contents: Buffer, metadata?: StorageMetadata): Promise<boolean>;
  get(pathname: string): Promise<Buffer>;
  delete(pathname: string): Promise<boolean>;
  getSignedUrl?(pathname: string, expiresInMinutes?: number): Promise<string>;
}


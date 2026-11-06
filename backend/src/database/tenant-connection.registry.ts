export class TenantConnectionRegistry {
  private static connections = new Map<string, any>();

  static buildKey(host: string, port: number, database: string): string {
    return `${host}:${port}:${database}`;
  }

  static get<T = any>(key: string): T | undefined {
    return this.connections.get(key);
  }

  static set(key: string, connection: any): void {
    this.connections.set(key, connection);
  }

  static has(key: string): boolean {
    return this.connections.has(key);
  }

  static clear(): void {
    this.connections.clear();
  }
}


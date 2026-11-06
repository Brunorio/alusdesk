import { Connection } from '@core/domain/value-object/connection.vo';

export interface IDatabaseConnection {
  connect(connection: Connection): Promise<any>;
  disconnect?(): Promise<void>;
}


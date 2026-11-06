import EntityError from '../../errors/entity.error';
import { EntityValidator } from '../../validators/entity-validator';
import { ConnectionRules } from './connection.rules';
import { ValueObject } from './value-object';

export interface ConnectionInput {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  schema?: string;
  ssl?: boolean;
}

export interface ConnectionOutput {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  schema?: string;
  ssl?: boolean;
}

export class Connection extends ValueObject {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly username: string;
  readonly password: string;
  readonly schema?: string;
  readonly ssl?: boolean;

  constructor(input: ConnectionInput) {
    super();
    this.host = input.host;
    this.port = input.port;
    this.database = input.database;
    this.username = input.username;
    this.password = input.password;
    this.schema = input.schema;
    this.ssl = input.ssl;

    this.validate();
  }

  private validate(): void {
    const rules = new ConnectionRules(this.toJSON());
    const validator = new EntityValidator(rules);
    if (!validator.validate()) {
      throw new EntityError('Connection', validator.getNotification());
    }
  }

  toString(): string {
    return `Connection(host: ${this.host}, port: ${this.port}, database: ${this.database}, username: ${this.username}, schema: ${this.schema ?? 'public'}, ssl: ${this.ssl ?? false})`;
  }

  toJSON(): ConnectionOutput {
    return {
      host: this.host,
      port: this.port,
      database: this.database,
      username: this.username,
      password: this.password,
      schema: this.schema,
      ssl: this.ssl,
    };
  }
}


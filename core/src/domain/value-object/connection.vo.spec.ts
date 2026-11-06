import EntityError from '../../errors/entity.error';
import { Connection } from './connection.vo';

describe('Connection Value Object Unit Tests', () => {
  it('should create a valid Connection instance', () => {
    const connection = new Connection({
      host: 'localhost',
      port: 5432,
      database: 'alusdesk_tenant_1',
      username: 'alusdesk',
      password: 'secretpassword',
      schema: 'public',
      ssl: false,
    });

    expect(connection).toBeInstanceOf(Connection);
    expect(connection.host).toBe('localhost');
    expect(connection.port).toBe(5432);
    expect(connection.database).toBe('alusdesk_tenant_1');
    expect(connection.username).toBe('alusdesk');
    expect(connection.password).toBe('secretpassword');
    expect(connection.toJSON()).toEqual({
      host: 'localhost',
      port: 5432,
      database: 'alusdesk_tenant_1',
      username: 'alusdesk',
      password: 'secretpassword',
      schema: 'public',
      ssl: false,
    });
  });

  it('should fail when required fields are missing', () => {
    expect(() => {
      new Connection({
        host: '',
        port: 0,
        database: '',
        username: '',
        password: '',
      });
    }).toThrow(EntityError);
  });
});


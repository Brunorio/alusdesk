import * as Joi from 'joi';
import {
  CONFIG_AUTH_SCHEMA,
  CONFIG_DB_SCHEMA,
  CONFIG_ENV_SCHEMA,
  CONFIG_REDIS_SCHEMA,
  CONFIG_STORAGE_SCHEMA,
} from './config.schema';

describe('Config Schema Validation Unit Tests', () => {
  const schema = Joi.object({
    ...CONFIG_ENV_SCHEMA,
    ...CONFIG_DB_SCHEMA,
    ...CONFIG_AUTH_SCHEMA,
    ...CONFIG_REDIS_SCHEMA,
    ...CONFIG_STORAGE_SCHEMA,
  });

  it('should validate and apply default values for empty environment', () => {
    const { error, value } = schema.validate({});
    expect(error).toBeUndefined();
    expect(value.NODE_ENV).toBe('development');
    expect(value.PORT).toBe(3000);
    expect(value.DB_MANAGER_PORT).toBe(5432);
    expect(value.DB_MANAGER_DATABASE).toBe('alusdesk_manager');
    expect(value.JWT_SECRET).toBe('alusdesk-jwt-secret-key');
    expect(value.REDIS_PORT).toBe(6379);
    expect(value.STORAGE_DRIVER).toBe('local');
  });

  it('should reject invalid values', () => {
    const { error } = schema.validate({
      PORT: 'invalid-port',
    });
    expect(error).toBeDefined();
  });
});


import * as Joi from 'joi';

type ENV_SCHEMA_TYPE = {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  APP_URL: string;
};

export const CONFIG_ENV_SCHEMA: Joi.StrictSchemaMap<ENV_SCHEMA_TYPE> = {
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().integer().default(3000),
  APP_URL: Joi.string().uri().default('http://localhost:3000'),
};

type DB_SCHEMA_TYPE = {
  DB_MANAGER_HOST: string;
  DB_MANAGER_PORT: number;
  DB_MANAGER_DATABASE: string;
  DB_MANAGER_USER: string;
  DB_MANAGER_PASSWORD: string;
  DB_MANAGER_SSL: boolean;
};

export const CONFIG_DB_SCHEMA: Joi.StrictSchemaMap<DB_SCHEMA_TYPE> = {
  DB_MANAGER_HOST: Joi.string().default('localhost'),
  DB_MANAGER_PORT: Joi.number().integer().default(5432),
  DB_MANAGER_DATABASE: Joi.string().default('alusdesk_manager'),
  DB_MANAGER_USER: Joi.string().default('postgres'),
  DB_MANAGER_PASSWORD: Joi.string().allow('').default('postgres'),
  DB_MANAGER_SSL: Joi.boolean().default(false),
};

type AUTH_SCHEMA_TYPE = {
  JWT_SECRET: string;
  JWT_EXPIRES_IN_SECONDS: number;
};

export const CONFIG_AUTH_SCHEMA: Joi.StrictSchemaMap<AUTH_SCHEMA_TYPE> = {
  JWT_SECRET: Joi.string().default('alusdesk-jwt-secret-key'),
  JWT_EXPIRES_IN_SECONDS: Joi.number().integer().default(86400),
};

type REDIS_SCHEMA_TYPE = {
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
};

export const CONFIG_REDIS_SCHEMA: Joi.StrictSchemaMap<REDIS_SCHEMA_TYPE> = {
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().integer().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
};

type STORAGE_SCHEMA_TYPE = {
  STORAGE_DRIVER: 'local' | 's3' | 'gcp';
  LOCAL_STORAGE_PATH: string;
};

export const CONFIG_STORAGE_SCHEMA: Joi.StrictSchemaMap<STORAGE_SCHEMA_TYPE> = {
  STORAGE_DRIVER: Joi.string().valid('local', 's3', 'gcp').default('local'),
  LOCAL_STORAGE_PATH: Joi.string().default('./storage'),
};

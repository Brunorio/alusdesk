import { DynamicModule, Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigModuleOptions,
} from '@nestjs/config';
import * as Joi from 'joi';
import { join } from 'path';
import {
  CONFIG_AUTH_SCHEMA,
  CONFIG_DB_SCHEMA,
  CONFIG_ENV_SCHEMA,
  CONFIG_REDIS_SCHEMA,
  CONFIG_STORAGE_SCHEMA,
} from './config.schema';

@Module({})
export class ConfigModule extends NestConfigModule {
  static forRoot(options: ConfigModuleOptions = {}): Promise<DynamicModule> {
    return super.forRoot({
      isGlobal: true,
      envFilePath: [join(process.cwd(), '.env')],
      validationSchema: Joi.object({
        ...CONFIG_ENV_SCHEMA,
        ...CONFIG_DB_SCHEMA,
        ...CONFIG_AUTH_SCHEMA,
        ...CONFIG_REDIS_SCHEMA,
        ...CONFIG_STORAGE_SCHEMA,
      }),
      ...options,
    });
  }
}

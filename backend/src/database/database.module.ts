import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DrizzleDatabaseConnection } from './drizzle-database.connection';

@Global()
@Module({
  providers: [
    {
      provide: 'MANAGER_DB',
      useFactory: (configService: ConfigService) => {
        const pool = new Pool({
          host: configService.get<string>('DB_MANAGER_HOST', 'localhost'),
          port: Number(configService.get<number>('DB_MANAGER_PORT', 5432)),
          database: configService.get<string>('DB_MANAGER_DATABASE', 'alusdesk_manager'),
          user: configService.get<string>('DB_MANAGER_USER', 'postgres'),
          password: configService.get<string>('DB_MANAGER_PASSWORD', 'postgres'),
          ssl:
            configService.get<string>('DB_MANAGER_SSL') === 'true'
              ? { rejectUnauthorized: false }
              : undefined,
        });
        return drizzle(pool);
      },
      inject: [ConfigService],
    },
    {
      provide: 'IDatabaseConnection',
      useClass: DrizzleDatabaseConnection,
    },
    DrizzleDatabaseConnection,
  ],
  exports: ['MANAGER_DB', 'IDatabaseConnection', DrizzleDatabaseConnection],
})
export class DatabaseModule {}

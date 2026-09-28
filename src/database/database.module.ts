import {
  Global,
  Inject,
  Module,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';
import type { Env } from '../config/env.schema.js';
import { connectionOptions, type Database } from './connection.js';
import { DRIZZLE, POSTGRES_CLIENT } from './database.tokens.js';
import * as schema from './schema.js';

@Global()
@Module({
  providers: [
    {
      provide: POSTGRES_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): Sql =>
        postgres({
          ...connectionOptions({
            DB_HOST: config.get('DB_HOST', { infer: true }),
            DB_PORT: config.get('DB_PORT', { infer: true }),
            POSTGRES_USER: config.get('POSTGRES_USER', { infer: true }),
            POSTGRES_PASSWORD: config.get('POSTGRES_PASSWORD', { infer: true }),
            POSTGRES_DB: config.get('POSTGRES_DB', { infer: true }),
          }),
          max: 10,
        }),
    },
    {
      provide: DRIZZLE,
      inject: [POSTGRES_CLIENT],
      useFactory: (client: Sql): Database => drizzle(client, { schema }),
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(POSTGRES_CLIENT) private readonly client: Sql) {}

  async onApplicationShutdown() {
    await this.client.end({ timeout: 5 });
  }
}

import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { Options } from 'postgres';
import type { DbEnv } from '../config/env.schema.js';
import type * as schema from './schema.js';

export type Database = PostgresJsDatabase<typeof schema>;

export function connectionOptions(env: DbEnv): Options<{}> {
  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
  };
}

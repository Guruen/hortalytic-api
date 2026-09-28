import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}

// Samme pinnede image som i compose-filerne
const IMAGE = 'timescale/timescaledb:2.30.1-pg17';

export default async function setup(project: TestProject) {
  const container = await new PostgreSqlContainer(IMAGE).start();
  const databaseUrl = container.getConnectionUri();

  const client = postgres(databaseUrl, { max: 1, onnotice: () => {} });
  await migrate(drizzle(client), { migrationsFolder: 'drizzle' });
  await client.end();

  project.provide('databaseUrl', databaseUrl);

  return async () => {
    await container.stop();
  };
}

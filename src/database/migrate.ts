// Kører Drizzle-migrationer. Bruges af migrate-servicen i compose.prod.yaml
// (node dist/database/migrate.js), så drizzle-kit ikke skal med i prod-imaget.
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { validateDbEnv } from '../config/env.schema.js';
import { connectionOptions } from './connection.js';

const client = postgres({
  ...connectionOptions(validateDbEnv(process.env)),
  max: 1,
  onnotice: () => {},
});

try {
  await migrate(drizzle(client), { migrationsFolder: 'drizzle' });
  console.log('Migrationer kørt');
} finally {
  await client.end();
}

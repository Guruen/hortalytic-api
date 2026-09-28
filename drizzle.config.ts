import { defineConfig } from 'drizzle-kit';
import { validateDbEnv } from './src/config/env.schema.js';

try {
  process.loadEnvFile();
} catch {
  // Ingen .env (fx i CI). Så skal variablerne allerede være sat.
}

const env = validateDbEnv(process.env);

// Brug aldrig `drizzle-kit push`: den kender ikke til hypertables.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema.ts',
  out: './drizzle',
  dbCredentials: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    ssl: false,
  },
  strict: true,
  verbose: true,
});

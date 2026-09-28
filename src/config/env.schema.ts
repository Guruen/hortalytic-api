import { z } from 'zod';

const port = z.coerce.number().int().min(1).max(65535);

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: port.default(3000),

  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DB: z.string().min(1),
  DB_HOST: z.string().min(1),
  DB_PORT: port.default(5432),

  MQTT_URL: z.url({ protocol: /^mqtts?$/ }),
  MQTT_USERNAME: z.string().min(1),
  MQTT_PASSWORD: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

// Kun DB-felterne. Bruges af migrate-scriptet og drizzle.config.ts.
export const dbEnvSchema = envSchema.pick({
  POSTGRES_USER: true,
  POSTGRES_PASSWORD: true,
  POSTGRES_DB: true,
  DB_HOST: true,
  DB_PORT: true,
});

export type DbEnv = z.infer<typeof dbEnvSchema>;

function parse<T extends z.ZodType>(
  schema: T,
  raw: Record<string, unknown>,
): z.infer<T> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Ugyldig konfiguration:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export function validateEnv(raw: Record<string, unknown>): Env {
  return parse(envSchema, raw);
}

export function validateDbEnv(raw: Record<string, unknown>): DbEnv {
  return parse(dbEnvSchema, raw);
}

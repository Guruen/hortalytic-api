import {
  doublePrecision,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { devices } from '../devices/devices.schema.js';

// Long format: én række pr. måling, så nye sensortyper ikke kræver schemaændring.
// Tabellen er en TimescaleDB hypertable på time (se custom migration i drizzle/).
export const readings = pgTable(
  'readings',
  {
    // Enhedens eget timestamp fra payloaden
    time: timestamp('time', { withTimezone: true }).notNull(),
    deviceId: text('device_id')
      .notNull()
      .references(() => devices.id),
    sensor: text('sensor').notNull(),
    metric: text('metric').notNull(),
    value: doublePrecision('value').notNull(),
  },
  (t) => [
    // Hypertables kræver, at unikke constraints inkluderer time. PK'en giver
    // samtidig idempotens ved MQTT-genlevering (ON CONFLICT DO NOTHING).
    primaryKey({ columns: [t.deviceId, t.sensor, t.metric, t.time] }),
    index('readings_device_id_time_idx').on(
      t.deviceId,
      t.time.desc().nullsFirst(),
    ),
  ],
);

export type Reading = typeof readings.$inferSelect;
export type NewReading = typeof readings.$inferInsert;

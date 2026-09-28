import { sql } from 'drizzle-orm';
import { check, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const devices = pgTable(
  'devices',
  {
    // deviceId = enhedens MQTT-brugernavn
    id: text('id').primaryKey(),
    // Nullable indtil claiming. FK tilføjes sammen med greenhouses-tabellen.
    greenhouseId: uuid('greenhouse_id'),
    firmwareVersion: text('firmware_version'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  },
  (t) => [
    // "hortalytic-api" er backendens reserverede MQTT-brugernavn
    check('devices_id_not_reserved', sql`${t.id} <> 'hortalytic-api'`),
  ],
);

export type Device = typeof devices.$inferSelect;
export type NewDevice = typeof devices.$inferInsert;

// Samlet schema til Drizzle-klienten og drizzle-kit. Nye tabeller defineres i
// deres eget modul (src/modules/<modul>/<navn>.schema.ts) og eksporteres her.
export * from '../modules/devices/devices.schema.js';
export * from '../modules/telemetry/readings.schema.js';

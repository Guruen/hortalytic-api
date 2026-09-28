-- Custom migration: drizzle-kit kender ikke til TimescaleDB.
-- Timescale-imaget opretter extension'en i POSTGRES_DB, men vær sikker.
CREATE EXTENSION IF NOT EXISTS timescaledb;
--> statement-breakpoint
SELECT create_hypertable('readings', by_range('time'));

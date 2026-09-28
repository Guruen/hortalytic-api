import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { inject } from 'vitest';
import * as schema from '../../src/database/schema.js';
import { devices, readings } from '../../src/database/schema.js';

const client = postgres(inject('databaseUrl'), { onnotice: () => {} });
const db = drizzle(client, { schema });

const time = new Date('2026-09-28T12:00:00Z');
const reading = {
  time,
  deviceId: 'dev1',
  sensor: 'sht31',
  metric: 'temperature',
  value: 21.5,
};

// Drizzle pakker driverfejl ind i sin egen fejl, så den oprindelige postgres-fejl ligger i cause
async function pgErrorCode(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    const cause = (error as { cause?: { code?: string } }).cause;
    return cause?.code ?? (error as { code?: string }).code ?? 'unknown';
  }
  throw new Error('Forventede en fejl');
}

describe('database schema', () => {
  beforeEach(async () => {
    await db.execute(sql`TRUNCATE readings, devices`);
  });

  afterAll(async () => {
    await client.end();
  });

  it('readings er en hypertable på time', async () => {
    const rows = await db.execute<{ column_name: string }>(sql`
      SELECT column_name FROM timescaledb_information.dimensions
      WHERE hypertable_name = 'readings'
    `);
    expect(rows.map((r) => r.column_name)).toEqual(['time']);
  });

  it('har index på (device_id, time DESC)', async () => {
    const rows = await db.execute<{ indexdef: string }>(sql`
      SELECT indexdef FROM pg_indexes WHERE indexname = 'readings_device_id_time_idx'
    `);
    expect(rows[0]?.indexdef).toContain('(device_id, "time" DESC)');
  });

  it('gemmer en device uden greenhouse og en reading', async () => {
    await db.insert(devices).values({ id: 'dev1' });
    await db.insert(readings).values(reading);

    const [device] = await db.select().from(devices);
    expect(device).toMatchObject({ id: 'dev1', greenhouseId: null });
    expect(device?.createdAt).toBeInstanceOf(Date);
    expect(await db.select().from(readings)).toEqual([reading]);
  });

  it('afviser dublet-reading, og ON CONFLICT DO NOTHING ignorerer den', async () => {
    await db.insert(devices).values({ id: 'dev1' });
    await db.insert(readings).values(reading);

    expect(await pgErrorCode(db.insert(readings).values(reading))).toBe(
      '23505',
    );

    await db
      .insert(readings)
      .values({ ...reading, value: 99 })
      .onConflictDoNothing();
    expect(await db.select().from(readings)).toEqual([reading]);
  });

  it('tillader samme tidspunkt for forskellige metrics', async () => {
    await db.insert(devices).values({ id: 'dev1' });
    await db
      .insert(readings)
      .values([reading, { ...reading, metric: 'humidity', value: 60 }]);

    expect(await db.select().from(readings)).toHaveLength(2);
  });

  it('afviser reading for ukendt device', async () => {
    expect(await pgErrorCode(db.insert(readings).values(reading))).toBe(
      '23503',
    );
  });

  it('afviser det reserverede deviceId hortalytic-api', async () => {
    expect(
      await pgErrorCode(db.insert(devices).values({ id: 'hortalytic-api' })),
    ).toBe('23514');
  });
});

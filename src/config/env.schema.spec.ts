import { validateDbEnv, validateEnv } from './env.schema.js';

const valid = {
  POSTGRES_USER: 'hortalytic',
  POSTGRES_PASSWORD: 'secret',
  POSTGRES_DB: 'hortalytic',
  DB_HOST: 'localhost',
  MQTT_URL: 'mqtt://localhost:1883',
  MQTT_USERNAME: 'hortalytic-api',
  MQTT_PASSWORD: 'secret',
};

describe('validateEnv', () => {
  it('accepterer gyldig env og sætter defaults', () => {
    const env = validateEnv(valid);
    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(3000);
    expect(env.DB_PORT).toBe(5432);
  });

  it('coercer port fra string', () => {
    expect(validateEnv({ ...valid, PORT: '8080' }).PORT).toBe(8080);
  });

  it('accepterer mqtts://', () => {
    const env = validateEnv({ ...valid, MQTT_URL: 'mqtts://broker:8883' });
    expect(env.MQTT_URL).toBe('mqtts://broker:8883');
  });

  it('afviser manglende felt', () => {
    const { MQTT_PASSWORD: _, ...missing } = valid;
    expect(() => validateEnv(missing)).toThrow(/MQTT_PASSWORD/);
  });

  it('afviser ugyldig port', () => {
    expect(() => validateEnv({ ...valid, PORT: '99999' })).toThrow(/PORT/);
  });

  it('afviser forkert protokol i MQTT_URL', () => {
    expect(() =>
      validateEnv({ ...valid, MQTT_URL: 'http://localhost:1883' }),
    ).toThrow(/MQTT_URL/);
  });
});

describe('validateDbEnv', () => {
  it('kræver kun DB-felterne', () => {
    const {
      MQTT_URL: _u,
      MQTT_USERNAME: _n,
      MQTT_PASSWORD: _p,
      ...dbOnly
    } = valid;
    expect(validateDbEnv(dbOnly)).toEqual({
      POSTGRES_USER: 'hortalytic',
      POSTGRES_PASSWORD: 'secret',
      POSTGRES_DB: 'hortalytic',
      DB_HOST: 'localhost',
      DB_PORT: 5432,
    });
  });

  it('afviser manglende DB-felt', () => {
    const { DB_HOST: _, ...missing } = valid;
    expect(() => validateDbEnv(missing)).toThrow(/DB_HOST/);
  });
});

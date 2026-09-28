import { connectionOptions } from './connection.js';

describe('connectionOptions', () => {
  it('mapper DB-env til postgres.js options', () => {
    expect(
      connectionOptions({
        DB_HOST: 'db',
        DB_PORT: 5433,
        POSTGRES_USER: 'hortalytic',
        POSTGRES_PASSWORD: 'secret',
        POSTGRES_DB: 'hortalytic_test',
      }),
    ).toEqual({
      host: 'db',
      port: 5433,
      username: 'hortalytic',
      password: 'secret',
      database: 'hortalytic_test',
    });
  });
});

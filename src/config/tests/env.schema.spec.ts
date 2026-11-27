import { parseEnv } from '../env.schema.js';

const valid = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/thrivecbt',
  FIELD_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString('base64'),
  JWT_ACCESS_SECRET: 'a'.repeat(32),
};

describe('parseEnv', () => {
  it('fills in defaults', () => {
    const env = parseEnv(valid);
    expect(env).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      LOG_LEVEL: 'info',
    });
    expect(env.CORS_ORIGINS).toEqual([]);
  });

  it('splits CORS origins and turns PORT into a number', () => {
    const env = parseEnv({
      ...valid,
      PORT: '4000',
      CORS_ORIGINS: 'https://a.test, https://b.test',
    });
    expect(env.PORT).toBe(4000);
    expect(env.CORS_ORIGINS).toEqual(['https://a.test', 'https://b.test']);
  });

  it('refuses to print emails to the log in production', () => {
    expect(() => parseEnv({ ...valid, NODE_ENV: 'production' })).toThrow(
      /EMAIL_TRANSPORT/,
    );
    expect(
      parseEnv({ ...valid, NODE_ENV: 'development' }).EMAIL_TRANSPORT,
    ).toBe('log');
  });

  it('needs an API key when sending through Unosend', () => {
    expect(() => parseEnv({ ...valid, EMAIL_TRANSPORT: 'unosend' })).toThrow(
      /UNOSEND_API_KEY/,
    );
    const env = parseEnv({
      ...valid,
      EMAIL_TRANSPORT: 'unosend',
      UNOSEND_API_KEY: 'un_test',
    });
    expect(env.UNOSEND_API_URL).toBe('https://api.unosend.co/v1');
  });

  it('names every setting that is missing or wrong', () => {
    expect(() =>
      parseEnv({
        DATABASE_URL: 'mysql://localhost/db',
        FIELD_ENCRYPTION_KEY: 'short',
        JWT_ACCESS_SECRET: 'short',
      }),
    ).toThrow(
      /DATABASE_URL[\s\S]*JWT_ACCESS_SECRET[\s\S]*FIELD_ENCRYPTION_KEY/,
    );
  });
});

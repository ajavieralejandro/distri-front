import { describe, expect, it } from 'vitest';

import { loadEnv } from '@/app/config/env';

describe('loadEnv', () => {
  it('returns a typed config for valid values', () => {
    const config = loadEnv({
      VITE_API_URL: 'http://localhost:3000/api',
      VITE_APP_ENV: 'test',
    });

    expect(config).toEqual({
      apiUrl: 'http://localhost:3000/api',
      appEnv: 'test',
      isDevelopment: false,
    });
  });

  it('rejects an invalid app environment', () => {
    expect(() =>
      loadEnv({
        VITE_API_URL: 'http://localhost:3000/api',
        VITE_APP_ENV: 'local',
      }),
    ).toThrow(/Invalid application environment configuration/);
  });

  it('rejects a missing API URL', () => {
    expect(() =>
      loadEnv({
        VITE_APP_ENV: 'development',
      }),
    ).toThrow(/VITE_API_URL/);
  });
});

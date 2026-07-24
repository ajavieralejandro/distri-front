import { describe, expect, it } from 'vitest';

import { loadEnv } from '@/app/config/env';

describe('loadEnv', () => {
  it('returns a typed config for valid values', () => {
    const config = loadEnv({
      VITE_API_URL: 'http://localhost:3000/api',
      VITE_APP_ENV: 'test',
      VITE_DATA_SOURCE: 'mock',
      VITE_DEMO_MODE: 'true',
    });

    expect(config).toEqual({
      apiUrl: 'http://localhost:3000/api',
      appEnv: 'test',
      isDevelopment: false,
      dataSource: 'mock',
      isMockDataSource: true,
      demoMode: true,
    });
  });

  it('rejects an invalid app environment', () => {
    expect(() =>
      loadEnv({
        VITE_API_URL: 'http://localhost:3000/api',
        VITE_APP_ENV: 'local',
        VITE_DATA_SOURCE: 'mock',
        VITE_DEMO_MODE: 'true',
      }),
    ).toThrow(/Invalid application environment configuration/);
  });

  it('rejects a missing API URL', () => {
    expect(() =>
      loadEnv({
        VITE_APP_ENV: 'development',
        VITE_DATA_SOURCE: 'api',
        VITE_DEMO_MODE: 'false',
      }),
    ).toThrow(/VITE_API_URL/);
  });

  it('parses api data source without demo mode', () => {
    const config = loadEnv({
      VITE_API_URL: 'http://localhost:3000/api',
      VITE_APP_ENV: 'production',
      VITE_DATA_SOURCE: 'api',
      VITE_DEMO_MODE: 'false',
    });

    expect(config.isMockDataSource).toBe(false);
    expect(config.demoMode).toBe(false);
  });
});

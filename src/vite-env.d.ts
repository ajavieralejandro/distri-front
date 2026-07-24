/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production' | 'test';
  readonly VITE_DATA_SOURCE: 'mock' | 'api';
  readonly VITE_DEMO_MODE: 'true' | 'false';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production' | 'test';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

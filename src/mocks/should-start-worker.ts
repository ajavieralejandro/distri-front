import type { AppConfig } from '@/app/config/env';

/**
 * Start MSW when the app is explicitly configured for the demo mock source.
 * Independent of Vite DEV/PROD so GitHub Pages staging builds can use mocks.
 * Never starts when VITE_DATA_SOURCE=api.
 */
export function shouldStartMockWorker(
  config: Pick<AppConfig, 'isMockDataSource' | 'demoMode'>,
): boolean {
  return config.isMockDataSource && config.demoMode;
}

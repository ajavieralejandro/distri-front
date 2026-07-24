import type { AppConfig } from '@/app/config/env';

export function shouldStartMockWorker(
  config: Pick<AppConfig, 'isMockDataSource'>,
  isProd: boolean,
): boolean {
  return config.isMockDataSource && !isProd;
}

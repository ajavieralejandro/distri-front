import { delay } from 'msw';

import { env } from '@/app/config/env';

export const api = (path: string): string =>
  `${env.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;

export async function withLatency(): Promise<void> {
  if (env.appEnv === 'test') {
    return;
  }

  await delay(200 + Math.floor(Math.random() * 200));
}

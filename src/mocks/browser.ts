import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export async function startMockWorker() {
  return worker.start({ onUnhandledRequest: 'bypass', quiet: true });
}

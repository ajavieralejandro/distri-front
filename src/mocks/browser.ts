import { setupWorker } from 'msw/browser';

import { getMockServiceWorkerUrl } from '@/mocks/mock-worker-url';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export async function startMockWorker() {
  return worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
    serviceWorker: {
      url: getMockServiceWorkerUrl(import.meta.env.BASE_URL),
    },
  });
}

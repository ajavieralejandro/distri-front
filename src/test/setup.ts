import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';

import { clearApiSession } from '@/features/auth/api-session';
import { clearDemoSession } from '@/features/auth/session';
import { resetConnectionState } from '@/shared/connection/connection-store';
import { resetUncertainSubmissions } from '@/shared/connection/pending-submission';
import { resetRequestScope } from '@/shared/connection/request-scope';
import { useCartStore } from '@/features/orders/cart-store';
import { resetDatabase } from '@/mocks/data/mock-database';
import { server } from '@/mocks/server';

const usesMockData = import.meta.env.VITE_DATA_SOURCE === 'mock';

beforeAll(() => {
  if (usesMockData) {
    server.listen({ onUnhandledRequest: 'error' });
  }
});

beforeEach(() => {
  if (usesMockData) {
    server.resetHandlers();
    resetDatabase();
  }
  clearDemoSession();
  clearApiSession();
  useCartStore.getState().clear();
  resetConnectionState();
  resetUncertainSubmissions();
  resetRequestScope();
});

afterEach(() => {
  cleanup();
  clearDemoSession();
  clearApiSession();
  resetDatabase();
  useCartStore.getState().clear();
  resetConnectionState();
  resetUncertainSubmissions();
  resetRequestScope();

  if (usesMockData) {
    server.resetHandlers();
  }
});

afterAll(() => {
  if (usesMockData) {
    server.close();
  }
});

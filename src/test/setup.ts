import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';

import { clearDemoSession } from '@/features/auth/session';
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
  useCartStore.getState().clear();
});

afterEach(() => {
  cleanup();
  clearDemoSession();
  resetDatabase();
  useCartStore.getState().clear();

  if (usesMockData) {
    server.resetHandlers();
  }
});

afterAll(() => {
  if (usesMockData) {
    server.close();
  }
});

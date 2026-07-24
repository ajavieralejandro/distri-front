import { describe, expect, it } from 'vitest';

import { shouldStartMockWorker } from '@/mocks/should-start-worker';

describe('shouldStartMockWorker', () => {
  it('starts only for mock data outside production', () => {
    expect(shouldStartMockWorker({ isMockDataSource: true }, false)).toBe(true);
    expect(shouldStartMockWorker({ isMockDataSource: true }, true)).toBe(false);
    expect(shouldStartMockWorker({ isMockDataSource: false }, false)).toBe(
      false,
    );
  });
});

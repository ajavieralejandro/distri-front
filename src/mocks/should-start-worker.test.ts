import { describe, expect, it } from 'vitest';

import { shouldStartMockWorker } from '@/mocks/should-start-worker';

describe('shouldStartMockWorker', () => {
  it('starts when mock data source and demo mode are enabled', () => {
    expect(
      shouldStartMockWorker({ isMockDataSource: true, demoMode: true }),
    ).toBe(true);
  });

  it('does not start for API data source', () => {
    expect(
      shouldStartMockWorker({ isMockDataSource: false, demoMode: true }),
    ).toBe(false);
    expect(
      shouldStartMockWorker({ isMockDataSource: false, demoMode: false }),
    ).toBe(false);
  });

  it('does not start when demo mode is disabled', () => {
    expect(
      shouldStartMockWorker({ isMockDataSource: true, demoMode: false }),
    ).toBe(false);
  });
});

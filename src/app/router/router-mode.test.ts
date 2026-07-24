import { describe, expect, it } from 'vitest';

import { resolveRouterMode } from '@/app/router/router-mode';
import { getMockServiceWorkerUrl } from '@/mocks/mock-worker-url';

describe('GitHub Pages hosting helpers', () => {
  it('uses hash routing when configured or when base is a subdirectory', () => {
    expect(resolveRouterMode('hash', '/')).toBe('hash');
    expect(resolveRouterMode('browser', '/distri-front/')).toBe('browser');
    expect(resolveRouterMode(undefined, '/distri-front/')).toBe('hash');
    expect(resolveRouterMode(undefined, '/')).toBe('browser');
  });

  it('builds the MSW worker URL from BASE_URL', () => {
    expect(getMockServiceWorkerUrl('/')).toBe('/mockServiceWorker.js');
    expect(getMockServiceWorkerUrl('/distri-front/')).toBe(
      '/distri-front/mockServiceWorker.js',
    );
    expect(getMockServiceWorkerUrl('/distri-front')).toBe(
      '/distri-front/mockServiceWorker.js',
    );
  });
});

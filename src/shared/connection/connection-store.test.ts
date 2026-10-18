import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { env } from '@/app/config/env';
import {
  API_TOKEN_STORAGE_KEY,
  writeApiTokens,
  writeApiUser,
} from '@/features/auth/api-session';
import { writeDemoSession } from '@/features/auth/session';
import { useCartStore } from '@/features/orders/cart-store';
import { shouldStartMockWorker } from '@/mocks/should-start-worker';
import {
  API_BASE_URL_STORAGE_KEY,
  forgetConnectionMemory,
  getActiveApiBaseUrl,
  hydrateConnection,
  persistApiBaseUrl,
  resolveHttpBaseUrl,
} from '@/shared/connection/connection-store';
import {
  rememberUncertainSubmission,
  readUncertainSubmission,
} from '@/shared/connection/pending-submission';
import { registerQueryClient } from '@/shared/connection/query-client-ref';
import { cancelInflightRequests } from '@/shared/connection/request-scope';
import { commitApiBaseUrl } from '@/shared/connection/server-switch';
import { httpClient } from '@/shared/api/http-client';
import { CancelledRequestError } from '@/shared/connection/request-scope';

describe('frontend connection store', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('persists an override and restores the environment URL', () => {
    persistApiBaseUrl('https://otro.ejemplo/api');
    forgetConnectionMemory();
    return hydrateConnection().then(() => {
      expect(getActiveApiBaseUrl()).toBe('https://otro.ejemplo/api');
      commitApiBaseUrl(env.apiUrl.replace(/\/$/, ''));
      expect(window.localStorage.getItem(API_BASE_URL_STORAGE_KEY)).toBeNull();
      expect(getActiveApiBaseUrl()).toBe('http://localhost:3000/api');
    });
  });

  it('does not fall back to the mock URL in api mode', () => {
    expect(
      resolveHttpBaseUrl({
        mockDataSource: false,
        activeBaseUrl: 'https://otro.ejemplo/api',
        envBaseUrl: 'http://localhost:3000/api',
      }),
    ).toBe('https://otro.ejemplo/api');
    expect(() =>
      resolveHttpBaseUrl({
        mockDataSource: false,
        activeBaseUrl: null,
        envBaseUrl: 'http://localhost:3000/api',
      }),
    ).toThrow(/demostración/);
    expect(
      shouldStartMockWorker({ isMockDataSource: false, demoMode: false }),
    ).toBe(false);
  });

  it('clears session, cart and queries but keeps the old submission', () => {
    writeDemoSession({
      userId: 'user-1',
      role: 'COMMERCE_OWNER',
      displayName: 'Norte',
      email: 'norte@pruebas.distrisoft.local',
    });
    writeApiUser({
      userId: 'usr-admin',
      role: 'ADMIN',
      displayName: 'Administrador',
      email: 'admin@pruebas.distrisoft.local',
      commerceId: null,
    });
    writeApiTokens('http://localhost:3000/api', {
      accessToken: 'access-secret',
      refreshToken: 'refresh-secret',
    });
    useCartStore.getState().addItem(
      {
        productId: 'prod-agua',
        name: 'Agua',
        sku: 'AGUA',
        unitPrice: '850.50',
      },
      1,
    );
    rememberUncertainSubmission({
      apiBaseUrl: 'http://localhost:3000/api',
      idempotencyKey: '11111111-1111-4111-8111-111111111111',
      payloadHash: 'same',
    });
    const queryClient = new QueryClient();
    const cancel = vi.spyOn(queryClient, 'cancelQueries');
    const clear = vi.spyOn(queryClient, 'clear');
    registerQueryClient(queryClient);

    commitApiBaseUrl('https://nuevo.ejemplo/api');

    expect(
      window.sessionStorage.getItem('distrisoft-demo-session-v2'),
    ).toBeNull();
    expect(window.sessionStorage.getItem(API_TOKEN_STORAGE_KEY)).toBeNull();
    expect(window.sessionStorage.getItem('distrisoft-api-session')).toBeNull();
    expect(useCartStore.getState().items).toEqual([]);
    expect(cancel).toHaveBeenCalled();
    expect(clear).toHaveBeenCalled();
    expect(
      readUncertainSubmission('http://localhost:3000/api')?.idempotencyKey,
    ).toBe('11111111-1111-4111-8111-111111111111');
    expect(readUncertainSubmission('https://nuevo.ejemplo/api')).toBeNull();
    expect(env.isMockDataSource).toBe(true);
  });

  it('drops a late response after the server changes', async () => {
    let release: (response: Response) => void = () => undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            release = resolve;
          }),
      ),
    );

    const pending = httpClient.get('/health');
    cancelInflightRequests();
    release(
      new Response(
        JSON.stringify({
          status: 'ok',
          service: 'distrisoft-api',
          timestamp: '2026-10-15T12:00:00.000Z',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    await expect(pending).rejects.toBeInstanceOf(CancelledRequestError);
  });
});

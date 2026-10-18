import { afterEach, describe, expect, it, vi } from 'vitest';

import { createHttpClient, httpClient } from '@/shared/api/http-client';
import { HttpError } from '@/shared/api/http-error';

describe('httpClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('parses a successful JSON response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await httpClient.get<{ status: string }>('/health');

    expect(result).toEqual({ status: 'ok' });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/health',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      }),
    );
  });

  it('throws a typed HttpError on failure', async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ message: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const error = await httpClient
      .get('/missing')
      .catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({
      status: 404,
    });
    expect((error as HttpError).message).toBe('Not found');
  });

  it('supports 204 No Content responses', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await httpClient.delete<undefined>('/session');

    expect(result).toBeUndefined();
  });

  it('joins validation messages from the API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: ['correo', 'clave'] }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const error = await httpClient
      .post('/auth/login', { email: 'a@b.c', password: 'x' })
      .catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).message).toBe('correo\nclave');
  });
});

describe('api authorization', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function client(expireSession = vi.fn()) {
    let accessToken = 'expired-access';
    return {
      expireSession,
      http: createHttpClient({
        mockDataSource: false,
        resolveBaseUrl: () => 'https://api.ejemplo/api',
        readAccessToken: () => accessToken,
        readRefreshToken: () => 'refresh-secret',
        writeTokens: (_baseUrl, tokens) => {
          accessToken = tokens.accessToken;
        },
        expireSession,
      }),
    };
  }

  it('refreshes a rejected call once and retries with the new access token', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ message: 'La sesión no es válida o venció.' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            accessToken: 'new-access',
            refreshToken: 'new-refresh',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'ord-1' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);
    const { expireSession, http } = client();

    await expect(http.get<{ id: string }>('/orders')).resolves.toEqual({
      id: 'ord-1',
    });

    expect(expireSession).not.toHaveBeenCalled();
    const refresh = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(refresh[0]).toBe('https://api.ejemplo/api/auth/refresh');
    expect(refresh[1].credentials).toBe('omit');
    expect(JSON.parse(String(refresh[1].body))).toEqual({
      refreshToken: 'refresh-secret',
    });
    const retryHeaders = new Headers(
      (fetchMock.mock.calls[2] as [string, RequestInit])[1].headers,
    );
    expect(retryHeaders.get('Authorization')).toBe('Bearer new-access');
  });

  it('ends the session when refresh fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ message: 'La sesión no es válida o venció.' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } },
          ),
        ),
    );
    const { expireSession, http } = client();

    await expect(http.get('/orders')).rejects.toMatchObject({ status: 401 });
    expect(expireSession).toHaveBeenCalledTimes(1);
  });

  it('does not treat a rejected login as an expired session', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: 'El email o la contraseña no son válidos.',
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );
    const { expireSession, http } = client();

    await expect(
      http.post(
        '/auth/login',
        { email: 'a@b.c', password: 'x' },
        { auth: false },
      ),
    ).rejects.toMatchObject({ status: 401 });
    expect(expireSession).not.toHaveBeenCalled();
  });
});

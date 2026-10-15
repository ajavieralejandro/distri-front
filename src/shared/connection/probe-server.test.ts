import { afterEach, describe, expect, it, vi } from 'vitest';

import { probeServer } from '@/shared/connection/probe-server';

const health = {
  status: 'ok',
  service: 'distrisoft-api',
  timestamp: '2026-10-15T12:00:00.000Z',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('probeServer', () => {
  const base = 'https://servidor.ejemplo/api';

  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts health and readiness without sending a token', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (String(url).endsWith('/health/ready')) {
        return jsonResponse({ status: 'ok', database: 'ok' });
      }
      return jsonResponse(health);
    });

    const result = await probeServer(base, {
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(result).toEqual({ kind: 'available' });
    const init = (fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect(init.credentials).toBe('omit');
    expect(init.headers).toEqual({ Accept: 'application/json' });
    expect(JSON.stringify(init)).not.toMatch(/authorization|bearer|token/i);
  });

  it('rejects HTML and reports a database that is down', async () => {
    const html = vi.fn(
      async () =>
        new Response('<html><body>ok</body></html>', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
    );
    await expect(
      probeServer(base, { fetchImpl: html as typeof fetch }),
    ).resolves.toEqual({ kind: 'incompatible' });

    const down = vi.fn(async (url: string) => {
      if (String(url).endsWith('/health/ready')) {
        return jsonResponse(
          { errorCode: 'SERVICE_UNAVAILABLE', message: 'La base no responde.' },
          503,
        );
      }
      return jsonResponse(health);
    });
    await expect(
      probeServer(base, { fetchImpl: down as typeof fetch }),
    ).resolves.toEqual({ kind: 'database-unavailable' });
  });

  it('reports timeout, TLS, CORS and mixed content', async () => {
    vi.useFakeTimers();
    const hanging = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const error = new Error('aborted');
            error.name = 'AbortError';
            reject(error);
          });
        }),
    );
    const pending = probeServer(base, {
      fetchImpl: hanging as typeof fetch,
      timeoutMs: 8000,
    });
    await vi.advanceTimersByTimeAsync(8000);
    await expect(pending).resolves.toEqual({ kind: 'timeout' });
    vi.useRealTimers();

    const tls = vi.fn(async () => {
      throw new Error('SSL certificate problem');
    });
    await expect(
      probeServer(base, { fetchImpl: tls as typeof fetch }),
    ).resolves.toEqual({ kind: 'tls' });

    const cors = vi.fn(async () => {
      throw new TypeError('CORS blocked');
    });
    await expect(
      probeServer(base, { fetchImpl: cors as typeof fetch }),
    ).resolves.toEqual({ kind: 'cors' });

    const fetchImpl = vi.fn();
    await expect(
      probeServer('http://127.0.0.1:3010/api', {
        pageProtocol: 'https:',
        fetchImpl: fetchImpl as typeof fetch,
      }),
    ).resolves.toEqual({ kind: 'mixed-content' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

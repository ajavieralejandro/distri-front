import { env } from '@/app/config/env';
import {
  expireApiSession,
  readAccessTokenFor,
  readRefreshTokenFor,
  writeApiTokens,
} from '@/features/auth/api-session';
import { HttpError } from '@/shared/api/http-error';
import {
  getActiveApiBaseUrl,
  resolveHttpBaseUrl,
} from '@/shared/connection/connection-store';
import {
  CancelledRequestError,
  requestGeneration,
  requestSignal,
  throwIfStale,
} from '@/shared/connection/request-scope';

export type HttpRequestOptions = {
  signal?: AbortSignal;
  headers?: HeadersInit;
  auth?: boolean;
};

type HttpClient = {
  get: <TResponse>(
    path: string,
    options?: HttpRequestOptions,
  ) => Promise<TResponse>;
  post: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: HttpRequestOptions,
  ) => Promise<TResponse>;
  put: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: HttpRequestOptions,
  ) => Promise<TResponse>;
  patch: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: HttpRequestOptions,
  ) => Promise<TResponse>;
  delete: <TResponse>(
    path: string,
    options?: HttpRequestOptions,
  ) => Promise<TResponse>;
};

type HttpAuth = {
  mockDataSource: boolean;
  resolveBaseUrl: () => string;
  readAccessToken: (apiBaseUrl: string) => string | null;
  readRefreshToken: (apiBaseUrl: string) => string | null;
  writeTokens: (
    apiBaseUrl: string,
    tokens: { accessToken: string; refreshToken: string },
  ) => void;
  expireSession: () => void;
};

type InternalOptions = HttpRequestOptions & {
  retried?: boolean;
};

function joinUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function pathnameOf(path: string): string {
  const query = path.indexOf('?');
  return query === -1 ? path : path.slice(0, query);
}

function isPublicAuthPath(path: string): boolean {
  const pathname = pathnameOf(path);
  return pathname === '/auth/login' || pathname === '/auth/refresh';
}

async function parseErrorDetails(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return undefined;
    }
  }

  try {
    const text = await response.text();
    return text.length > 0 ? text : undefined;
  } catch {
    return undefined;
  }
}

function extractErrorMessage(details: unknown, fallback: string): string {
  if (typeof details === 'string' && details.trim().length > 0) {
    return details;
  }

  if (details && typeof details === 'object' && 'message' in details) {
    const message = details.message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
    if (Array.isArray(message)) {
      const lines = message.filter(
        (item): item is string =>
          typeof item === 'string' && item.trim().length > 0,
      );
      if (lines.length > 0) {
        return lines.join('\n');
      }
    }
  }

  return fallback;
}

function parseTokenPair(
  payload: unknown,
): { accessToken: string; refreshToken: string } | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const record = payload as Record<string, unknown>;
  if (
    typeof record.accessToken !== 'string' ||
    record.accessToken.length === 0 ||
    typeof record.refreshToken !== 'string' ||
    record.refreshToken.length === 0
  ) {
    return null;
  }
  return {
    accessToken: record.accessToken,
    refreshToken: record.refreshToken,
  };
}

export function createHttpClient(auth: HttpAuth): HttpClient {
  let refreshing: Promise<boolean> | null = null;

  async function performRefresh(
    baseUrl: string,
    signal: AbortSignal,
  ): Promise<boolean> {
    const refreshToken = auth.readRefreshToken(baseUrl);
    if (!refreshToken) {
      return false;
    }

    let response: Response;
    try {
      response = await fetch(joinUrl(baseUrl, '/auth/refresh'), {
        method: 'POST',
        credentials: 'omit',
        signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new CancelledRequestError();
      }
      return false;
    }

    if (!response.ok) {
      return false;
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return false;
    }
    const tokens = parseTokenPair(payload);
    if (!tokens || auth.resolveBaseUrl() !== baseUrl) {
      return false;
    }
    auth.writeTokens(baseUrl, tokens);
    return true;
  }

  function refreshOnce(baseUrl: string, signal: AbortSignal): Promise<boolean> {
    if (!refreshing) {
      refreshing = performRefresh(baseUrl, signal).finally(() => {
        refreshing = null;
      });
    }
    return refreshing;
  }

  async function request<TResponse>(
    method: string,
    path: string,
    body?: unknown,
    options: InternalOptions = {},
  ): Promise<TResponse> {
    const headers = new Headers(options.headers);
    const hasBody = body !== undefined;

    if (hasBody && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }

    const started = requestGeneration();
    const baseUrl = auth.resolveBaseUrl();
    const sendAuth = !auth.mockDataSource && options.auth !== false;
    if (sendAuth && !headers.has('Authorization')) {
      const accessToken = auth.readAccessToken(baseUrl);
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
    }

    let response: Response;
    try {
      response = await fetch(joinUrl(baseUrl, path), {
        method,
        credentials: auth.mockDataSource ? 'include' : 'omit',
        signal: options.signal ?? requestSignal(),
        headers,
        body: hasBody ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      if (
        error instanceof CancelledRequestError ||
        started !== requestGeneration() ||
        (error instanceof Error && error.name === 'AbortError')
      ) {
        throw new CancelledRequestError();
      }
      throw error;
    }

    throwIfStale(started);

    if (response.status === 401 && sendAuth && !isPublicAuthPath(path)) {
      const details = await parseErrorDetails(response);
      throwIfStale(started);
      if (!options.retried) {
        const refreshed = await refreshOnce(
          baseUrl,
          options.signal ?? requestSignal(),
        );
        throwIfStale(started);
        if (refreshed) {
          return request<TResponse>(method, path, body, {
            ...options,
            retried: true,
          });
        }
      }
      auth.expireSession();
      throw new HttpError(
        extractErrorMessage(details, 'La sesión no es válida o venció.'),
        401,
        details,
      );
    }

    if (!response.ok) {
      const details = await parseErrorDetails(response);
      throw new HttpError(
        extractErrorMessage(
          details,
          `Request failed with status ${response.status}`,
        ),
        response.status,
        details,
      );
    }

    if (response.status === 204) {
      throwIfStale(started);
      return undefined as TResponse;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      if (text.length === 0) {
        return undefined as TResponse;
      }

      throw new HttpError(
        'Expected a JSON response from the API',
        response.status,
        text,
      );
    }

    const payload = (await response.json()) as TResponse;
    throwIfStale(started);
    return payload;
  }

  return {
    get: <TResponse>(path: string, options?: HttpRequestOptions) =>
      request<TResponse>('GET', path, undefined, options),
    post: <TResponse, TBody = unknown>(
      path: string,
      body?: TBody,
      options?: HttpRequestOptions,
    ) => request<TResponse>('POST', path, body, options),
    put: <TResponse, TBody = unknown>(
      path: string,
      body?: TBody,
      options?: HttpRequestOptions,
    ) => request<TResponse>('PUT', path, body, options),
    patch: <TResponse, TBody = unknown>(
      path: string,
      body?: TBody,
      options?: HttpRequestOptions,
    ) => request<TResponse>('PATCH', path, body, options),
    delete: <TResponse>(path: string, options?: HttpRequestOptions) =>
      request<TResponse>('DELETE', path, undefined, options),
  };
}

function resolveActiveBaseUrl(): string {
  return resolveHttpBaseUrl({
    mockDataSource: env.isMockDataSource,
    activeBaseUrl: getActiveApiBaseUrl(),
    envBaseUrl: env.apiUrl,
  });
}

export const httpClient = createHttpClient({
  mockDataSource: env.isMockDataSource,
  resolveBaseUrl: resolveActiveBaseUrl,
  readAccessToken: readAccessTokenFor,
  readRefreshToken: readRefreshTokenFor,
  writeTokens: writeApiTokens,
  expireSession: expireApiSession,
});

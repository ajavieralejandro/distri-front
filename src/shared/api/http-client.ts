import { env } from '@/app/config/env';
import { HttpError } from '@/shared/api/http-error';

export type HttpRequestOptions = {
  signal?: AbortSignal;
  headers?: HeadersInit;
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

function joinUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
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

  if (
    details &&
    typeof details === 'object' &&
    'message' in details &&
    typeof details.message === 'string' &&
    details.message.trim().length > 0
  ) {
    return details.message;
  }

  return fallback;
}

/**
 * Handles auth-related status codes without side effects yet.
 * Session redirect will be added when the API implements authentication.
 */
function handleAuthStatus(status: number): void {
  if (status === 401 || status === 403) {
    // Intentionally no-op in Stage 1.
  }
}

async function request<TResponse>(
  method: string,
  path: string,
  body?: unknown,
  options: HttpRequestOptions = {},
): Promise<TResponse> {
  const headers = new Headers(options.headers);
  const hasBody = body !== undefined;

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const response = await fetch(joinUrl(env.apiUrl, path), {
    method,
    credentials: 'include',
    signal: options.signal,
    headers,
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  handleAuthStatus(response.status);

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

  return (await response.json()) as TResponse;
}

export const httpClient: HttpClient = {
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

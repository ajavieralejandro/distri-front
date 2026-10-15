export const API_URL_EXAMPLE = 'https://servidor.ejemplo';

export const API_URL_HELP =
  'Ejemplo: https://servidor.ejemplo o https://servidor.ejemplo/api. Si no termina en /api, se agrega una sola vez. Los servicios llaman a /health, /auth y /orders sobre esa base.';

export type ApiUrlIssue =
  | 'empty'
  | 'invalid'
  | 'protocol'
  | 'cleartext'
  | 'userinfo'
  | 'query'
  | 'fragment'
  | 'host'
  | 'port'
  | 'path';

export class ApiUrlError extends Error {
  readonly issue: ApiUrlIssue;

  constructor(message: string, issue: ApiUrlIssue) {
    super(message);
    this.name = 'ApiUrlError';
    this.issue = issue;
  }
}

export type NormalizeApiUrlOptions = {
  allowCleartext: boolean;
};

/**
 * Services append /health, /auth and /orders to a base that already includes
 * /api. The stored value is always protocol://host[:port]/api.
 */
export function normalizeApiBaseUrl(
  raw: string,
  options: NormalizeApiUrlOptions,
): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new ApiUrlError('Escribí la dirección del servidor.', 'empty');
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new ApiUrlError(
      `La dirección no es una URL válida. Ejemplo: ${API_URL_EXAMPLE}`,
      'invalid',
    );
  }

  if (url.username || url.password) {
    throw new ApiUrlError(
      'La dirección no puede incluir usuario ni contraseña.',
      'userinfo',
    );
  }
  if (url.search) {
    throw new ApiUrlError(
      'La dirección no puede incluir parámetros de consulta.',
      'query',
    );
  }
  if (url.hash) {
    throw new ApiUrlError(
      'La dirección no puede incluir un fragmento.',
      'fragment',
    );
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new ApiUrlError('El protocolo tiene que ser https://.', 'protocol');
  }
  if (url.protocol === 'http:' && !options.allowCleartext) {
    throw new ApiUrlError(
      'HTTP solo está habilitado en la variante de pruebas internas. Esta compilación exige https://.',
      'cleartext',
    );
  }
  if (!url.hostname) {
    throw new ApiUrlError('Falta el host.', 'host');
  }
  if (url.port) {
    const port = Number(url.port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new ApiUrlError(
        'El puerto tiene que estar entre 1 y 65535.',
        'port',
      );
    }
  }

  const path = url.pathname.replace(/\/+$/, '');
  if (path !== '' && path !== '/api') {
    throw new ApiUrlError(
      'La ruta solo puede estar vacía o ser /api. Otra ruta no coincide con los servicios.',
      'path',
    );
  }

  const host = url.hostname.includes(':') ? `[${url.hostname}]` : url.hostname;
  const portSuffix = url.port ? `:${url.port}` : '';
  return `${url.protocol}//${host}${portSuffix}/api`;
}

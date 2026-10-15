export const PROBE_TIMEOUT_MS = 8_000;

export type ProbeResult =
  | { kind: 'available' }
  | { kind: 'database-unavailable' }
  | { kind: 'timeout' }
  | { kind: 'network' }
  | { kind: 'tls' }
  | { kind: 'cors' }
  | { kind: 'mixed-content' }
  | { kind: 'incompatible' };

type JsonBody = { kind: 'json'; status: number; body: unknown };
type IncompatibleBody = { kind: 'incompatible' };

export type ProbeServerOptions = {
  signal?: AbortSignal;
  pageProtocol?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

export function describeProbeResult(result: ProbeResult): string {
  switch (result.kind) {
    case 'available':
      return 'API disponible. Esta comprobación no valida el ingreso ni los pedidos.';
    case 'database-unavailable':
      return 'API disponible, pero la base de datos no responde. Esta comprobación no valida el ingreso ni los pedidos.';
    case 'timeout':
      return 'La comprobación superó el tiempo de espera.';
    case 'network':
      return 'Error de red. No se pudo contactar el servidor.';
    case 'tls':
      return 'Falló la validación TLS del certificado. No se desactiva esa validación.';
    case 'cors':
      return 'El navegador bloqueó la solicitud por CORS. El servidor tiene que permitir este origen concreto, sin un comodín si acepta credenciales.';
    case 'mixed-content':
      return 'Esta página está en HTTPS y el navegador no permite llamar a una API en HTTP.';
    case 'incompatible':
      return 'La respuesta no es la API de Distrisoft. Un HTML con HTTP 200 no cuenta como API válida.';
  }
}

export async function probeServer(
  baseUrl: string,
  options: ProbeServerOptions = {},
): Promise<ProbeResult> {
  if (options.pageProtocol === 'https:' && baseUrl.startsWith('http://')) {
    return { kind: 'mixed-content' };
  }

  const timeoutMs = options.timeoutMs ?? PROBE_TIMEOUT_MS;
  const controller = new AbortController();
  const onParentAbort = () => controller.abort();
  options.signal?.addEventListener('abort', onParentAbort);
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const health = await readJson(
      `${baseUrl}/health`,
      controller.signal,
      options.fetchImpl ?? globalThis.fetch,
    );
    if (
      health.kind !== 'json' ||
      health.status !== 200 ||
      !isHealthBody(health.body)
    ) {
      return { kind: 'incompatible' };
    }

    const ready = await readJson(
      `${baseUrl}/health/ready`,
      controller.signal,
      options.fetchImpl ?? globalThis.fetch,
    );
    if (ready.kind !== 'json') {
      return { kind: 'incompatible' };
    }
    return classifyReady(ready.status, ready.body);
  } catch (error) {
    if (options.signal?.aborted && !timedOut) {
      throw error;
    }
    return classifyTransport(error, timedOut);
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', onParentAbort);
  }
}

function classifyReady(status: number, body: unknown): ProbeResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { kind: 'incompatible' };
  }
  const record = body as Record<string, unknown>;
  if (status === 200 && record.status === 'ok' && record.database === 'ok') {
    return { kind: 'available' };
  }
  if (status === 503 || record.errorCode === 'SERVICE_UNAVAILABLE') {
    return { kind: 'database-unavailable' };
  }
  if (typeof record.database === 'string' && record.database !== 'ok') {
    return { kind: 'database-unavailable' };
  }
  return { kind: 'incompatible' };
}

function isHealthBody(body: unknown): boolean {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return false;
  }
  const record = body as Record<string, unknown>;
  return (
    record.status === 'ok' &&
    typeof record.service === 'string' &&
    record.service.length > 0 &&
    typeof record.timestamp === 'string' &&
    record.timestamp.length > 0
  );
}

async function readJson(
  url: string,
  signal: AbortSignal,
  fetchImpl: typeof fetch,
): Promise<JsonBody | IncompatibleBody> {
  const response = await fetchImpl(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'omit',
    signal,
  });
  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();
  if (looksLikeHtml(text, contentType)) {
    return { kind: 'incompatible' };
  }
  if (!text.trim()) {
    return { kind: 'incompatible' };
  }
  try {
    const body = JSON.parse(text) as unknown;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return { kind: 'incompatible' };
    }
    return { kind: 'json', status: response.status, body };
  } catch {
    return { kind: 'incompatible' };
  }
}

function looksLikeHtml(text: string, contentType: string): boolean {
  if (contentType.toLowerCase().includes('text/html')) {
    return true;
  }
  const trimmed = text.trimStart().toLowerCase();
  return trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html');
}

function classifyTransport(error: unknown, timedOut: boolean): ProbeResult {
  if (timedOut) {
    return { kind: 'timeout' };
  }
  const message = error instanceof Error ? error.message : '';
  if (/certificate|ssl|tls|certificado/i.test(message)) {
    return { kind: 'tls' };
  }
  if (/cors|cross-origin|origen cruzado/i.test(message)) {
    return { kind: 'cors' };
  }
  return { kind: 'network' };
}

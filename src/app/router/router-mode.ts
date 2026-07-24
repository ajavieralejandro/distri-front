export type RouterMode = 'browser' | 'hash';

/**
 * Central router mode selection for SPA hosting.
 * GitHub Pages uses hash routing because it lacks SPA rewrites.
 */
export function resolveRouterMode(
  configured: string | undefined,
  baseUrl: string,
): RouterMode {
  if (configured === 'hash' || configured === 'browser') {
    return configured;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return normalizedBase !== '/' ? 'hash' : 'browser';
}

export function getRouterMode(): RouterMode {
  return resolveRouterMode(
    import.meta.env.VITE_ROUTER_MODE,
    import.meta.env.BASE_URL,
  );
}

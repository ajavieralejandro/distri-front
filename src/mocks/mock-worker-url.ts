/**
 * Resolves the MSW worker URL under Vite `base` (e.g. `/distri-front/`).
 */
export function getMockServiceWorkerUrl(baseUrl: string): string {
  const normalized = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalized}mockServiceWorker.js`;
}

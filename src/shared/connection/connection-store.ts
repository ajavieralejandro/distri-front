import { env } from '@/app/config/env';
import { normalizeApiBaseUrl } from '@/shared/connection/api-url';

export const API_BASE_URL_STORAGE_KEY = 'distrisoft-api-base-url';

let override: string | null = readStoredOverride();

export function allowsCleartextHttp(): boolean {
  return env.allowCleartextHttp;
}

export function initialApiBaseUrl(): string | null {
  try {
    return normalizeApiBaseUrl(env.apiUrl, {
      allowCleartext: allowsCleartextHttp(),
    });
  } catch {
    return null;
  }
}

export function peekApiBaseOverride(): string | null {
  return override;
}

export function readActiveBaseUrl(): string | null {
  return override ?? initialApiBaseUrl();
}

export function getActiveApiBaseUrl(): string | null {
  return readActiveBaseUrl();
}

export function resolveHttpBaseUrl(input: {
  mockDataSource: boolean;
  activeBaseUrl: string | null;
  envBaseUrl: string;
}): string {
  if (input.mockDataSource) {
    return input.envBaseUrl.replace(/\/$/, '');
  }
  if (!input.activeBaseUrl) {
    throw new Error(
      'Falta la dirección de la API. No se usan datos de demostración.',
    );
  }
  return input.activeBaseUrl;
}

export async function hydrateConnection(): Promise<void> {
  override = readStoredOverride();
}

export function persistApiBaseUrl(baseUrl: string): void {
  override = baseUrl;
  window.localStorage.setItem(API_BASE_URL_STORAGE_KEY, baseUrl);
}

export function clearStoredApiBaseUrl(): void {
  override = null;
  window.localStorage.removeItem(API_BASE_URL_STORAGE_KEY);
}

export function forgetConnectionMemory(): void {
  override = null;
}

export function resetConnectionState(): void {
  override = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(API_BASE_URL_STORAGE_KEY);
  }
}

function readStoredOverride(): string | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  const stored = window.localStorage.getItem(API_BASE_URL_STORAGE_KEY);
  if (!stored) {
    return null;
  }
  try {
    return normalizeApiBaseUrl(stored, {
      allowCleartext: env.allowCleartextHttp,
    });
  } catch {
    return null;
  }
}

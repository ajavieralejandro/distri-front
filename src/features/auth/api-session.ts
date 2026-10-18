export type ApiRole = 'ADMIN' | 'COMMERCE';

export type ApiUser = {
  userId: string;
  role: ApiRole;
  displayName: string;
  email: string;
  commerceId: string | null;
};

export type ApiTokenPair = {
  accessToken: string;
  refreshToken: string;
};

type StoredTokens = ApiTokenPair & {
  apiBaseUrl: string;
};

export const API_USER_STORAGE_KEY = 'distrisoft-api-session';
export const API_TOKEN_STORAGE_KEY = 'distrisoft-api-tokens';
const AUTH_NOTICE_KEY = 'distrisoft-auth-notice';

const listeners = new Set<() => void>();
let cachedUserRaw: string | null | undefined;
let cachedUser: ApiUser | null = null;

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeApiSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function storage(): Storage | null {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return null;
  }
  return window.sessionStorage;
}

export function parseApiUser(value: unknown): ApiUser | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.userId !== 'string' ||
    (record.role !== 'ADMIN' && record.role !== 'COMMERCE') ||
    typeof record.displayName !== 'string' ||
    typeof record.email !== 'string' ||
    !(record.commerceId === null || typeof record.commerceId === 'string')
  ) {
    return null;
  }
  return {
    userId: record.userId,
    role: record.role,
    displayName: record.displayName,
    email: record.email,
    commerceId: record.commerceId,
  };
}

export function parseLoginPayload(payload: unknown): {
  user: ApiUser;
  tokens: ApiTokenPair;
} {
  if (!payload || typeof payload !== 'object') {
    throw new Error('La API no devolvió una sesión reconocible.');
  }
  const record = payload as Record<string, unknown>;
  const user = parseApiUser(record.user);
  const tokens = record.tokens;
  if (!user || !tokens || typeof tokens !== 'object') {
    throw new Error('La API no devolvió una sesión reconocible.');
  }
  const tokenRecord = tokens as Record<string, unknown>;
  if (
    typeof tokenRecord.accessToken !== 'string' ||
    tokenRecord.accessToken.length === 0 ||
    typeof tokenRecord.refreshToken !== 'string' ||
    tokenRecord.refreshToken.length === 0
  ) {
    throw new Error('La API no devolvió una sesión reconocible.');
  }
  return {
    user,
    tokens: {
      accessToken: tokenRecord.accessToken,
      refreshToken: tokenRecord.refreshToken,
    },
  };
}

export function readApiUser(): ApiUser | null {
  const store = storage();
  if (!store) {
    return null;
  }
  const raw = store.getItem(API_USER_STORAGE_KEY);
  if (raw === cachedUserRaw) {
    return cachedUser;
  }
  cachedUserRaw = raw;
  if (!raw) {
    cachedUser = null;
    return null;
  }
  try {
    cachedUser = parseApiUser(JSON.parse(raw));
  } catch {
    cachedUser = null;
  }
  return cachedUser;
}

export function writeApiUser(user: ApiUser): void {
  const store = storage();
  if (!store) {
    return;
  }
  const raw = JSON.stringify(user);
  store.setItem(API_USER_STORAGE_KEY, raw);
  cachedUserRaw = raw;
  cachedUser = user;
  emit();
}

function readStoredTokens(): StoredTokens | null {
  const store = storage();
  if (!store) {
    return null;
  }
  const raw = store.getItem(API_TOKEN_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredTokens>;
    if (
      typeof parsed.accessToken !== 'string' ||
      typeof parsed.refreshToken !== 'string' ||
      typeof parsed.apiBaseUrl !== 'string' ||
      parsed.accessToken.length === 0 ||
      parsed.refreshToken.length === 0
    ) {
      return null;
    }
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      apiBaseUrl: parsed.apiBaseUrl,
    };
  } catch {
    return null;
  }
}

export function hasApiCredentials(): boolean {
  return readApiUser() !== null || readStoredTokens() !== null;
}

export function readAccessTokenFor(apiBaseUrl: string): string | null {
  const tokens = readStoredTokens();
  if (!tokens || tokens.apiBaseUrl !== apiBaseUrl) {
    return null;
  }
  return tokens.accessToken;
}

export function readRefreshTokenFor(apiBaseUrl: string): string | null {
  const tokens = readStoredTokens();
  if (!tokens || tokens.apiBaseUrl !== apiBaseUrl) {
    return null;
  }
  return tokens.refreshToken;
}

export function writeApiTokens(apiBaseUrl: string, tokens: ApiTokenPair): void {
  const store = storage();
  if (!store) {
    return;
  }
  const stored: StoredTokens = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    apiBaseUrl,
  };
  store.setItem(API_TOKEN_STORAGE_KEY, JSON.stringify(stored));
}

export function clearApiSession(): void {
  const store = storage();
  store?.removeItem(API_USER_STORAGE_KEY);
  store?.removeItem(API_TOKEN_STORAGE_KEY);
  cachedUserRaw = null;
  cachedUser = null;
  emit();
}

export function expireApiSession(): void {
  if (!hasApiCredentials()) {
    return;
  }
  storage()?.setItem(AUTH_NOTICE_KEY, 'expired');
  clearApiSession();
}

export function peekAuthNotice(): 'expired' | null {
  const notice = storage()?.getItem(AUTH_NOTICE_KEY);
  return notice === 'expired' ? 'expired' : null;
}

export function consumeAuthNotice(): void {
  storage()?.removeItem(AUTH_NOTICE_KEY);
}

import { DEMO_ROLES, type DemoSession } from '@/shared/types/demo';

export const DEMO_SESSION_KEY = 'distrisoft-demo-session-v2';

let cachedRaw: string | null | undefined;
let cachedSession: DemoSession | null = null;
const listeners = new Set<() => void>();

function emitSessionChange(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeDemoSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function parseSession(raw: string | null): DemoSession | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as DemoSession;
    if (
      typeof parsed.userId !== 'string' ||
      !DEMO_ROLES.includes(parsed.role) ||
      typeof parsed.displayName !== 'string' ||
      typeof parsed.email !== 'string'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function readDemoSession(): DemoSession | null {
  if (
    typeof window === 'undefined' ||
    typeof window.sessionStorage === 'undefined'
  ) {
    return null;
  }

  const raw = window.sessionStorage.getItem(DEMO_SESSION_KEY);
  if (raw === cachedRaw) {
    return cachedSession;
  }

  cachedRaw = raw;
  cachedSession = parseSession(raw);
  return cachedSession;
}

export function writeDemoSession(session: DemoSession): void {
  const raw = JSON.stringify(session);
  window.sessionStorage.setItem(DEMO_SESSION_KEY, raw);
  cachedRaw = raw;
  cachedSession = session;
  emitSessionChange();
}

export function clearDemoSession(): void {
  window.sessionStorage.removeItem(DEMO_SESSION_KEY);
  cachedRaw = null;
  cachedSession = null;
  emitSessionChange();
}

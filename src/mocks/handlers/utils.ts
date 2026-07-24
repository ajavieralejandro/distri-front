import { delay } from 'msw';

import { env } from '@/app/config/env';
import type { DemoAuditEvent, DemoDatabase } from '@/shared/types/demo';

export const api = (path: string): string =>
  `${env.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;

export async function withLatency(): Promise<void> {
  if (env.appEnv === 'test') {
    return;
  }

  await delay(200 + Math.floor(Math.random() * 200));
}

export function appendAudit(
  database: DemoDatabase,
  event: Omit<DemoAuditEvent, 'id' | 'createdAt'> &
    Partial<Pick<DemoAuditEvent, 'id' | 'createdAt'>>,
): DemoAuditEvent {
  const { id, createdAt, ...details } = event;
  const auditEvent: DemoAuditEvent = {
    id: id ?? `audit-${database.auditEvents.length + 1}`,
    createdAt: createdAt ?? new Date().toISOString(),
    ...details,
  };
  database.auditEvents.unshift(auditEvent);
  return auditEvent;
}

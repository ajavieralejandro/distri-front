import { httpClient } from '@/shared/api/http-client';
import type { DemoAuditEvent } from '@/shared/types/demo';
export function fetchAudit(signal?: AbortSignal) {
  return httpClient.get<DemoAuditEvent[]>('/audit', { signal });
}

import { httpClient } from '@/shared/api/http-client';
import type { DemoUser } from '@/shared/types/demo';
export type SafeDemoUser = Omit<DemoUser, 'password'>;
export function fetchUsers(signal?: AbortSignal) {
  return httpClient.get<SafeDemoUser[]>('/users', { signal });
}

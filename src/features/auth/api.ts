import { httpClient } from '@/shared/api/http-client';
import type { DemoSession } from '@/shared/types/demo';

import type { LoginFormValues } from './schemas';

export function loginDemo(body: LoginFormValues): Promise<DemoSession> {
  return httpClient.post<DemoSession, LoginFormValues>(
    '/auth/demo/login',
    body,
  );
}

export function logoutDemo(): Promise<void> {
  return httpClient.post<void>('/auth/demo/logout');
}

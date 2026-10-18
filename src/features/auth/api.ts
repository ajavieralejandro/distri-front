import { httpClient } from '@/shared/api/http-client';
import { getActiveApiBaseUrl } from '@/shared/connection/connection-store';
import type { DemoSession } from '@/shared/types/demo';

import {
  parseLoginPayload,
  writeApiTokens,
  writeApiUser,
  type ApiUser,
} from './api-session';
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

export async function loginWithApi(body: LoginFormValues): Promise<ApiUser> {
  const payload = await httpClient.post<unknown, LoginFormValues>(
    '/auth/login',
    body,
    { auth: false },
  );
  const parsed = parseLoginPayload(payload);
  const baseUrl = getActiveApiBaseUrl();
  if (!baseUrl) {
    throw new Error(
      'Falta la dirección de la API. No se usan datos de demostración.',
    );
  }
  writeApiTokens(baseUrl, parsed.tokens);
  writeApiUser(parsed.user);
  return parsed.user;
}

export function logoutApi(): Promise<void> {
  return httpClient.post<void>('/auth/logout');
}

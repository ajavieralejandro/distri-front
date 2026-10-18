import { describe, expect, it } from 'vitest';

import {
  API_TOKEN_STORAGE_KEY,
  API_USER_STORAGE_KEY,
  clearApiSession,
  expireApiSession,
  parseLoginPayload,
  peekAuthNotice,
  readAccessTokenFor,
  readApiUser,
  writeApiTokens,
  writeApiUser,
} from '@/features/auth/api-session';

const user = {
  userId: 'usr-admin',
  role: 'ADMIN' as const,
  displayName: 'Administrador',
  email: 'admin@pruebas.distrisoft.local',
  commerceId: null,
};

describe('api session', () => {
  it('stores the user apart from the tokens', () => {
    const parsed = parseLoginPayload({
      user,
      tokens: {
        accessToken: 'access-secret',
        refreshToken: 'refresh-secret',
        tokenType: 'Bearer',
        expiresIn: 900,
      },
    });
    writeApiTokens('https://api.ejemplo/api', parsed.tokens);
    writeApiUser(parsed.user);

    const storedUser = window.sessionStorage.getItem(API_USER_STORAGE_KEY);
    expect(storedUser).not.toContain('access-secret');
    expect(storedUser).not.toContain('refresh-secret');
    expect(readApiUser()).toEqual(user);
    expect(readAccessTokenFor('https://api.ejemplo/api')).toBe('access-secret');
    expect(readAccessTokenFor('https://otro.ejemplo/api')).toBeNull();
  });

  it('rejects a role the server contract does not define', () => {
    expect(() =>
      parseLoginPayload({
        user: { ...user, role: 'DRIVER' },
        tokens: { accessToken: 'a', refreshToken: 'b' },
      }),
    ).toThrow(/sesión reconocible/);
  });

  it('clears credentials and leaves a notice when the session expires', () => {
    writeApiUser(user);
    writeApiTokens('https://api.ejemplo/api', {
      accessToken: 'access-secret',
      refreshToken: 'refresh-secret',
    });

    expireApiSession();

    expect(readApiUser()).toBeNull();
    expect(window.sessionStorage.getItem(API_TOKEN_STORAGE_KEY)).toBeNull();
    expect(peekAuthNotice()).toBe('expired');
    clearApiSession();
  });
});

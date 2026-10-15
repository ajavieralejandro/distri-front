import { describe, expect, it } from 'vitest';

import { ApiUrlError, normalizeApiBaseUrl } from '@/shared/connection/api-url';
import { cleartextAllowed } from '@/app/config/env';

describe('normalizeApiBaseUrl', () => {
  const https = { allowCleartext: false };
  const internal = { allowCleartext: true };

  it('adds /api once and drops a trailing slash', () => {
    expect(normalizeApiBaseUrl('https://servidor.ejemplo', https)).toBe(
      'https://servidor.ejemplo/api',
    );
    expect(normalizeApiBaseUrl('https://servidor.ejemplo/api/', https)).toBe(
      'https://servidor.ejemplo/api',
    );
    expect(
      normalizeApiBaseUrl('https://servidor.ejemplo:8443/api', https),
    ).toBe('https://servidor.ejemplo:8443/api');
  });

  it('rejects secrets, query, fragment and an incompatible path', () => {
    expect(() =>
      normalizeApiBaseUrl('https://user:secret@servidor.ejemplo/api', https),
    ).toThrow(ApiUrlError);
    expect(() =>
      normalizeApiBaseUrl('https://servidor.ejemplo/api?token=1', https),
    ).toThrow(/consulta/);
    expect(() =>
      normalizeApiBaseUrl('https://servidor.ejemplo/api#sesion', https),
    ).toThrow(/fragmento/);
    expect(() =>
      normalizeApiBaseUrl('https://servidor.ejemplo/api/api', https),
    ).toThrow(/\/api/);
  });

  it('allows HTTP only when the caller permits cleartext', () => {
    expect(() => normalizeApiBaseUrl('http://127.0.0.1:3010', https)).toThrow(
      /pruebas internas/,
    );
    expect(normalizeApiBaseUrl('http://127.0.0.1:3010/api', internal)).toBe(
      'http://127.0.0.1:3010/api',
    );
    expect(cleartextAllowed('production', true)).toBe(false);
    expect(cleartextAllowed('development', true)).toBe(true);
    expect(cleartextAllowed('staging', false)).toBe(false);
  });
});

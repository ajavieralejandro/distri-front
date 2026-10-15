import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { writeDemoSession, readDemoSession } from '@/features/auth/session';
import { ConnectionPage } from '@/features/connection/ConnectionPage';
import {
  getActiveApiBaseUrl,
  API_BASE_URL_STORAGE_KEY,
} from '@/shared/connection/connection-store';
import { renderWithProviders } from '@/test/render-with-providers';

describe('connection page', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('probes the typed address without saving it', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).endsWith('/health/ready')) {
        return json({ status: 'ok', database: 'ok' });
      }
      return json({
        status: 'ok',
        service: 'distrisoft-api',
        timestamp: '2026-10-15T12:00:00.000Z',
      });
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<ConnectionPage />);

    fireEvent.change(screen.getByLabelText('Dirección del servidor'), {
      target: { value: 'https://otro.ejemplo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Probar conexión' }));

    expect(await screen.findByText(/API disponible/)).toBeInTheDocument();
    expect(getActiveApiBaseUrl()).toBe('http://localhost:3000/api');
    expect(window.localStorage.getItem(API_BASE_URL_STORAGE_KEY)).toBeNull();
    const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect(init.credentials).toBe('omit');
    expect(JSON.stringify(init.headers)).not.toMatch(/authorization|bearer/i);
  });

  it('keeps the session when the change is cancelled', async () => {
    writeDemoSession({
      userId: 'user-1',
      role: 'COMMERCE_OWNER',
      displayName: 'Norte',
      email: 'norte@pruebas.distrisoft.local',
    });
    renderWithProviders(<ConnectionPage />);
    fireEvent.change(screen.getByLabelText('Dirección del servidor'), {
      target: { value: 'https://nuevo.ejemplo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText(/cambiar de entorno/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(readDemoSession()?.displayName).toBe('Norte');
    expect(getActiveApiBaseUrl()).toBe('http://localhost:3000/api');

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirmar' }));
    expect(getActiveApiBaseUrl()).toBe('https://nuevo.ejemplo/api');
    expect(readDemoSession()).toBeNull();
  });
});

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

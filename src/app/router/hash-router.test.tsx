import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { App } from '@/app/App';
import { createQueryClient } from '@/app/providers/query-client';
import { writeDemoSession } from '@/features/auth/session';
import { renderWithProviders } from '@/test/render-with-providers';

describe('hash router compatibility', () => {
  it('resolves /login under HashRouter', () => {
    window.location.hash = '#/login';
    const queryClient = createQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <App />
        </HashRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole('heading', { name: 'Ingresar a Distrisoft' }),
    ).toBeInTheDocument();
  });

  it('resolves a protected admin route under HashRouter', async () => {
    writeDemoSession({
      userId: 'usr-admin',
      role: 'DISTRIBUTOR_ADMIN',
      displayName: 'Admin Demo',
      email: 'admin@demo.distrisoft.local',
      distributorId: 'dist-1',
    });
    window.location.hash = '#/admin/dashboard';
    const queryClient = createQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <App />
        </HashRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole('heading', { name: /panel general/i }),
    ).toBeInTheDocument();
  });

  it('shows 404 for unknown routes', () => {
    renderWithProviders(<App />, { route: '/ruta-desconocida' });

    expect(
      screen.getByRole('heading', { name: 'Página no encontrada' }),
    ).toBeInTheDocument();
  });
});

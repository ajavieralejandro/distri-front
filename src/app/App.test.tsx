import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '@/app/App';
import { writeDemoSession } from '@/features/auth/session';
import { renderWithProviders } from '@/test/render-with-providers';

describe('App', () => {
  it('renders the demo login screen', () => {
    renderWithProviders(<App />, { route: '/login' });

    expect(
      screen.getByRole('heading', { name: 'Inicio de sesión' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/cuenta demo/i)).toBeInTheDocument();
  });

  it('redirects "/" to "/login"', async () => {
    renderWithProviders(<App />, { route: '/' });

    expect(
      await screen.findByRole('heading', { name: 'Inicio de sesión' }),
    ).toBeInTheDocument();
  });

  it('redirects unauthenticated admin routes to login', async () => {
    renderWithProviders(<App />, { route: '/admin/dashboard' });

    expect(
      await screen.findByRole('heading', { name: 'Inicio de sesión' }),
    ).toBeInTheDocument();
  });

  it('renders admin dashboard when demo admin session exists', async () => {
    writeDemoSession({
      userId: 'usr-1',
      role: 'ADMIN',
      displayName: 'Admin Demo',
      email: 'admin@demo.distrisoft.local',
    });

    renderWithProviders(<App />, { route: '/admin/dashboard' });

    expect(
      await screen.findByRole('navigation', {
        name: 'Navegación administrativa',
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /dashboard/i }),
    ).toBeInTheDocument();
  });

  it('renders the not found page for unknown routes', () => {
    renderWithProviders(<App />, { route: '/ruta-inexistente' });

    expect(
      screen.getByRole('heading', { name: 'Página no encontrada' }),
    ).toBeInTheDocument();
  });
});

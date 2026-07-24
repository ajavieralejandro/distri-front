import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '@/app/App';
import { renderWithProviders } from '@/test/render-with-providers';

describe('App', () => {
  it('renders the login screen as the main entry experience', () => {
    renderWithProviders(<App />, { route: '/login' });

    expect(
      screen.getByRole('heading', { name: 'Inicio de sesión' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/pendiente de la etapa de autenticación/i),
    ).toBeInTheDocument();
  });

  it('redirects "/" to "/login"', async () => {
    renderWithProviders(<App />, { route: '/' });

    expect(
      await screen.findByText(/pendiente de la etapa de autenticación/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Inicio de sesión' }),
    ).toBeInTheDocument();
  });

  it('renders the administrative layout and dashboard placeholder', async () => {
    renderWithProviders(<App />, { route: '/admin/dashboard' });

    expect(
      screen.getByRole('navigation', { name: 'Navegación administrativa' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument();
  });

  it('renders the not found page for unknown routes', () => {
    renderWithProviders(<App />, { route: '/ruta-inexistente' });

    expect(
      screen.getByRole('heading', { name: 'Página no encontrada' }),
    ).toBeInTheDocument();
  });
});

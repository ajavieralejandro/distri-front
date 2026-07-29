import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { DEMO_SESSION_KEY, readDemoSession } from '@/features/auth/session';
import { LoginPage } from '@/pages/LoginPage';
import { renderWithProviders } from '@/test/render-with-providers';

describe('simplified demo login', () => {
  it('renders only administrator and commerce profiles', () => {
    renderWithProviders(<LoginPage />, { route: '/login' });

    expect(
      screen.getByRole('heading', { name: 'Ingresar a Distrisoft' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('listbox', { name: 'Perfiles demo' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Administrador' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Comercio' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Operaciones' })).toBeNull();
    expect(screen.queryByText('Preparador')).toBeNull();
    expect(screen.queryByText('Repartidor')).toBeNull();
  });

  it('logs in as administrator from profile card', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });

    await user.click(
      screen.getByRole('button', { name: 'Entrar como administrador' }),
    );

    await waitFor(() =>
      expect(readDemoSession()?.role).toBe('DISTRIBUTOR_ADMIN'),
    );
    expect(window.sessionStorage.getItem(DEMO_SESSION_KEY)).not.toBeNull();
  });

  it('logs in as commerce from profile card', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });

    await user.click(
      screen.getByRole('button', { name: 'Entrar como comercio' }),
    );

    await waitFor(() =>
      expect(readDemoSession()?.role).toBe('COMMERCE_OWNER'),
    );
  });

  it('supports manual form login for commerce', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });

    await user.click(
      screen.getByRole('button', { name: 'Usar correo y contraseña' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Completar credenciales del rol' }),
    );

    expect(screen.getByLabelText('Correo')).toHaveValue(
      'admin@demo.distrisoft.local',
    );

    await user.clear(screen.getByLabelText('Correo'));
    await user.type(
      screen.getByLabelText('Correo'),
      'comercio@demo.distrisoft.local',
    );
    await user.clear(screen.getByLabelText('Contraseña'));
    await user.type(screen.getByLabelText('Contraseña'), 'demo1234');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() =>
      expect(readDemoSession()?.role).toBe('COMMERCE_OWNER'),
    );
  });
});

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { DEMO_SESSION_KEY, readDemoSession } from '@/features/auth/session';
import { LoginPage } from '@/pages/LoginPage';
import { renderWithProviders } from '@/test/render-with-providers';

describe('redesigned demo login', () => {
  it('renders experience categories', () => {
    renderWithProviders(<LoginPage />, { route: '/login' });

    expect(
      screen.getByRole('heading', { name: 'Ingresar a Distrisoft' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Distribuidora' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Operaciones' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Comercio' })).toBeInTheDocument();
  });

  it('switches categories and only shows matching roles', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });

    expect(
      within(screen.getByRole('tabpanel')).getByRole('heading', {
        name: 'Administrador',
      }),
    ).toBeVisible();
    expect(
      within(screen.getByRole('tabpanel')).queryByRole('heading', {
        name: 'Preparador',
      }),
    ).toBeNull();

    await user.click(screen.getByRole('tab', { name: 'Operaciones' }));
    expect(
      within(screen.getByRole('tabpanel')).getByRole('heading', {
        name: 'Preparador',
      }),
    ).toBeVisible();
    expect(
      within(screen.getByRole('tabpanel')).getByRole('heading', {
        name: 'Cajero',
      }),
    ).toBeVisible();
    expect(
      within(screen.getByRole('tabpanel')).getByRole('heading', {
        name: 'Repartidor',
      }),
    ).toBeVisible();
    expect(
      within(screen.getByRole('tabpanel')).queryByRole('heading', {
        name: 'Administrador',
      }),
    ).toBeNull();

    await user.click(screen.getByRole('tab', { name: 'Comercio' }));
    expect(
      within(screen.getByRole('tabpanel')).getByRole('heading', {
        name: 'Dueño de comercio',
      }),
    ).toBeVisible();
    expect(
      within(screen.getByRole('tabpanel')).getByRole('heading', {
        name: 'Comprador',
      }),
    ).toBeVisible();
    expect(
      within(screen.getByRole('tabpanel')).getByRole('heading', {
        name: 'Cajero de comercio',
      }),
    ).toBeVisible();
  });

  it('updates role details when selecting a role', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });

    await user.click(screen.getByRole('tab', { name: 'Operaciones' }));
    expect(
      screen.getByRole('button', { name: 'Entrar como Preparador' }),
    ).toBeInTheDocument();

    const cashierCard = within(screen.getByRole('tabpanel'))
      .getByRole('heading', { name: 'Cajero' })
      .closest('article');
    expect(cashierCard).not.toBeNull();
    await user.click(
      within(cashierCard as HTMLElement).getByRole('button', {
        name: 'Elegir rol',
      }),
    );

    expect(
      screen.getByRole('button', { name: 'Entrar como Cajero' }),
    ).toBeInTheDocument();

    const details = screen.getByRole('region', {
      name: 'Detalle del rol seleccionado',
    });
    expect(
      within(details).getByText(/Registrar cobros demostrativos/i),
    ).toBeVisible();
    expect(
      within(details).getByText(/No modifica productos ni stock/i),
    ).toBeVisible();
  });

  it('fills credentials for the selected role', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });

    await user.click(screen.getByRole('tab', { name: 'Comercio' }));
    await user.click(
      screen.getByRole('button', { name: 'Completar credenciales del rol' }),
    );

    expect(screen.getByLabelText('Correo')).toHaveValue(
      'comercio@demo.distrisoft.local',
    );
    expect(screen.getByLabelText('Contraseña')).toHaveValue('demo1234');
  });

  it('logs in through quick access without double sessions', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });

    const quick = screen.getByRole('button', {
      name: 'Entrar como Administrador',
    });
    await user.dblClick(quick);

    await waitFor(() =>
      expect(readDemoSession()?.role).toBe('DISTRIBUTOR_ADMIN'),
    );
    expect(window.sessionStorage.getItem(DEMO_SESSION_KEY)).not.toBeNull();
  });

  it('supports manual form login', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });

    await user.clear(screen.getByLabelText('Correo'));
    await user.type(
      screen.getByLabelText('Correo'),
      'deposito@demo.distrisoft.local',
    );
    await user.clear(screen.getByLabelText('Contraseña'));
    await user.type(screen.getByLabelText('Contraseña'), 'demo1234');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() =>
      expect(readDemoSession()?.role).toBe('WAREHOUSE_PICKER'),
    );
  });

  it('supports keyboard category navigation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });

    const distributor = screen.getByRole('tab', { name: 'Distribuidora' });
    distributor.focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'Operaciones' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      within(screen.getByRole('tabpanel')).getByRole('heading', {
        name: 'Preparador',
      }),
    ).toBeVisible();
  });
});

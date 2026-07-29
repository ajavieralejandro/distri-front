import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { DEMO_SESSION_KEY, readDemoSession } from '@/features/auth/session';
import { LoginPage } from '@/pages/LoginPage';
import { renderWithProviders } from '@/test/render-with-providers';

describe('demo login', () => {
  it('logs in the administrator through quick access', async () => {
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

  it('logs in the commerce owner through profile card', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });

    await user.click(
      screen.getByRole('button', { name: 'Entrar como comercio' }),
    );

    await waitFor(() => expect(readDemoSession()?.role).toBe('COMMERCE_OWNER'));
  });
});

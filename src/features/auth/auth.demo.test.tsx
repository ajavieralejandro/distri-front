import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { DEMO_SESSION_KEY, readDemoSession } from '@/features/auth/session';
import { LoginPage } from '@/pages/LoginPage';
import { renderWithProviders } from '@/test/render-with-providers';

describe('demo login', () => {
  it.each([
    ['Administrador', 'DISTRIBUTOR_ADMIN'],
    ['Dueño', 'COMMERCE_OWNER'],
  ] as const)(
    'logs in the %s account through the UI',
    async (account, role) => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />, { route: '/login' });

      await user.click(
        screen.getByRole('button', { name: new RegExp(`Usar ${account}`) }),
      );
      await user.click(screen.getByRole('button', { name: 'Ingresar' }));

      await waitFor(() => expect(readDemoSession()?.role).toBe(role));
      expect(window.sessionStorage.getItem(DEMO_SESSION_KEY)).not.toBeNull();
    },
  );
});

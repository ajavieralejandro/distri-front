import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { writeDemoSession } from '@/features/auth/session';
import { renderWithProviders } from '@/test/render-with-providers';

import { RequireDemoAuth } from './RequireDemoAuth';

function ProtectedRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<h1>Login</h1>} />
      <Route
        element={<RequireDemoAuth roles={['DISTRIBUTOR_ADMIN', 'SALES']} />}
      >
        <Route path="/admin" element={<h1>Admin</h1>} />
      </Route>
      <Route path="/commerce/dashboard" element={<h1>Commerce</h1>} />
      <Route path="/operations/warehouse" element={<h1>Warehouse</h1>} />
    </Routes>
  );
}

describe('RequireDemoAuth', () => {
  it('redirects unauthenticated visitors to login', async () => {
    renderWithProviders(<ProtectedRoutes />, { route: '/admin' });
    expect(
      await screen.findByRole('heading', { name: 'Login' }),
    ).toBeInTheDocument();
  });

  it('allows an administrator into admin routes', () => {
    writeDemoSession({
      userId: 'usr-admin',
      role: 'DISTRIBUTOR_ADMIN',
      displayName: 'Admin',
      email: 'admin@demo.distrisoft.local',
    });
    renderWithProviders(<ProtectedRoutes />, { route: '/admin' });
    expect(screen.getByRole('heading', { name: 'Admin' })).toBeInTheDocument();
  });

  it('redirects commerce sessions away from admin routes', async () => {
    writeDemoSession({
      userId: 'usr-owner',
      role: 'COMMERCE_OWNER',
      displayName: 'Owner',
      email: 'comercio@demo.distrisoft.local',
      commerceId: 'com-1',
    });
    renderWithProviders(<ProtectedRoutes />, { route: '/admin' });
    expect(
      await screen.findByRole('heading', { name: 'Commerce' }),
    ).toBeInTheDocument();
  });
});

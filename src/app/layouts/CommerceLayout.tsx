import { NavLink, Outlet } from 'react-router-dom';

import { env } from '@/app/config/env';
import { getAppProfileLabel } from '@/features/auth/app-profile';
import { useDemoSession, useLogoutMutation } from '@/features/auth/hooks';
import { hasPermission } from '@/features/auth/permissions';
import { useCartStore } from '@/features/orders/cart-store';
import { ResetDemoButton } from '@/features/demo/ResetDemoButton';
import { ApiStatus } from '@/shared/components/ApiStatus';
import { DemoBanner } from '@/shared/components/DemoBanner';
import type { Permission } from '@/shared/types/demo';

const commerceNavItems: Array<{
  to: string;
  label: string;
  permission?: Permission;
}> = [
  { to: '/commerce/dashboard', label: 'Inicio' },
  { to: '/commerce/catalog', label: 'Catálogo' },
  { to: '/commerce/cart', label: 'Pedido actual' },
  { to: '/commerce/orders', label: 'Mis pedidos' },
  {
    to: '/commerce/account',
    label: 'Cuenta comercial',
    permission: 'accounts:read_own',
  },
  {
    to: '/commerce/profile',
    label: 'Datos del comercio',
  },
];

function navClassName({ isActive }: { isActive: boolean }): string {
  return [
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-teal-700 text-white'
      : 'text-slate-700 hover:bg-teal-50 hover:text-teal-900',
  ].join(' ');
}

export function CommerceLayout() {
  const session = useDemoSession();
  const logout = useLogoutMutation();
  const itemCount = useCartStore((state) => state.getTotalItems());

  return (
    <>
      <DemoBanner />
      <div className="min-h-screen bg-[var(--color-surface)]">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  Distrisoft
                </p>
                <p className="text-sm text-slate-600">Portal del comercio</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span>
                  {session?.displayName} ·{' '}
                  {session ? getAppProfileLabel(session.role) : ''}
                </span>
                <ResetDemoButton />
                {env.isDevelopment && !env.isMockDataSource && <ApiStatus />}
                <button
                  type="button"
                  disabled={logout.isPending}
                  onClick={() => logout.mutate()}
                  className="rounded-md border border-slate-300 px-2.5 py-1.5 hover:bg-slate-50"
                >
                  Salir
                </button>
              </div>
            </div>

            <nav
              aria-label="Navegación del portal de comercios"
              className="flex flex-wrap gap-2"
            >
              {commerceNavItems
                .filter(
                  (item) =>
                    !item.permission ||
                    (session && hasPermission(session.role, item.permission)),
                )
                .map((item) => (
                  <NavLink key={item.to} to={item.to} className={navClassName}>
                    {item.label}
                    {item.to === '/commerce/cart' && itemCount > 0
                      ? ` (${itemCount})`
                      : ''}
                  </NavLink>
                ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </>
  );
}

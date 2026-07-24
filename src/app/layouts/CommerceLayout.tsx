import { NavLink, Outlet } from 'react-router-dom';

import { ApiStatus } from '@/shared/components/ApiStatus';
import { env } from '@/app/config/env';
import { useDemoSession, useLogoutMutation } from '@/features/auth/hooks';
import { useCartStore } from '@/features/orders/cart-store';
import { ResetDemoButton } from '@/features/demo/ResetDemoButton';
import { DemoBanner } from '@/shared/components/DemoBanner';
import { hasPermission } from '@/features/auth/permissions';
import type { DemoRole, Permission } from '@/shared/types/demo';
import { roleLabels } from '@/shared/lib/labels';

const commerceNavItems: Array<{
  to: string;
  label: string;
  roles?: DemoRole[];
  permission?: Permission;
}> = [
  { to: '/commerce/dashboard', label: 'Resumen', roles: ['COMMERCE_OWNER'] },
  { to: '/commerce/catalog', label: 'Catálogo' },
  { to: '/commerce/cart', label: 'Carrito' },
  { to: '/commerce/orders', label: 'Pedidos' },
  {
    to: '/commerce/account',
    label: 'Cuenta',
    permission: 'accounts:read_own' as const,
  },
  {
    to: '/commerce/payments',
    label: 'Pagos',
    permission: 'payments:record' as const,
  },
  {
    to: '/commerce/billing',
    label: 'Facturas',
    permission: 'billing:read_own' as const,
  },
  {
    to: '/commerce/users',
    label: 'Usuarios',
    permission: 'users:manage_demo' as const,
  },
];

function navClassName({ isActive }: { isActive: boolean }): string {
  return [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
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
      <div className="min-h-screen bg-stone-50">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  Distrisoft
                </p>
                <p className="text-sm text-slate-600">Portal de comercios</p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span>
                  {session?.displayName} ·{' '}
                  {session ? roleLabels[session.role] : ''}
                </span>
                <ResetDemoButton />
                {env.isDevelopment && !env.isMockDataSource && <ApiStatus />}
                <button
                  type="button"
                  disabled={logout.isPending}
                  onClick={() => logout.mutate()}
                  className="rounded border px-2 py-1"
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
                    (!item.roles ||
                      (session && item.roles.includes(session.role))) &&
                    (!item.permission ||
                      (session &&
                        hasPermission(session.role, item.permission))),
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

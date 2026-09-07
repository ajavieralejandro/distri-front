import { useId, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { env } from '@/app/config/env';
import { getAppProfileLabel } from '@/features/auth/app-profile';
import { useDemoSession, useLogoutMutation } from '@/features/auth/hooks';
import { hasPermission } from '@/features/auth/permissions';
import { ResetDemoButton } from '@/features/demo/ResetDemoButton';
import { ApiStatus } from '@/shared/components/ApiStatus';
import { DemoBanner } from '@/shared/components/DemoBanner';
import type { Permission } from '@/shared/types/demo';

type AdminNavItem = {
  to: string;
  label: string;
  permission?: Permission;
};

const adminNavItems: AdminNavItem[] = [
  { to: '/admin/dashboard', label: 'Panel general' },
  { to: '/admin/customers', label: 'Comercios' },
  {
    to: '/admin/map',
    label: 'Mapa',
    permission: 'customers:manage',
  },
  { to: '/admin/products', label: 'Productos' },
  { to: '/admin/orders', label: 'Pedidos' },
  {
    to: '/admin/inventory',
    label: 'Inventario',
    permission: 'inventory:read',
  },
  {
    to: '/admin/payments',
    label: 'Cobranzas',
    permission: 'payments:read_all',
  },
  {
    to: '/admin/billing',
    label: 'Facturación',
    permission: 'billing:read_all',
  },
  {
    to: '/admin/analytics',
    label: 'Reportes',
    permission: 'analytics:view_global',
  },
];

function navClassName({ isActive }: { isActive: boolean }): string {
  return [
    'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-teal-700 text-white'
      : 'text-slate-200 hover:bg-slate-800 hover:text-white',
  ].join(' ');
}

export function AdminLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const navId = useId();
  const session = useDemoSession();
  const logout = useLogoutMutation();

  const visibleItems = adminNavItems.filter(
    (item) =>
      !item.permission ||
      (session && hasPermission(session.role, item.permission)),
  );

  return (
    <>
      <DemoBanner />
      <div className="min-h-screen bg-[var(--color-surface)] lg:flex">
        <aside className="border-b border-slate-800 bg-slate-900 text-slate-100 lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-4 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
                Distrisoft
              </p>
              <p className="text-sm text-slate-300">Distribuidora</p>
            </div>
            <button
              type="button"
              className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-100 lg:hidden"
              aria-expanded={isMobileNavOpen}
              aria-controls={navId}
              onClick={() => setIsMobileNavOpen((open) => !open)}
            >
              Menú
            </button>
          </div>

          <nav
            id={navId}
            aria-label="Navegación administrativa"
            className={[
              'space-y-1 px-3 pb-4',
              isMobileNavOpen ? 'block' : 'hidden lg:block',
            ].join(' ')}
          >
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={navClassName}
                onClick={() => setIsMobileNavOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
            <p className="text-sm text-slate-600">
              Gestión comercial de la distribuidora
            </p>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm sm:inline">
                {session?.displayName} ·{' '}
                {session ? getAppProfileLabel(session.role) : ''}
              </span>
              <ResetDemoButton />
              {env.isDevelopment && !env.isMockDataSource && <ApiStatus />}
              <button
                type="button"
                disabled={logout.isPending}
                onClick={() => logout.mutate()}
                className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm hover:bg-slate-50"
              >
                Salir
              </button>
            </div>
          </div>
          <main className="flex-1 px-4 py-6 sm:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}

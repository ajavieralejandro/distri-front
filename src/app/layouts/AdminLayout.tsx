import { useId, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { ApiStatus } from '@/shared/components/ApiStatus';
import { env } from '@/app/config/env';
import { useDemoSession, useLogoutMutation } from '@/features/auth/hooks';
import { ResetDemoButton } from '@/features/demo/ResetDemoButton';
import { DemoBanner } from '@/shared/components/DemoBanner';
import { hasPermission } from '@/features/auth/permissions';
import type { DemoRole, Permission } from '@/shared/types/demo';
import { roleLabels } from '@/shared/lib/labels';

type AdminNavItem = {
  to: string;
  label: string;
  permission?: Permission;
  roles?: DemoRole[];
};

type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

const adminNavSections: AdminNavSection[] = [
  {
    title: 'Operación',
    items: [
      { to: '/admin/dashboard', label: 'Resumen' },
      { to: '/admin/orders', label: 'Pedidos' },
      {
        to: '/admin/alerts',
        label: 'Alertas',
        roles: ['DISTRIBUTOR_ADMIN'],
      },
      {
        to: '/admin/map',
        label: 'Mapa',
        roles: ['DISTRIBUTOR_ADMIN'],
      },
      {
        to: '/operations/warehouse',
        label: 'Preparación',
        permission: 'orders:prepare',
        roles: ['DISTRIBUTOR_ADMIN'],
      },
    ],
  },
  {
    title: 'Comercial',
    items: [
      { to: '/admin/customers', label: 'Clientes' },
      { to: '/admin/products', label: 'Productos' },
    ],
  },
  {
    title: 'Stock',
    items: [
      {
        to: '/admin/inventory',
        label: 'Inventario',
        permission: 'inventory:read',
      },
    ],
  },
  {
    title: 'Finanzas (demo)',
    items: [
      {
        to: '/admin/payments',
        label: 'Pagos',
        permission: 'payments:read_all',
      },
      {
        to: '/admin/billing',
        label: 'Facturación',
        permission: 'billing:read_all',
      },
    ],
  },
  {
    title: 'Análisis',
    items: [
      {
        to: '/admin/analytics',
        label: 'Analítica',
        permission: 'analytics:view_global',
      },
      {
        to: '/admin/audit',
        label: 'Auditoría',
        permission: 'audit:read',
      },
    ],
  },
  {
    title: 'Sistema',
    items: [
      {
        to: '/admin/users',
        label: 'Usuarios',
        permission: 'users:manage_demo',
      },
    ],
  },
];

function navClassName({ isActive }: { isActive: boolean }): string {
  return [
    'block rounded-md px-3 py-2 text-sm transition-colors',
    isActive
      ? 'bg-teal-800 text-white'
      : 'text-slate-200 hover:bg-slate-800 hover:text-white',
  ].join(' ');
}

export function AdminLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const navId = useId();
  const session = useDemoSession();
  const logout = useLogoutMutation();

  const visibleSections = adminNavSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!session) return false;
        if (item.roles && !item.roles.includes(session.role)) return false;
        if (item.permission && !hasPermission(session.role, item.permission)) {
          return false;
        }
        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      <DemoBanner />
      <div className="min-h-screen bg-slate-100 lg:flex">
        <aside className="border-b border-slate-800 bg-slate-900 text-slate-100 lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-4 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-300">
                Distrisoft
              </p>
              <p className="text-sm text-slate-300">Panel administrativo</p>
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
              'space-y-4 px-3 pb-4',
              isMobileNavOpen ? 'block' : 'hidden lg:block',
            ].join(' ')}
          >
            {visibleSections.map((section) => (
              <div key={section.title}>
                <p className="mb-1 px-3 text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={navClassName}
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
            <p className="text-sm text-slate-600">
              Área operativa de la distribuidora
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm">
                {session?.displayName} ·{' '}
                {session ? roleLabels[session.role] : ''}
              </span>
              <ResetDemoButton />
              {env.isDevelopment && !env.isMockDataSource && <ApiStatus />}
              <button
                type="button"
                disabled={logout.isPending}
                onClick={() => logout.mutate()}
                className="rounded border px-2 py-1 text-sm"
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

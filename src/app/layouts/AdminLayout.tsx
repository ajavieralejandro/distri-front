import { useId, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { ApiStatus } from '@/shared/components/ApiStatus';
import { env } from '@/app/config/env';
import { useDemoSession, useLogoutMutation } from '@/features/auth/hooks';
import { ResetDemoButton } from '@/features/demo/ResetDemoButton';
import { DemoBanner } from '@/shared/components/DemoBanner';

const adminNavItems = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/customers', label: 'Clientes' },
  { to: '/admin/products', label: 'Productos' },
  { to: '/admin/orders', label: 'Pedidos' },
  { to: '/admin/inventory', label: 'Inventario' },
  { to: '/admin/payments', label: 'Pagos' },
] as const;

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
              'space-y-1 px-3 pb-4',
              isMobileNavOpen ? 'block' : 'hidden lg:block',
            ].join(' ')}
          >
            {adminNavItems.map((item) => (
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
              Área operativa de la distribuidora
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm">{session?.displayName}</span>
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

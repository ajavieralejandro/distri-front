import { NavLink, Outlet } from 'react-router-dom';
import { DemoBanner } from '@/shared/components/DemoBanner';
import { ResetDemoButton } from '@/features/demo/ResetDemoButton';
import { useDemoSession, useLogoutMutation } from '@/features/auth/hooks';
import { roleLabels } from '@/shared/lib/labels';
export function CashierLayout() {
  const session = useDemoSession();
  const logout = useLogoutMutation();
  return (
    <>
      <DemoBanner />
      <div className="min-h-screen bg-stone-50">
        <header className="flex flex-wrap items-center justify-between gap-3 bg-teal-900 px-5 py-4 text-white">
          <div>
            <strong>Distrisoft · Caja</strong>
            <p className="text-sm text-teal-100">
              {session && roleLabels[session.role]}
            </p>
          </div>
          <div className="flex gap-2">
            <ResetDemoButton />
            <button
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
              className="rounded border px-3 py-1 text-sm"
            >
              Salir
            </button>
          </div>
        </header>
        <nav className="flex gap-2 bg-white p-3">
          <NavLink to="/operations/cashier" className="rounded px-3 py-2">
            Inicio
          </NavLink>
          <NavLink
            to="/operations/cashier/payments"
            className="rounded px-3 py-2"
          >
            Pagos
          </NavLink>
        </nav>
        <main className="mx-auto max-w-6xl p-5">
          <Outlet />
        </main>
      </div>
    </>
  );
}

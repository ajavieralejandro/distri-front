import { Link } from 'react-router-dom';

import { ApiStatus } from '@/shared/components/ApiStatus';
import { PageHeader } from '@/shared/components/PageHeader';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
          Distrisoft
        </p>
        <PageHeader
          title="Inicio de sesión"
          description="La autenticación real se implementará cuando la API exponga sesiones seguras con cookies HttpOnly."
        />

        <div className="space-y-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-700">
          <p>
            Esta pantalla es estructural y pertenece a la etapa técnica inicial.
          </p>
          <p>
            Todavía no hay login funcional, usuarios mock, tokens ni roles
            simulados.
          </p>
          <p className="font-medium text-slate-900">
            Estado: pendiente de la etapa de autenticación.
          </p>
        </div>

        <div className="mt-6">
          <ApiStatus />
        </div>

        <nav
          aria-label="Accesos estructurales temporales"
          className="mt-8 flex flex-wrap gap-3 text-sm"
        >
          <Link
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50"
            to="/admin/dashboard"
          >
            Ir al panel admin
          </Link>
          <Link
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50"
            to="/commerce/catalog"
          >
            Ir al portal comercios
          </Link>
        </nav>
      </section>
    </div>
  );
}

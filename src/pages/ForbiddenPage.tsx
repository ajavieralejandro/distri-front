import { Link } from 'react-router-dom';

import { useDemoSession } from '@/features/auth/hooks';
import { getHomePath } from '@/features/auth/permissions';
import { PageHeader } from '@/shared/components/PageHeader';

export function ForbiddenPage() {
  const session = useDemoSession();
  const home = session ? getHomePath(session.role) : '/login';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <PageHeader
          title="Acceso denegado"
          description="Tu rol demo no tiene permiso para esta pantalla. La autorización definitiva será aplicada por Distrisoft API."
        />
        <Link
          to={home}
          className="inline-flex rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white"
        >
          Volver al inicio
        </Link>
      </section>
    </div>
  );
}

import { Link } from 'react-router-dom';

import { PageHeader } from '@/shared/components/PageHeader';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <PageHeader
          title="Página no encontrada"
          description="La ruta solicitada no existe en Distrisoft Web."
        />
        <p className="text-sm text-slate-600">Código de estado visual: 404</p>
        <Link
          to="/login"
          className="mt-6 inline-flex rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          Volver al inicio
        </Link>
      </section>
    </div>
  );
}

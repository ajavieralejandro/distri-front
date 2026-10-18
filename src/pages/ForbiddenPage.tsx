import { Link, useNavigate } from 'react-router-dom';

import { env } from '@/app/config/env';
import {
  useApiSession,
  useDemoSession,
  useLogoutMutation,
} from '@/features/auth/hooks';
import { getHomePath } from '@/features/auth/permissions';
import { PageHeader } from '@/shared/components/PageHeader';

export function ForbiddenPage() {
  const session = useDemoSession();
  const apiSession = useApiSession();
  const logout = useLogoutMutation();
  const navigate = useNavigate();
  const home = session ? getHomePath(session.role) : '/login';
  const description = env.isMockDataSource
    ? 'Tu rol demo no tiene permiso para esta pantalla. La autorización definitiva será aplicada por Distrisoft API.'
    : apiSession?.role === 'COMMERCE'
      ? 'El servidor identificó un comercio. Esta consola administra pedidos y solo admite el rol de administrador.'
      : 'Tu rol no tiene permiso para esta pantalla.';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <PageHeader title="Acceso denegado" description={description} />
        {env.isMockDataSource || apiSession?.role === 'ADMIN' ? (
          <Link
            to={apiSession?.role === 'ADMIN' ? '/admin/orders' : home}
            className="inline-flex rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white"
          >
            Volver al inicio
          </Link>
        ) : (
          <button
            type="button"
            disabled={logout.isPending}
            onClick={() =>
              logout.mutate(undefined, {
                onSuccess: () => navigate('/login', { replace: true }),
              })
            }
            className="inline-flex rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {logout.isPending ? 'Saliendo…' : 'Salir'}
          </button>
        )}
      </section>
    </div>
  );
}

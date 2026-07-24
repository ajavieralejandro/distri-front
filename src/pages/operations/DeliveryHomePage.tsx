import { Link } from 'react-router-dom';
import { useDemoSession } from '@/features/auth/hooks';
import {
  useRoutesQuery,
  useStartRouteMutation,
} from '@/features/delivery/hooks';
import { PageHeader } from '@/shared/components/PageHeader';
export function DeliveryHomePage() {
  const session = useDemoSession();
  const routes = useRoutesQuery();
  const start = useStartRouteMutation();
  const route = routes.data?.find(
    (item) => item.id === session?.assignedRouteId,
  );
  return (
    <>
      <PageHeader title="Reparto" description="Tu recorrido asignado." />
      {route ? (
        <article className="rounded bg-white p-4 shadow">
          <strong>{route.name}</strong>
          <p>{route.status}</p>
          {route.status === 'PLANNED' && (
            <button
              disabled={start.isPending}
              onClick={() => start.mutate(route.id)}
              className="mt-3 rounded bg-indigo-700 px-3 py-2 text-white"
            >
              Iniciar ruta
            </button>
          )}
          <Link to="route" className="ml-3 underline text-indigo-800">
            Ver ruta
          </Link>
        </article>
      ) : (
        <p>No hay ruta asignada.</p>
      )}
    </>
  );
}

import { Link } from 'react-router-dom';
import { useDemoSession } from '@/features/auth/hooks';
import { useRouteQuery } from '@/features/delivery/hooks';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
export function DeliveryRoutePage() {
  const session = useDemoSession();
  const query = useRouteQuery(session?.assignedRouteId);
  return (
    <>
      <PageHeader
        title="Ruta"
        description="Paradas ordenadas de tu recorrido."
      />
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!query.data}
      >
        {query.data && (
          <ol className="space-y-3">
            {[...query.data.orders]
              .sort((a, b) => (a.stopSequence ?? 0) - (b.stopSequence ?? 0))
              .map((order) => (
                <li key={order.id} className="rounded bg-white p-4 shadow">
                  <strong>
                    {order.stopSequence ?? '—'}. {order.deliveryContactName}
                  </strong>
                  <p>{order.deliveryAddress}</p>
                  <Link
                    to={`/operations/delivery/orders/${order.id}`}
                    className="underline text-indigo-800"
                  >
                    Registrar resultado
                  </Link>
                </li>
              ))}
          </ol>
        )}
      </QueryState>
    </>
  );
}

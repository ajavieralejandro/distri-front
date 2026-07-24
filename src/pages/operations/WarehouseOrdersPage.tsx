import { Link } from 'react-router-dom';
import { useDemoSession } from '@/features/auth/hooks';
import { useOrdersQuery } from '@/features/orders/hooks';
import { orderStatusLabels } from '@/shared/lib/labels';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
export function WarehouseOrdersPage() {
  const session = useDemoSession();
  const query = useOrdersQuery({ warehouseId: session?.warehouseId });
  return (
    <>
      <PageHeader
        title="Pedidos de depósito"
        description="Solo pedidos del depósito asignado."
      />
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!query.data?.length}
      >
        {query.data && (
          <ul className="divide-y rounded bg-white shadow">
            {query.data.map((order) => (
              <li key={order.id} className="flex justify-between p-4">
                <span>
                  <strong>{order.number}</strong> ·{' '}
                  {orderStatusLabels[order.status]}
                </span>
                <Link className="underline text-teal-800" to={order.id}>
                  Preparar
                </Link>
              </li>
            ))}
          </ul>
        )}
      </QueryState>
    </>
  );
}

import { Link } from 'react-router-dom';
import { useDemoSession } from '@/features/auth/hooks';
import { useOrdersQuery } from '@/features/orders/hooks';
import { PageHeader } from '@/shared/components/PageHeader';
export function WarehouseHomePage() {
  const session = useDemoSession();
  const orders = useOrdersQuery({ warehouseId: session?.warehouseId });
  return (
    <>
      <PageHeader
        title="Depósito"
        description="Preparación de pedidos asignados a tu depósito."
      />
      <p className="rounded bg-white p-4 shadow">
        Hay{' '}
        <strong>
          {orders.data?.filter((order) =>
            ['CONFIRMED', 'PREPARING'].includes(order.status),
          ).length ?? 0}
        </strong>{' '}
        pedidos para preparar.
      </p>
      <Link
        to="orders"
        className="mt-4 inline-block rounded bg-teal-700 px-3 py-2 text-white"
      >
        Ver pedidos
      </Link>
    </>
  );
}

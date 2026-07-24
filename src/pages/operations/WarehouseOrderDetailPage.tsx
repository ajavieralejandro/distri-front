import { useParams } from 'react-router-dom';
import {
  useOrderQuery,
  usePrepareOrderItemsMutation,
  useReadyForDispatchMutation,
} from '@/features/orders/hooks';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
export function WarehouseOrderDetailPage() {
  const { orderId } = useParams();
  const query = useOrderQuery(orderId);
  const prepare = usePrepareOrderItemsMutation();
  const ready = useReadyForDispatchMutation();
  const order = query.data;
  const complete = order?.items.every((item) => item.pickStatus !== 'PENDING');
  return (
    <>
      <PageHeader title="Preparar pedido" description={order?.number ?? ''} />
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!order}
      >
        {order && (
          <div className="space-y-3 rounded bg-white p-4 shadow">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex flex-wrap items-center justify-between gap-2 border-b pb-3"
              >
                <span>
                  {item.name} · {item.quantity} unidades
                </span>
                <button
                  disabled={prepare.isPending || item.pickStatus !== 'PENDING'}
                  onClick={() =>
                    prepare.mutate({
                      id: order.id,
                      body: {
                        items: [
                          {
                            productId: item.productId,
                            preparedQuantity: item.quantity,
                            pickStatus: 'PICKED',
                          },
                        ],
                      },
                    })
                  }
                  className="rounded border px-3 py-2"
                >
                  Marcar preparado
                </button>
              </div>
            ))}
            <button
              disabled={!complete || ready.isPending}
              onClick={() => ready.mutate(order.id)}
              className="rounded bg-teal-700 px-3 py-2 text-white disabled:opacity-50"
            >
              Listo para despacho
            </button>
            {(prepare.error || ready.error) && (
              <p role="alert" className="text-red-700">
                {(prepare.error || ready.error)?.message}
              </p>
            )}
          </div>
        )}
      </QueryState>
    </>
  );
}

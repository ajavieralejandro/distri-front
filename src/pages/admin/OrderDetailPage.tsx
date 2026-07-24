import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  useOrderQuery,
  useUpdateOrderStatusMutation,
} from '@/features/orders/hooks';
import {
  canTransition,
  ORDER_TRANSITIONS,
} from '@/features/orders/lib/order-transitions';
import type { OrderStatus } from '@/shared/types/demo';
import { orderStatusLabels } from '@/shared/lib/labels';
import { formatMoney } from '@/shared/lib/money';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { QueryState } from '@/shared/components/QueryState';
import { PageHeader } from '@/shared/components/PageHeader';
export function OrderDetailPage() {
  const { orderId } = useParams();
  const query = useOrderQuery(orderId);
  const update = useUpdateOrderStatusMutation();
  const [next, setNext] = useState<OrderStatus>();
  const order = query.data;
  return (
    <>
      <PageHeader title="Detalle de pedido" description={order?.number ?? ''} />
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!order}
      >
        {order && (
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <p>
              Estado: <strong>{orderStatusLabels[order.status]}</strong>
            </p>
            <p className="mt-2">Total: {formatMoney(order.total)}</p>
            <ul className="mt-4 divide-y">
              {order.items.map((item) => (
                <li key={item.productId} className="py-2">
                  {item.name} × {item.quantity} — {formatMoney(item.lineTotal)}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {ORDER_TRANSITIONS[order.status].map((status) => (
                <button
                  key={status}
                  onClick={() => setNext(status)}
                  className="rounded border px-3 py-2 text-sm"
                >
                  {orderStatusLabels[status]}
                </button>
              ))}
            </div>
          </div>
        )}
      </QueryState>
      {next && order && (
        <ConfirmDialog
          title="Cambiar estado"
          message={`¿Cambiar el pedido a ${orderStatusLabels[next]}?`}
          busy={update.isPending}
          onCancel={() => setNext(undefined)}
          onConfirm={() =>
            canTransition(order.status, next) &&
            update.mutate(
              { id: order.id, status: next },
              { onSuccess: () => setNext(undefined) },
            )
          }
        />
      )}
    </>
  );
}

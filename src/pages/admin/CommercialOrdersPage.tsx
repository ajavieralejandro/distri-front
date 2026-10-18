import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { useCommercialOrdersQuery } from '@/features/orders/commercial-hooks';
import {
  COMMERCIAL_ORDER_STATUSES,
  COMMERCIAL_PAYMENT_LABELS,
  deliverySummary,
  filterCommercialOrders,
} from '@/features/orders/commercial-order';
import { ORDER_STATUS_LABELS } from '@/features/orders/lib/order-status';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
import { formatDateTime } from '@/shared/lib/datetime';
import { formatMoney } from '@/shared/lib/money';

export function CommercialOrdersPage() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const search = params.get('search') ?? '';
  const query = useCommercialOrdersQuery();

  const orders = useMemo(
    () =>
      [...(query.data ?? [])].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      ),
    [query.data],
  );
  const visible = useMemo(
    () => filterCommercialOrders(orders, { status, search }),
    [orders, search, status],
  );
  const counts = useMemo(() => {
    const next = Object.fromEntries(
      COMMERCIAL_ORDER_STATUSES.map((key) => [key, 0]),
    ) as Record<(typeof COMMERCIAL_ORDER_STATUSES)[number], number>;
    for (const order of orders) {
      next[order.status] += 1;
    }
    return next;
  }, [orders]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  return (
    <>
      <PageHeader
        title="Pedidos"
        description="Pedidos creados en la API. El importe cobrado se muestra aparte del medio de pago: efectivo no significa pagado."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateParam('status', '')}
          className={`rounded-full px-3 py-1 text-xs ${
            !status ? 'bg-teal-800 text-white' : 'bg-white text-slate-700'
          }`}
        >
          Todos ({orders.length})
        </button>
        {COMMERCIAL_ORDER_STATUSES.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => updateParam('status', key)}
            className={`rounded-full px-3 py-1 text-xs ${
              status === key
                ? 'bg-teal-800 text-white'
                : 'bg-white text-slate-700'
            }`}
          >
            {ORDER_STATUS_LABELS[key]} ({counts[key]})
          </button>
        ))}
      </div>

      <div className="mb-4">
        <input
          aria-label="Buscar pedidos"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Número, comercio o dirección"
          value={search}
          onChange={(event) => updateParam('search', event.target.value)}
        />
      </div>

      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!query.isPending && !query.isError && visible.length === 0}
        emptyMessage="No hay pedidos con los filtros actuales."
        errorMessage={
          query.error instanceof Error
            ? query.error.message
            : 'No se pudieron cargar los pedidos.'
        }
      >
        <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="p-3">Pedido</th>
                <th className="p-3">Comercio</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Entrega</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Pago</th>
                <th className="p-3">Cobrado</th>
                <th className="p-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => (
                <tr key={order.id} className="border-b border-slate-100">
                  <td className="p-3">
                    <Link
                      className="font-medium text-teal-800 underline"
                      to={`/admin/orders/${order.id}`}
                    >
                      {order.number}
                    </Link>
                  </td>
                  <td className="p-3">{order.commerceName}</td>
                  <td className="p-3">{formatDateTime(order.createdAt)}</td>
                  <td className="p-3">{deliverySummary(order)}</td>
                  <td className="p-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="p-3">
                    {order.paymentMethod
                      ? COMMERCIAL_PAYMENT_LABELS[order.paymentMethod]
                      : 'Sin medio'}
                  </td>
                  <td className="p-3">
                    {formatMoney(
                      order.paidAmount.amount,
                      order.paidAmount.currency,
                    )}
                  </td>
                  <td className="p-3">
                    {formatMoney(order.total.amount, order.total.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </QueryState>
    </>
  );
}

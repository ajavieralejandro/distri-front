import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useCustomersQuery } from '@/features/customers/hooks';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { useOrdersQuery } from '@/features/orders/hooks';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_ORDER,
} from '@/features/orders/lib/order-status';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatDateTime } from '@/shared/lib/datetime';
import { formatMoney } from '@/shared/lib/money';
import type { OrderStatus } from '@/shared/types/demo';

const WAREHOUSE_NAMES: Record<string, string> = {
  'wh-1': 'Depósito Central',
  'wh-2': 'Depósito Norte',
};

export function OrdersPage() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const priority = params.get('priority') ?? '';
  const search = params.get('search') ?? '';

  const query = useOrdersQuery({
    status: status || undefined,
    priority: priority || undefined,
    search: search || undefined,
  });
  const allOrdersQuery = useOrdersQuery();
  const customersQuery = useCustomersQuery();

  const commerceNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const commerce of customersQuery.data ?? []) {
      map.set(commerce.id, commerce.tradeName);
    }
    return map;
  }, [customersQuery.data]);

  const statusCounts = useMemo(() => {
    const counts = {} as Record<OrderStatus, number>;
    for (const key of ORDER_STATUS_ORDER) counts[key] = 0;
    for (const order of allOrdersQuery.data ?? []) {
      counts[order.status] += 1;
    }
    return counts;
  }, [allOrdersQuery.data]);

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
        description="Centro de gestión del ciclo logístico. Filtrá por estado y abrí el detalle para trazabilidad completa."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateParam('status', '')}
          className={`rounded-full px-3 py-1 text-xs ${
            !status ? 'bg-teal-800 text-white' : 'bg-white text-slate-700'
          }`}
        >
          Todos ({allOrdersQuery.data?.length ?? 0})
        </button>
        {ORDER_STATUS_ORDER.map((key) => (
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
            {ORDER_STATUS_LABELS[key]} ({statusCounts[key] ?? 0})
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          aria-label="Buscar pedidos"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Número o comercio"
          value={search}
          onChange={(event) => updateParam('search', event.target.value)}
        />
        <select
          aria-label="Prioridad"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={priority}
          onChange={(event) => updateParam('priority', event.target.value)}
        >
          <option value="">Todas las prioridades</option>
          <option value="HIGH">Alta</option>
          <option value="NORMAL">Normal</option>
        </select>
      </div>

      <QueryState
        isPending={query.isPending || customersQuery.isPending}
        isError={query.isError || customersQuery.isError}
        isEmpty={!query.data?.length}
        emptyMessage="No hay pedidos con los filtros actuales."
      >
        {query.data && (
          <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="p-3">Pedido</th>
                  <th className="p-3">Comercio</th>
                  <th className="p-3">Depósito</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Prioridad</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100">
                    <td className="p-3">
                      <Link
                        className="font-medium text-teal-800 underline"
                        to={`/admin/orders/${order.id}`}
                      >
                        {order.number}
                      </Link>
                    </td>
                    <td className="p-3">
                      <Link
                        className="text-teal-800 underline"
                        to={`/admin/customers/${order.commerceId}`}
                      >
                        {commerceNameById.get(order.commerceId) ??
                          order.commerceId}
                      </Link>
                    </td>
                    <td className="p-3">
                      {WAREHOUSE_NAMES[order.warehouseId] ?? order.warehouseId}
                    </td>
                    <td className="p-3">{formatDateTime(order.createdAt)}</td>
                    <td className="p-3">
                      {order.priority === 'HIGH' ? (
                        <StatusBadge label="Alta" tone="danger" />
                      ) : (
                        <StatusBadge label="Normal" tone="neutral" />
                      )}
                    </td>
                    <td className="p-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="p-3">{formatMoney(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </QueryState>
    </>
  );
}

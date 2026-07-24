import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrdersQuery } from '@/features/orders/hooks';
import { formatMoney } from '@/shared/lib/money';
import { orderStatusLabels } from '@/shared/lib/labels';
import { QueryState } from '@/shared/components/QueryState';
import { PageHeader } from '@/shared/components/PageHeader';

export function OrdersPage() {
  const [status, setStatus] = useState('');
  const query = useOrdersQuery({ status: status || undefined });
  return (
    <>
      <PageHeader
        title="Pedidos"
        description="Seguimiento de pedidos de comercios."
      />
      <select
        aria-label="Estado del pedido"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="mb-4 rounded border p-2"
      >
        <option value="">Todos los estados</option>
        {Object.entries(orderStatusLabels).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!query.data?.length}
      >
        {query.data && (
          <div className="overflow-x-auto rounded-lg bg-white shadow">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3">Pedido</th>
                  <th>Estado</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((o) => (
                  <tr key={o.id} className="border-b">
                    <td className="p-3">
                      <Link
                        className="text-teal-800 underline"
                        to={`/admin/orders/${o.id}`}
                      >
                        {o.number}
                      </Link>
                    </td>
                    <td>{orderStatusLabels[o.status]}</td>
                    <td>{formatMoney(o.total)}</td>
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

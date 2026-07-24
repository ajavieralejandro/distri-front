import { useMemo, useState } from 'react';

import { useAdminAnalyticsQuery } from '@/features/analytics/hooks';
import { formatMoney } from '@/shared/lib/money';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';

function periodBounds(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime() - days * 86_400_000);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);
  const bounds = useMemo(() => periodBounds(days), [days]);
  const query = useAdminAnalyticsQuery(bounds);
  const totals = query.data?.totals;

  return (
    <>
      <PageHeader
        title="Analítica"
        description="Indicadores globales demostrativos derivados de los datos mock."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {[7, 30].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setDays(value)}
            className="rounded border px-3 py-2 text-sm"
          >
            {value} días
          </button>
        ))}
        <button
          type="button"
          onClick={() => setDays(30)}
          className="rounded border px-3 py-2 text-sm"
        >
          Mes actual (aprox.)
        </button>
      </div>
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!totals}
      >
        {totals ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {(
              [
                ['Pedidos', totals.orders],
                ['Entregados', totals.deliveredOrders],
                ['Facturado', formatMoney(totals.orderValue)],
                ['Cobrado', formatMoney(totals.payments)],
                ['Stock', totals.availableStock],
              ] as const
            ).map(([label, value], index) => (
              <article key={label} className="rounded bg-white p-4 shadow">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-xl font-semibold">{value}</p>
                <div className="mt-3 h-2 rounded bg-slate-100">
                  <div
                    className="h-2 rounded bg-teal-600"
                    style={{ width: `${Math.max(12, 100 - index * 14)}%` }}
                  />
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </QueryState>
    </>
  );
}

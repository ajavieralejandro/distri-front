import { Link } from 'react-router-dom';
import { useAdminDashboardQuery } from '@/features/admin/dashboard';
import { formatMoney } from '@/shared/lib/money';
import { QueryState } from '@/shared/components/QueryState';
import { PageHeader } from '@/shared/components/PageHeader';

export function AdminDashboardPage() {
  const query = useAdminDashboardQuery();
  const data = query.data;
  return (
    <>
      <PageHeader title="Dashboard" description="Resumen operativo actual." />
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!data}
      >
        {data && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Pedidos pendientes', data.pendingOrders],
                ['En preparación', data.preparingOrders],
                ['Saldo pendiente', formatMoney(data.totalOutstandingBalance)],
                ['Stock bajo', data.lowStockProducts.length],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="rounded-lg bg-white p-4 shadow-sm"
                >
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-1 text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-lg bg-white p-4 shadow-sm">
                <h2 className="font-semibold">Productos con stock bajo</h2>
                {data.lowStockProducts.map((p) => (
                  <p key={p.id} className="border-t py-2 text-sm">
                    {p.name}{' '}
                    <span className="text-amber-700">({p.availableStock})</span>
                  </p>
                ))}
              </section>
              <section className="rounded-lg bg-white p-4 shadow-sm">
                <h2 className="font-semibold">Pedidos recientes</h2>
                {data.recentOrders.map((o) => (
                  <Link
                    className="block border-t py-2 text-sm text-teal-800"
                    key={o.id}
                    to={`/admin/orders/${o.id}`}
                  >
                    {o.number} — {formatMoney(o.total)}
                  </Link>
                ))}
              </section>
            </div>
          </div>
        )}
      </QueryState>
    </>
  );
}

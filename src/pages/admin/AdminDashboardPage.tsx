import { Link } from 'react-router-dom';

import { useAdminDashboardQuery } from '@/features/admin/dashboard';
import { useMapLocationsQuery } from '@/features/admin/map';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
import { formatMoney } from '@/shared/lib/money';

type Metric = {
  label: string;
  value: string | number;
  to: string;
  hint: string;
};

export function AdminDashboardPage() {
  const query = useAdminDashboardQuery();
  const mapQuery = useMapLocationsQuery();
  const data = query.data;
  const attentionCommerces = (mapQuery.data ?? [])
    .filter((item) => item.needsAttention)
    .slice(0, 5);

  const metrics: Metric[] = data
    ? [
        {
          label: 'Ventas del período',
          value: formatMoney(data.salesMonth),
          to: '/admin/orders?status=DELIVERED',
          hint: 'Entregas del mes',
        },
        {
          label: 'Pedidos pendientes',
          value: data.pendingOrders,
          to: '/admin/orders?status=PENDING',
          hint: 'Requieren confirmación',
        },
        {
          label: 'Comercios activos',
          value: data.activeCommerces,
          to: '/admin/customers?status=ACTIVE',
          hint: 'Clientes operativos',
        },
        {
          label: 'Stock bajo',
          value: data.lowStockCount,
          to: '/admin/inventory?lowStock=1',
          hint: 'Productos a reponer',
        },
        {
          label: 'Cuentas por cobrar',
          value: formatMoney(data.totalOutstandingBalance),
          to: '/admin/payments',
          hint: 'Saldo de comercios',
        },
        {
          label: 'Entregas próximas',
          value: data.dispatchedOrders + data.readyOrders,
          to: '/admin/orders?status=OUT_FOR_DELIVERY',
          hint: 'Preparados o en ruta',
        },
      ]
    : [];

  return (
    <>
      <PageHeader
        title="Panel general"
        description="Resumen ejecutivo de la distribuidora. Accedé rápido a pedidos, mapa y catálogo."
      />
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!data}
      >
        {data && (
          <div className="space-y-6">
            <section aria-label="Accesos rápidos">
              <div className="flex flex-wrap gap-2">
                {[
                  { to: '/admin/map', label: 'Abrir mapa' },
                  { to: '/admin/orders?status=PENDING', label: 'Pedidos' },
                  { to: '/admin/products', label: 'Productos' },
                  { to: '/admin/customers', label: 'Comercios' },
                  { to: '/admin/inventory?lowStock=1', label: 'Stock crítico' },
                ].map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-teal-900 hover:bg-teal-50"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </section>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {metrics.map((metric) => (
                <Link
                  key={metric.label}
                  to={metric.to}
                  className="rounded-xl bg-white p-4 shadow-sm transition hover:ring-2 hover:ring-teal-700/20"
                >
                  <p className="text-sm text-slate-500">{metric.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-xs text-teal-800">{metric.hint} →</p>
                </Link>
              ))}
            </div>

            <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-amber-950">
                    Comercios que requieren atención
                  </h2>
                  <p className="text-sm text-amber-900">
                    Pedidos pendientes, deuda o visitas programadas.
                  </p>
                </div>
                <Link
                  to="/admin/map"
                  className="rounded-lg bg-amber-800 px-3 py-2 text-sm text-white"
                >
                  Ver en mapa
                </Link>
              </div>
              {attentionCommerces.length === 0 ? (
                <p className="text-sm text-amber-900">
                  No hay comercios que requieran seguimiento ahora.
                </p>
              ) : (
                <ul className="space-y-2">
                  {attentionCommerces.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-slate-600">
                          {item.pendingOrders > 0
                            ? `${item.pendingOrders} pedido(s) pendiente(s)`
                            : ''}
                          {item.hasOverdueDebt ? ' · Deuda vencida' : ''}
                          {item.tags.includes('Visitar esta semana')
                            ? ' · Visita programada'
                            : ''}
                        </p>
                      </div>
                      <Link className="text-teal-800 underline" to={item.href}>
                        Ver comercio
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-xl bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-semibold">Stock crítico</h2>
                  <Link
                    className="text-sm text-teal-800 underline"
                    to="/admin/inventory?lowStock=1"
                  >
                    Ver inventario
                  </Link>
                </div>
                {data.lowStockProducts.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No hay productos por debajo del mínimo.
                  </p>
                ) : (
                  data.lowStockProducts.map((product) => (
                    <p key={product.id} className="border-t py-2 text-sm">
                      {product.name}{' '}
                      <span className="text-amber-700">
                        ({product.availableStock})
                      </span>
                    </p>
                  ))
                )}
              </section>
              <section className="rounded-xl bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-semibold">Actividad reciente</h2>
                  <Link
                    className="text-sm text-teal-800 underline"
                    to="/admin/orders"
                  >
                    Ver pedidos
                  </Link>
                </div>
                {data.recentOrders.map((order) => (
                  <Link
                    className="flex items-center justify-between gap-2 border-t py-2 text-sm text-teal-900"
                    key={order.id}
                    to={`/admin/orders/${order.id}`}
                  >
                    <span>
                      {order.number} — {formatMoney(order.total)}
                    </span>
                    <OrderStatusBadge status={order.status} />
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

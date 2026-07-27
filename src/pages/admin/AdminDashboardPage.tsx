import { Link } from 'react-router-dom';

import { useAdminDashboardQuery } from '@/features/admin/dashboard';
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
  const data = query.data;

  const metrics: Metric[] = data
    ? [
        {
          label: 'Ventas del día',
          value: formatMoney(data.salesToday),
          to: '/admin/orders?status=DELIVERED',
          hint: 'Pedidos entregados hoy',
        },
        {
          label: 'Ventas del mes',
          value: formatMoney(data.salesMonth),
          to: '/admin/orders?status=DELIVERED',
          hint: 'Pedidos entregados en el mes',
        },
        {
          label: 'Pedidos pendientes',
          value: data.pendingOrders,
          to: '/admin/orders?status=PENDING',
          hint: 'Requieren confirmación',
        },
        {
          label: 'En preparación',
          value: data.preparingOrders,
          to: '/admin/orders?status=PREPARING',
          hint: 'En depósito',
        },
        {
          label: 'Preparados',
          value: data.readyOrders,
          to: '/admin/orders?status=READY_FOR_DISPATCH',
          hint: 'Listos para despacho',
        },
        {
          label: 'Despachados',
          value: data.dispatchedOrders,
          to: '/admin/orders?status=OUT_FOR_DELIVERY',
          hint: 'En recorrido',
        },
        {
          label: 'Entregas demoradas',
          value: data.delayedDeliveries,
          to: '/admin/alerts',
          hint: 'Más de 2 días sin avance',
        },
        {
          label: 'Cobranzas pendientes',
          value: data.pendingCollections,
          to: '/admin/payments',
          hint: 'Movimientos abiertos o vencidos',
        },
        {
          label: 'Saldo cuentas corrientes',
          value: formatMoney(data.totalOutstandingBalance),
          to: '/admin/customers',
          hint: 'Deuda total de comercios',
        },
        {
          label: 'Stock crítico',
          value: data.lowStockCount,
          to: '/admin/inventory?lowStock=1',
          hint: 'Por debajo del mínimo',
        },
        {
          label: 'Sin stock',
          value: data.outOfStockCount,
          to: '/admin/inventory?lowStock=1',
          hint: 'Disponible en cero',
        },
        {
          label: 'Comercios activos',
          value: data.activeCommerces,
          to: '/admin/customers?status=ACTIVE',
          hint: 'Clientes operativos',
        },
      ]
    : [];

  return (
    <>
      <PageHeader
        title="Resumen"
        description="Ciclo operativo: pedido → preparación → despacho → entrega → cobro. Métricas accionables del Administrador."
      />
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!data}
      >
        {data && (
          <div className="space-y-6">
            <section aria-label="Accesos rápidos">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Accesos rápidos
              </h2>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    to: '/admin/orders?status=PENDING',
                    label: 'Pedidos pendientes',
                  },
                  {
                    to: '/admin/inventory?lowStock=1',
                    label: 'Ajustar stock crítico',
                  },
                  { to: '/admin/payments', label: 'Consultar deudores' },
                  { to: '/admin/map', label: 'Mapa operativo' },
                  { to: '/admin/alerts', label: 'Ver alertas' },
                  {
                    to: '/operations/warehouse',
                    label: 'Ir a preparación',
                  },
                ].map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-teal-900 hover:bg-teal-50"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </section>

            <section aria-label="Indicadores ejecutivos">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                  <Link
                    key={metric.label}
                    to={metric.to}
                    className="rounded-lg bg-white p-4 shadow-sm transition hover:ring-2 hover:ring-teal-700/30"
                  >
                    <p className="text-sm text-slate-500">{metric.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                      {metric.value}
                    </p>
                    <p className="mt-2 text-xs text-teal-800">
                      {metric.hint} →
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            {data.recentAlertCount > 0 ? (
              <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-amber-950">
                      Requiere atención
                    </h2>
                    <p className="text-sm text-amber-900">
                      Hay {data.recentAlertCount} alertas activas (stock,
                      demoras, cobranzas o incidencias).
                    </p>
                  </div>
                  <Link
                    to="/admin/alerts"
                    className="rounded-md bg-amber-800 px-3 py-2 text-sm text-white"
                  >
                    Abrir centro de alertas
                  </Link>
                </div>
              </section>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-lg bg-white p-4 shadow-sm">
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
              <section className="rounded-lg bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-semibold">Pedidos recientes</h2>
                  <Link
                    className="text-sm text-teal-800 underline"
                    to="/admin/orders"
                  >
                    Ver todos
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

import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useCustomerQuery } from '@/features/customers/hooks';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { OrderTimeline } from '@/features/orders/components/OrderTimeline';
import {
  useOrderQuery,
  useUpdateOrderStatusMutation,
} from '@/features/orders/hooks';
import {
  canTransition,
  ORDER_TRANSITIONS,
} from '@/features/orders/lib/order-transitions';
import { useDemoSession } from '@/features/auth/hooks';
import { hasPermission } from '@/features/auth/permissions';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatDateTime } from '@/shared/lib/datetime';
import { deliveryResultLabels, orderStatusLabels } from '@/shared/lib/labels';
import { formatMoney } from '@/shared/lib/money';
import { pickStatusLabels } from '@/shared/lib/labels';
import type { OrderStatus, Permission } from '@/shared/types/demo';

const WAREHOUSE_NAMES: Record<string, string> = {
  'wh-1': 'Depósito Central',
  'wh-2': 'Depósito Norte',
};

const STATUS_PERMISSIONS: Partial<Record<OrderStatus, Permission>> = {
  CONFIRMED: 'orders:confirm',
  PREPARING: 'orders:prepare',
  READY_FOR_DISPATCH: 'orders:prepare',
  OUT_FOR_DELIVERY: 'orders:dispatch',
  DELIVERED: 'orders:deliver',
  CANCELLED: 'orders:cancel',
  DELIVERY_FAILED: 'orders:deliver',
};

export function OrderDetailPage() {
  const { orderId } = useParams();
  const query = useOrderQuery(orderId);
  const update = useUpdateOrderStatusMutation();
  const session = useDemoSession();
  const [next, setNext] = useState<OrderStatus>();
  const order = query.data;
  const customerQuery = useCustomerQuery(order?.commerceId);

  const allowedTransitions = useMemo(() => {
    if (!order || !session) return [];
    return ORDER_TRANSITIONS[order.status].filter((status) => {
      const permission = STATUS_PERMISSIONS[status];
      return !permission || hasPermission(session.role, permission);
    });
  }, [order, session]);

  return (
    <>
      <PageHeader
        title={order ? `Pedido ${order.number}` : 'Detalle de pedido'}
        description="Trazabilidad completa del ciclo operativo y acciones permitidas."
      />
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!order}
      >
        {order && (
          <div className="space-y-6">
            <section className="rounded-lg bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    {order.priority === 'HIGH' ? (
                      <StatusBadge label="Prioridad alta" tone="danger" />
                    ) : null}
                  </div>
                  <p className="mt-3 text-2xl font-semibold">
                    {formatMoney(order.total)}
                  </p>
                  <p className="text-sm text-slate-500">
                    Creado {formatDateTime(order.createdAt)} · Actualizado{' '}
                    {formatDateTime(order.updatedAt)}
                  </p>
                </div>
                <Link
                  to="/admin/orders"
                  className="text-sm text-teal-800 underline"
                >
                  Volver al listado
                </Link>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-sm text-slate-500">Comercio</dt>
                  <dd>
                    <Link
                      className="text-teal-800 underline"
                      to={`/admin/customers/${order.commerceId}`}
                    >
                      {customerQuery.data?.tradeName ?? order.commerceId}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Depósito responsable</dt>
                  <dd>
                    {WAREHOUSE_NAMES[order.warehouseId] ?? order.warehouseId}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Ruta</dt>
                  <dd>{order.routeId ?? 'Sin asignar'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Contacto entrega</dt>
                  <dd>
                    {order.deliveryContactName} · {order.deliveryContactPhone}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm text-slate-500">Dirección</dt>
                  <dd>{order.deliveryAddress}</dd>
                </div>
                {order.notes ? (
                  <div className="sm:col-span-2">
                    <dt className="text-sm text-slate-500">Observaciones</dt>
                    <dd>{order.notes}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                {allowedTransitions.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No hay transiciones disponibles desde este estado.
                  </p>
                ) : (
                  allowedTransitions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setNext(status)}
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      Pasar a {orderStatusLabels[status]}
                    </button>
                  ))
                )}
                <Link
                  to="/admin/map"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                >
                  Ver en mapa
                </Link>
              </div>
            </section>

            <section className="rounded-lg bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold">Productos</h2>
              <ul className="divide-y">
                {order.items.map((item) => (
                  <li
                    key={item.productId}
                    className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {item.name}{' '}
                        <span className="text-slate-500">({item.sku})</span>
                      </p>
                      <p className="text-slate-600">
                        {item.quantity} × {formatMoney(item.unitPrice)} · Prep.{' '}
                        {item.preparedQuantity} ·{' '}
                        {pickStatusLabels[item.pickStatus]}
                      </p>
                    </div>
                    <p className="font-medium">{formatMoney(item.lineTotal)}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t pt-3 text-sm">
                <p>Subtotal: {formatMoney(order.subtotal)}</p>
                <p className="font-semibold">Total: {formatMoney(order.total)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Impuestos simulados no discriminados en esta demo.
                </p>
              </div>
            </section>

            {(order.deliveryResult || order.deliveryObservation) && (
              <section className="rounded-lg bg-white p-5 shadow-sm">
                <h2 className="mb-3 font-semibold">Entrega</h2>
                {order.deliveryResult ? (
                  <p className="text-sm">
                    Resultado:{' '}
                    <strong>
                      {deliveryResultLabels[order.deliveryResult]}
                    </strong>
                  </p>
                ) : null}
                {order.receivedByName ? (
                  <p className="text-sm">Recibió: {order.receivedByName}</p>
                ) : null}
                {order.deliveryObservation ? (
                  <p className="mt-2 text-sm text-slate-600">
                    {order.deliveryObservation}
                  </p>
                ) : null}
              </section>
            )}

            <section className="rounded-lg bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold">Historial de estados</h2>
              <OrderTimeline history={order.history} />
            </section>
          </div>
        )}
      </QueryState>

      {next && order && (
        <ConfirmDialog
          title="Cambiar estado del pedido"
          message={`¿Confirmar transición de ${orderStatusLabels[order.status]} a ${orderStatusLabels[next]}? Solo se permiten saltos válidos del ciclo operativo.`}
          busy={update.isPending}
          onCancel={() => setNext(undefined)}
          onConfirm={() => {
            if (!canTransition(order.status, next)) {
              return;
            }
            update.mutate(
              { id: order.id, status: next },
              { onSuccess: () => setNext(undefined) },
            );
          }}
        />
      )}
    </>
  );
}

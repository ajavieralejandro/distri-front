import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import {
  useCommercialOrderQuery,
  useUpdateCommercialOrderStatusMutation,
} from '@/features/orders/commercial-hooks';
import {
  COMMERCIAL_PAYMENT_LABELS,
  COMMERCIAL_TRANSITION_LABELS,
  COMMERCIAL_UNIT_LABELS,
  canCommercialTransition,
  commercialTransitions,
  type CommercialOrder,
  type CommercialOrderStatus,
} from '@/features/orders/commercial-order';
import { orderStatusLabel } from '@/features/orders/lib/order-status';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
import { formatDateTime } from '@/shared/lib/datetime';
import { formatMoney } from '@/shared/lib/money';

export function CommercialOrderDetailPage() {
  const { orderId } = useParams();
  const query = useCommercialOrderQuery(orderId);
  const update = useUpdateCommercialOrderStatusMutation();
  const submittingRef = useRef(false);
  const [next, setNext] = useState<CommercialOrderStatus>();

  const requestStatus = (status: CommercialOrderStatus) => {
    if (update.isPending || submittingRef.current) return;
    update.reset();
    setNext(status);
  };

  const confirm = () => {
    const order = query.data;
    if (!order || !next || update.isPending || submittingRef.current) return;
    if (!canCommercialTransition(order.status, next)) return;
    submittingRef.current = true;
    update.mutate(
      { id: order.id, status: next },
      {
        onSuccess: () => setNext(undefined),
        onSettled: () => {
          submittingRef.current = false;
        },
      },
    );
  };

  return (
    <CommercialOrderDetailView
      order={query.data}
      isPending={query.isPending}
      loadError={
        query.isError
          ? query.error instanceof Error
            ? query.error.message
            : 'No se pudo cargar el pedido.'
          : undefined
      }
      actionError={
        update.error instanceof Error ? update.error.message : undefined
      }
      actionPending={update.isPending}
      requestedStatus={next}
      onRequestStatus={requestStatus}
      onConfirm={confirm}
      onDismiss={() => {
        if (!update.isPending) setNext(undefined);
      }}
    />
  );
}

export function CommercialOrderDetailView({
  order,
  isPending,
  loadError,
  actionError,
  actionPending,
  requestedStatus,
  onRequestStatus,
  onConfirm,
  onDismiss,
}: {
  order?: CommercialOrder;
  isPending: boolean;
  loadError?: string;
  actionError?: string;
  actionPending: boolean;
  requestedStatus?: CommercialOrderStatus;
  onRequestStatus: (status: CommercialOrderStatus) => void;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const transitions = order ? commercialTransitions(order.status) : [];

  return (
    <>
      <PageHeader
        title={order ? `Pedido ${order.number}` : 'Detalle de pedido'}
        description="Datos del pedido en la API. Confirmar cambia el estado y no registra un cobro."
      />
      <QueryState
        isPending={isPending}
        isError={Boolean(loadError)}
        isEmpty={!isPending && !loadError && !order}
        errorMessage={loadError}
      >
        {order ? (
          <div className="space-y-6">
            <section className="rounded-lg bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <OrderStatusBadge status={order.status} />
                  <p className="mt-3 text-2xl font-semibold">
                    {formatMoney(order.total.amount, order.total.currency)}
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

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-500">Comercio</dt>
                  <dd>{order.commerceName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Medio de pago</dt>
                  <dd>
                    {order.paymentMethod
                      ? COMMERCIAL_PAYMENT_LABELS[order.paymentMethod]
                      : 'Sin medio'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Importe cobrado</dt>
                  <dd>
                    {formatMoney(
                      order.paidAmount.amount,
                      order.paidAmount.currency,
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Entrega</dt>
                  <dd>
                    {order.delivery.mode === 'PICKUP'
                      ? 'Retiro en distribuidora'
                      : 'Envío a domicilio'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Destinatario</dt>
                  <dd>{order.delivery.recipient ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Teléfono</dt>
                  <dd>{order.delivery.phone ?? '—'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm text-slate-500">Dirección</dt>
                  <dd>
                    {order.delivery.mode === 'PICKUP'
                      ? 'Sin dirección de envío'
                      : [order.delivery.address, order.delivery.city]
                          .filter(Boolean)
                          .join(', ') || '—'}
                  </dd>
                </div>
                {order.delivery.references ? (
                  <div className="sm:col-span-2">
                    <dt className="text-sm text-slate-500">Referencias</dt>
                    <dd>{order.delivery.references}</dd>
                  </div>
                ) : null}
                {order.notes ? (
                  <div className="sm:col-span-2">
                    <dt className="text-sm text-slate-500">Observaciones</dt>
                    <dd>{order.notes}</dd>
                  </div>
                ) : null}
              </dl>

              <p className="mt-4 text-sm text-slate-600">
                El medio de pago no modifica el importe cobrado. Confirmar deja
                ese importe como lo devolvió la API.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {transitions.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No hay transiciones disponibles desde este estado.
                  </p>
                ) : (
                  transitions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={actionPending}
                      onClick={() => onRequestStatus(status)}
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
                    >
                      {COMMERCIAL_TRANSITION_LABELS[status]}
                    </button>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-lg bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold">Productos</h2>
              <ul className="divide-y">
                {order.items.map((item) => (
                  <li
                    key={`${item.productId}-${item.sku}`}
                    className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {item.name}{' '}
                        <span className="text-slate-500">({item.sku})</span>
                      </p>
                      <p className="text-slate-600">
                        {item.quantity} {COMMERCIAL_UNIT_LABELS[item.unit]} ×{' '}
                        {formatMoney(
                          item.unitPrice.amount,
                          item.unitPrice.currency,
                        )}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatMoney(
                        item.lineTotal.amount,
                        item.lineTotal.currency,
                      )}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t pt-3 text-sm">
                <p>
                  Subtotal:{' '}
                  {formatMoney(order.subtotal.amount, order.subtotal.currency)}
                </p>
                <p className="font-semibold">
                  Total: {formatMoney(order.total.amount, order.total.currency)}
                </p>
              </div>
            </section>

            <section className="rounded-lg bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold">Historial de estados</h2>
              {order.history.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Sin eventos de trazabilidad.
                </p>
              ) : (
                <ol className="space-y-3 border-l border-slate-200 pl-4">
                  {[...order.history]
                    .sort((left, right) =>
                      left.createdAt.localeCompare(right.createdAt),
                    )
                    .map((event) => (
                      <li key={event.id} className="text-sm">
                        <p className="font-medium text-slate-800">
                          {event.fromStatus
                            ? `${orderStatusLabel(event.fromStatus)} → ${orderStatusLabel(event.toStatus)}`
                            : orderStatusLabel(event.toStatus)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDateTime(event.createdAt)}
                        </p>
                        {event.note ? (
                          <p className="mt-1 text-slate-600">{event.note}</p>
                        ) : null}
                      </li>
                    ))}
                </ol>
              )}
            </section>
          </div>
        ) : null}
      </QueryState>

      {requestedStatus && order ? (
        <ConfirmDialog
          title={COMMERCIAL_TRANSITION_LABELS[requestedStatus]}
          message={`¿Confirmás pasar el pedido de ${orderStatusLabel(order.status)} a ${orderStatusLabel(requestedStatus)}? Esta acción no registra un cobro.`}
          busy={actionPending}
          error={actionError}
          onCancel={onDismiss}
          onConfirm={onConfirm}
        />
      ) : null}
    </>
  );
}

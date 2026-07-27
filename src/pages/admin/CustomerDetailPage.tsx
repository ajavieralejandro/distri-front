import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  useAccountMovementsQuery,
  useAccountSummaryQuery,
} from '@/features/accounts/hooks';
import { useCustomerQuery } from '@/features/customers/hooks';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { useOrdersQuery } from '@/features/orders/hooks';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatDateTime } from '@/shared/lib/datetime';
import {
  accountMovementTypeLabels,
  paymentMethodLabels,
} from '@/shared/lib/labels';
import { formatMoney } from '@/shared/lib/money';
import { usePaymentsQuery } from '@/features/payments/hooks';
import { compareMoney, sumMoney } from '@/shared/lib/decimal';

type TabId = 'resumen' | 'pedidos' | 'cuenta' | 'pagos' | 'ubicacion';

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'cuenta', label: 'Cuenta corriente' },
  { id: 'pagos', label: 'Pagos' },
  { id: 'ubicacion', label: 'Ubicación' },
];

export function CustomerDetailPage() {
  const { customerId } = useParams();
  const [tab, setTab] = useState<TabId>('resumen');
  const query = useCustomerQuery(customerId);
  const customer = query.data;
  const ordersQuery = useOrdersQuery({ commerceId: customerId });
  const accountQuery = useAccountSummaryQuery(customerId);
  const movementsQuery = useAccountMovementsQuery(customerId);
  const paymentsQuery = usePaymentsQuery({ commerceId: customerId });

  const recentOrders = useMemo(
    () =>
      [...(ordersQuery.data ?? [])]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 8),
    [ordersQuery.data],
  );

  const totalBought = useMemo(
    () =>
      sumMoney(
        (ordersQuery.data ?? [])
          .filter((order) => order.status === 'DELIVERED')
          .map((order) => order.total),
      ),
    [ordersQuery.data],
  );

  return (
    <>
      <PageHeader
        title="Ficha de comercio"
        description="Empresa cliente distinta de la distribuidora y de sus depósitos."
      />
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!customer}
      >
        {customer && (
          <div className="space-y-4">
            <section className="rounded-lg bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold">
                    {customer.businessName}
                  </p>
                  <p className="text-sm text-slate-600">{customer.tradeName}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge
                      label={
                        customer.status === 'ACTIVE' ? 'Activo' : 'Inactivo'
                      }
                      tone={
                        customer.status === 'ACTIVE' ? 'success' : 'neutral'
                      }
                    />
                    {compareMoney(customer.balance, customer.creditLimit) >
                    0 ? (
                      <StatusBadge label="Crédito excedido" tone="danger" />
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/admin/map"
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    Ver en mapa
                  </Link>
                  <Link
                    to={`/admin/orders?search=${encodeURIComponent(customer.tradeName)}`}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    Ver pedidos
                  </Link>
                </div>
              </div>
            </section>

            <div className="flex flex-wrap gap-2">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`rounded-md px-3 py-2 text-sm ${
                    tab === item.id
                      ? 'bg-teal-800 text-white'
                      : 'bg-white text-slate-700 shadow-sm'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === 'resumen' ? (
              <section className="rounded-lg bg-white p-5 shadow-sm">
                <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <dt className="text-sm text-slate-500">CUIT</dt>
                    <dd>{customer.taxId}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Contacto</dt>
                    <dd>
                      {customer.email}
                      <br />
                      {customer.phone}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">
                      Condición de pago
                    </dt>
                    <dd>{customer.paymentTerms}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Saldo</dt>
                    <dd>{formatMoney(customer.balance)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">
                      Límite de crédito
                    </dt>
                    <dd>{formatMoney(customer.creditLimit)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">
                      Disponible (demo)
                    </dt>
                    <dd>
                      {accountQuery.data
                        ? formatMoney(accountQuery.data.availableCredit)
                        : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Pedidos</dt>
                    <dd>{ordersQuery.data?.length ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">
                      Total entregado (aprox.)
                    </dt>
                    <dd>{formatMoney(totalBought)}</dd>
                  </div>
                </dl>
              </section>
            ) : null}

            {tab === 'pedidos' ? (
              <section className="rounded-lg bg-white p-5 shadow-sm">
                {recentOrders.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Sin pedidos para este comercio.
                  </p>
                ) : (
                  <ul className="divide-y">
                    {recentOrders.map((order) => (
                      <li
                        key={order.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                      >
                        <Link
                          className="text-teal-800 underline"
                          to={`/admin/orders/${order.id}`}
                        >
                          {order.number}
                        </Link>
                        <OrderStatusBadge status={order.status} />
                        <span>{formatMoney(order.total)}</span>
                        <span className="text-slate-500">
                          {formatDateTime(order.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}

            {tab === 'cuenta' ? (
              <section className="rounded-lg bg-white p-5 shadow-sm">
                <p className="mb-3 text-xs text-slate-500">
                  Vista demostrativa de cuenta corriente. No es contabilidad
                  fiscal.
                </p>
                <QueryState
                  isPending={movementsQuery.isPending}
                  isError={movementsQuery.isError}
                  isEmpty={!movementsQuery.data?.length}
                >
                  <ul className="divide-y text-sm">
                    {(movementsQuery.data ?? []).map((movement) => (
                      <li
                        key={movement.id}
                        className="flex flex-wrap justify-between gap-2 py-2"
                      >
                        <div>
                          <p className="font-medium">
                            {accountMovementTypeLabels[movement.type]} ·{' '}
                            {movement.description}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDateTime(movement.createdAt)} ·{' '}
                            {movement.status}
                          </p>
                        </div>
                        <p>{formatMoney(movement.amount)}</p>
                      </li>
                    ))}
                  </ul>
                </QueryState>
              </section>
            ) : null}

            {tab === 'pagos' ? (
              <section className="rounded-lg bg-white p-5 shadow-sm">
                <QueryState
                  isPending={paymentsQuery.isPending}
                  isError={paymentsQuery.isError}
                  isEmpty={!paymentsQuery.data?.length}
                >
                  <ul className="divide-y text-sm">
                    {(paymentsQuery.data ?? []).map((payment) => (
                      <li
                        key={payment.id}
                        className="flex flex-wrap justify-between gap-2 py-2"
                      >
                        <div>
                          <p className="font-medium">
                            {paymentMethodLabels[payment.method]} ·{' '}
                            {payment.reference}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDateTime(payment.createdAt)} ·{' '}
                            {payment.status}
                          </p>
                        </div>
                        <p>{formatMoney(payment.amount)}</p>
                      </li>
                    ))}
                  </ul>
                </QueryState>
              </section>
            ) : null}

            {tab === 'ubicacion' ? (
              <section className="rounded-lg bg-white p-5 shadow-sm">
                <p className="text-sm">{customer.address}</p>
                <Link
                  to="/admin/map"
                  className="mt-3 inline-block text-sm text-teal-800 underline"
                >
                  Abrir mapa operativo
                </Link>
              </section>
            ) : null}
          </div>
        )}
      </QueryState>
    </>
  );
}

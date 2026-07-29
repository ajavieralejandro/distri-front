import { Link } from 'react-router-dom';

import { useAccountSummaryQuery } from '@/features/accounts/hooks';
import { useDemoSession } from '@/features/auth/hooks';
import { useCustomerQuery } from '@/features/customers/hooks';
import { useCartStore } from '@/features/orders/cart-store';
import { useOrdersQuery } from '@/features/orders/hooks';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { useProductsQuery } from '@/features/products/hooks';
import { PageHeader } from '@/shared/components/PageHeader';
import { ProductImage } from '@/shared/components/ProductImage';
import { QueryState } from '@/shared/components/QueryState';
import { formatMoney } from '@/shared/lib/money';

export function CommerceDashboardPage() {
  const session = useDemoSession();
  const customer = useCustomerQuery(session?.commerceId);
  const account = useAccountSummaryQuery(session?.commerceId);
  const orders = useOrdersQuery({ commerceId: session?.commerceId });
  const products = useProductsQuery({ active: true });
  const cartCount = useCartStore((state) => state.getTotalItems());
  const cartTotal = useCartStore((state) => state.getSubtotal());

  const recentOrders = [...(orders.data ?? [])]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);
  const offers = (products.data ?? [])
    .filter((product) => product.offer || product.featured)
    .slice(0, 4);
  const frequent = (products.data ?? []).slice(0, 4);

  return (
    <>
      <PageHeader
        title={`Hola, ${customer.data?.tradeName ?? session?.displayName ?? 'comercio'}`}
        description="Pedí rápido desde el catálogo y seguí tu cuenta comercial."
        actions={
          <Link
            to="/commerce/catalog"
            className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white"
          >
            Ir al catálogo
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl bg-white p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold">Pedido en curso</h2>
            <Link
              to="/commerce/cart"
              className="text-sm text-teal-800 underline"
            >
              Ver pedido
            </Link>
          </div>
          {cartCount > 0 ? (
            <p className="mt-3 text-sm text-slate-700">
              Tenés <strong>{cartCount}</strong> ítems por un total de{' '}
              <strong>{formatMoney(cartTotal)}</strong>.
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              Todavía no agregaste productos. Empezá por el catálogo.
            </p>
          )}
        </section>
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Estado de cuenta</h2>
          <QueryState
            isPending={account.isPending}
            isError={account.isError}
            isEmpty={!account.data}
          >
            {account.data ? (
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Saldo</dt>
                  <dd className="font-medium">
                    {formatMoney(account.data.balance)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Crédito disponible</dt>
                  <dd>{formatMoney(account.data.availableCredit)}</dd>
                </div>
              </dl>
            ) : null}
          </QueryState>
          <Link
            to="/commerce/account"
            className="mt-3 inline-block text-sm text-teal-800 underline"
          >
            Ver cuenta comercial
          </Link>
        </section>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Últimos pedidos</h2>
            <Link
              to="/commerce/orders"
              className="text-sm text-teal-800 underline"
            >
              Ver todos
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500">Sin pedidos todavía.</p>
          ) : (
            <ul className="divide-y">
              {recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-2 py-2 text-sm"
                >
                  <span>{order.number}</span>
                  <OrderStatusBadge status={order.status} />
                  <span>{formatMoney(order.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold">Ofertas y destacados</h2>
          <div className="grid grid-cols-2 gap-3">
            {offers.map((product) => (
              <Link
                key={product.id}
                to="/commerce/catalog"
                className="rounded-lg border border-slate-200 p-2 hover:border-teal-700/40"
              >
                <ProductImage
                  name={product.name}
                  imageUrl={product.imageUrl}
                  className="h-20 w-full"
                />
                <p className="mt-2 text-sm font-medium">{product.name}</p>
                <p className="text-xs text-teal-900">
                  {formatMoney(product.price)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Productos frecuentes</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {frequent.map((product) => (
            <Link
              key={product.id}
              to="/commerce/catalog"
              className="rounded-lg border border-slate-200 p-3 hover:border-teal-700/40"
            >
              <ProductImage
                name={product.name}
                imageUrl={product.imageUrl}
                className="h-24 w-full"
              />
              <p className="mt-2 text-sm font-medium">{product.name}</p>
              <p className="text-xs text-slate-500">{product.brand}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

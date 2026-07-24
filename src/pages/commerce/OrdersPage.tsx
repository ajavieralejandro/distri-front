import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useDemoSession } from '@/features/auth/hooks';
import { useCartStore } from '@/features/orders/cart-store';
import { useOrdersQuery } from '@/features/orders/hooks';
import { useProductsQuery } from '@/features/products/hooks';
import { orderStatusLabels } from '@/shared/lib/labels';
import { formatMoney } from '@/shared/lib/money';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
import type { Order } from '@/shared/types/demo';

export function CommerceOrdersPage() {
  const session = useDemoSession();
  const query = useOrdersQuery({ commerceId: session?.commerceId });
  const productsQuery = useProductsQuery();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const [reorderMessage, setReorderMessage] = useState<string | null>(null);

  const repeatOrder = (order: Order) => {
    const warnings: string[] = [];
    const products = productsQuery.data ?? [];

    for (const item of order.items) {
      const product = products.find(
        (candidate) => candidate.id === item.productId,
      );
      if (!product || !product.active) {
        warnings.push(`${item.name}: inactivo o no disponible`);
        continue;
      }
      if (product.availableStock < item.quantity) {
        warnings.push(
          `${item.name}: stock insuficiente (disponible ${product.availableStock})`,
        );
        continue;
      }

      const existing = cartItems.find(
        (candidate) => candidate.productId === item.productId,
      );
      if (existing) {
        warnings.push(
          `${item.name}: ya estaba en el carrito (cantidad actual ${existing.quantity})`,
        );
        continue;
      }

      addItem(
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          unitPrice: product.price,
        },
        item.quantity,
      );
    }

    setReorderMessage(
      warnings.length > 0
        ? `Pedido preparado parcialmente. ${warnings.join(' · ')}`
        : 'Productos agregados al carrito.',
    );
  };

  return (
    <section>
      <PageHeader
        title="Mis pedidos"
        description="Historial de pedidos realizados desde el portal."
      />

      {reorderMessage ? (
        <p className="mb-4 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-800">
          {reorderMessage}{' '}
          <Link className="underline" to="/commerce/cart">
            Ir al carrito
          </Link>
        </p>
      ) : null}

      <QueryState
        isPending={query.isPending || productsQuery.isPending}
        isError={query.isError}
        isEmpty={!query.data?.length}
      >
        {query.data ? (
          <div className="space-y-3">
            {query.data.map((order) => (
              <article
                key={order.id}
                className="rounded-lg bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {order.number}
                    </p>
                    <p className="text-sm text-slate-600">
                      {orderStatusLabels[order.status]} ·{' '}
                      {new Date(order.createdAt).toLocaleString('es-AR')}
                    </p>
                  </div>
                  <p className="font-medium">{formatMoney(order.total)}</p>
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  {order.items
                    .map((item) => `${item.name} × ${item.quantity}`)
                    .join(', ')}
                </p>
                <button
                  type="button"
                  className="mt-3 rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                  onClick={() => repeatOrder(order)}
                >
                  Repetir pedido
                </button>
              </article>
            ))}
          </div>
        ) : null}
      </QueryState>
    </section>
  );
}

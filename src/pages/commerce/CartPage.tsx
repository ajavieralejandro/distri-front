import { Link } from 'react-router-dom';
import { useCartStore } from '@/features/orders/cart-store';
import { useCreateOrderMutation } from '@/features/orders/hooks';
import { useDemoSession } from '@/features/auth/hooks';
import { formatMoney } from '@/shared/lib/money';
import { PageHeader } from '@/shared/components/PageHeader';

export function CartPage() {
  const session = useDemoSession();
  const { items, increment, decrement, removeItem, clear, getSubtotal } =
    useCartStore();
  const create = useCreateOrderMutation();
  const submit = () =>
    session?.commerceId &&
    create.mutate(
      {
        commerceId: session.commerceId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
      { onSuccess: () => clear() },
    );
  return (
    <>
      <PageHeader
        title="Carrito"
        description="Revisá tu pedido antes de confirmarlo."
      />
      {create.data && (
        <p className="mb-4 rounded bg-emerald-50 p-3 text-emerald-800">
          Pedido creado.{' '}
          <Link className="underline" to="/commerce/orders">
            Ver pedidos
          </Link>
        </p>
      )}
      <div className="rounded-lg bg-white p-4 shadow-sm">
        {items.length === 0 ? (
          <p className="text-slate-600">Tu carrito está vacío.</p>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-wrap items-center justify-between gap-3 border-b pb-3"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm">{formatMoney(item.unitPrice)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      aria-label={`Restar ${item.name}`}
                      onClick={() => decrement(item.productId)}
                      className="rounded border px-2"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label={`Sumar ${item.name}`}
                      onClick={() => increment(item.productId)}
                      className="rounded border px-2"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-sm text-red-700"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-lg font-semibold">
              Subtotal: {formatMoney(getSubtotal())}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Importes demostrativos. El total definitivo será calculado por la
              API.
            </p>
            <div className="mt-4 flex gap-3">
              <button onClick={clear} className="rounded border px-3 py-2">
                Vaciar
              </button>
              <button
                disabled={create.isPending}
                onClick={submit}
                className="rounded bg-teal-700 px-3 py-2 text-white disabled:opacity-50"
              >
                Confirmar pedido
              </button>
            </div>
            {create.error && (
              <p role="alert" className="mt-2 text-sm text-red-700">
                {create.error.message}
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}

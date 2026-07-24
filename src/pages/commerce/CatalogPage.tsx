import { useState } from 'react';
import {
  useCategoriesQuery,
  useProductsQuery,
} from '@/features/products/hooks';
import { useCartStore } from '@/features/orders/cart-store';
import { formatMoney } from '@/shared/lib/money';
import { ProductPlaceholder } from '@/shared/components/ProductPlaceholder';
import { QueryState } from '@/shared/components/QueryState';
import { PageHeader } from '@/shared/components/PageHeader';

export function CatalogPage() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [message, setMessage] = useState('');
  const products = useProductsQuery({
    search,
    categoryId: categoryId || undefined,
    active: true,
  });
  const categories = useCategoriesQuery();
  const add = useCartStore((s) => s.addItem);
  return (
    <>
      <PageHeader
        title="Catálogo"
        description="Productos disponibles para tu comercio."
      />
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          aria-label="Buscar productos"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto"
          className="rounded border p-2"
        />
        <select
          aria-label="Categoría"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded border p-2"
        >
          <option value="">Todas las categorías</option>
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {message && (
        <p role="status" className="mb-4 text-sm text-emerald-700">
          {message}
        </p>
      )}
      <QueryState
        isPending={products.isPending}
        isError={products.isError}
        isEmpty={!products.data?.length}
      >
        {products.data && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.data.map((p) => (
              <article key={p.id} className="rounded-lg bg-white p-4 shadow-sm">
                <ProductPlaceholder name={p.name} />
                <h2 className="mt-3 font-semibold">{p.name}</h2>
                <p className="text-sm text-slate-500">{p.sku}</p>
                <p className="mt-2 font-medium">{formatMoney(p.price)}</p>
                <p className="text-sm">
                  {p.availableStock > 0
                    ? `${p.availableStock} disponibles`
                    : 'Sin stock'}
                </p>
                <button
                  type="button"
                  disabled={!p.availableStock}
                  onClick={() => {
                    add({
                      productId: p.id,
                      name: p.name,
                      sku: p.sku,
                      unitPrice: p.price,
                    });
                    setMessage(`${p.name} agregado al carrito`);
                  }}
                  className="mt-3 rounded bg-teal-700 px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                  Agregar
                </button>
              </article>
            ))}
          </div>
        )}
      </QueryState>
    </>
  );
}

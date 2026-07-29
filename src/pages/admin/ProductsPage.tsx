import { useMemo, useState } from 'react';

import { useProductsQuery } from '@/features/products/hooks';
import { PageHeader } from '@/shared/components/PageHeader';
import { ProductImage } from '@/shared/components/ProductImage';
import { QueryState } from '@/shared/components/QueryState';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatMoney } from '@/shared/lib/money';

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [active, setActive] = useState('');
  const [brand, setBrand] = useState('');
  const query = useProductsQuery({
    search: search || undefined,
    active: active === '' ? undefined : active === 'true',
  });

  const brands = useMemo(() => {
    const set = new Set((query.data ?? []).map((product) => product.brand));
    return Array.from(set).sort();
  }, [query.data]);

  const products = useMemo(() => {
    const list = query.data ?? [];
    if (!brand) return list;
    return list.filter((product) => product.brand === brand);
  }, [query.data, brand]);

  return (
    <>
      <PageHeader
        title="Productos"
        description="Catálogo de la distribuidora: precios, marcas y disponibilidad."
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          aria-label="Buscar productos"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Nombre, marca o código"
        />
        <select
          aria-label="Activo"
          value={active}
          onChange={(event) => setActive(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <select
          aria-label="Marca"
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todas las marcas</option>
          {brands.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <p className="mb-3 text-sm text-slate-600">
        {products.length} producto{products.length === 1 ? '' : 's'}
      </p>
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!products.length}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const low =
              product.availableStock > 0 && product.availableStock <= 10;
            const out = product.availableStock <= 0;
            return (
              <article
                key={product.id}
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div className="relative">
                  <ProductImage
                    name={product.name}
                    imageUrl={product.imageUrl}
                    className="h-36 w-full"
                  />
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                    {!product.active ? (
                      <StatusBadge label="Inactivo" tone="neutral" />
                    ) : null}
                    {product.offer ? (
                      <StatusBadge label="Oferta" tone="warning" />
                    ) : null}
                    {product.featured ? (
                      <StatusBadge label="Destacado" tone="success" />
                    ) : null}
                  </div>
                </div>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                  {product.brand}
                </p>
                <h2 className="font-semibold text-slate-900">{product.name}</h2>
                <p className="text-sm text-slate-600">
                  {product.presentation} · {product.sku}
                </p>
                <p className="mt-2 text-lg font-semibold text-teal-900">
                  {formatMoney(product.price)}
                </p>
                {product.wholesalePrice ? (
                  <p className="text-xs text-slate-500">
                    Mayorista {formatMoney(product.wholesalePrice)}
                  </p>
                ) : null}
                <p
                  className={`mt-1 text-sm ${
                    out
                      ? 'text-red-700'
                      : low
                        ? 'text-amber-700'
                        : 'text-slate-600'
                  }`}
                >
                  {out
                    ? 'Sin stock'
                    : low
                      ? `Stock bajo (${product.availableStock})`
                      : `${product.availableStock} disponibles`}
                </p>
              </article>
            );
          })}
        </div>
      </QueryState>
    </>
  );
}

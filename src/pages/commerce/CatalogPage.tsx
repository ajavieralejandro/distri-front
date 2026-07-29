import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  useCategoriesQuery,
  useProductsQuery,
} from '@/features/products/hooks';
import { useCartStore } from '@/features/orders/cart-store';
import { PageHeader } from '@/shared/components/PageHeader';
import { ProductImage } from '@/shared/components/ProductImage';
import { QueryState } from '@/shared/components/QueryState';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatMoney } from '@/shared/lib/money';
import type { Product } from '@/shared/types/demo';

type SortKey = 'name' | 'price-asc' | 'price-desc';

export function CatalogPage() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [availability, setAvailability] = useState<'all' | 'in' | 'out'>('all');
  const [offersOnly, setOffersOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('name');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [message, setMessage] = useState('');

  const productsQuery = useProductsQuery({ active: true });
  const categories = useCategoriesQuery();
  const add = useCartStore((state) => state.addItem);
  const itemCount = useCartStore((state) => state.getTotalItems());

  const brands = useMemo(() => {
    const set = new Set(
      (productsQuery.data ?? []).map((product) => product.brand),
    );
    return Array.from(set).sort();
  }, [productsQuery.data]);

  const filtered = useMemo(() => {
    let list = [...(productsQuery.data ?? [])];
    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.brand.toLowerCase().includes(term) ||
          product.sku.toLowerCase().includes(term),
      );
    }
    if (categoryId) {
      list = list.filter((product) => product.categoryId === categoryId);
    }
    if (brand) {
      list = list.filter((product) => product.brand === brand);
    }
    if (availability === 'in') {
      list = list.filter((product) => product.availableStock > 0);
    }
    if (availability === 'out') {
      list = list.filter((product) => product.availableStock <= 0);
    }
    if (offersOnly) {
      list = list.filter((product) => product.offer || product.featured);
    }
    list.sort((left, right) => {
      if (sort === 'price-asc') {
        return Number(left.price) - Number(right.price);
      }
      if (sort === 'price-desc') {
        return Number(right.price) - Number(left.price);
      }
      return left.name.localeCompare(right.name, 'es');
    });
    return list;
  }, [
    productsQuery.data,
    search,
    categoryId,
    brand,
    availability,
    offersOnly,
    sort,
  ]);

  const clearFilters = () => {
    setSearch('');
    setCategoryId('');
    setBrand('');
    setAvailability('all');
    setOffersOnly(false);
    setSort('name');
  };

  const qty = (productId: string) => quantities[productId] ?? 1;

  const addProduct = (product: Product) => {
    const quantity = qty(product.id);
    add(
      {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        unitPrice: product.price,
      },
      quantity,
    );
    setMessage(
      `${product.name} × ${quantity} agregado${quantity > 1 ? 's' : ''} al pedido`,
    );
  };

  const filters = (
    <div className="space-y-3">
      <input
        aria-label="Buscar productos"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar por nombre, marca o código"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <select
        aria-label="Categoría"
        value={categoryId}
        onChange={(event) => setCategoryId(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="">Todas las categorías</option>
        {categories.data?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <select
        aria-label="Marca"
        value={brand}
        onChange={(event) => setBrand(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="">Todas las marcas</option>
        {brands.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <select
        aria-label="Disponibilidad"
        value={availability}
        onChange={(event) =>
          setAvailability(event.target.value as 'all' | 'in' | 'out')
        }
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="all">Toda la disponibilidad</option>
        <option value="in">Con stock</option>
        <option value="out">Sin stock</option>
      </select>
      <select
        aria-label="Orden"
        value={sort}
        onChange={(event) => setSort(event.target.value as SortKey)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="name">Orden alfabético</option>
        <option value="price-asc">Precio: menor a mayor</option>
        <option value="price-desc">Precio: mayor a menor</option>
      </select>
      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={offersOnly}
          onChange={(event) => setOffersOnly(event.target.checked)}
        />
        Solo ofertas y destacados
      </label>
      <button
        type="button"
        onClick={clearFilters}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        Limpiar filtros
      </button>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Catálogo mayorista"
        description="Elegí productos, ajustá cantidades y armá tu pedido actual."
        actions={
          <Link
            to="/commerce/cart"
            className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white"
          >
            Pedido actual{itemCount > 0 ? ` (${itemCount})` : ''}
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm lg:hidden"
          onClick={() => setFiltersOpen(true)}
        >
          Filtros
        </button>
        {(categories.data ?? []).map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() =>
              setCategoryId((current) =>
                current === category.id ? '' : category.id,
              )
            }
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              categoryId === category.id
                ? 'bg-teal-700 text-white'
                : 'bg-white text-slate-700 shadow-sm'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {message ? (
        <p
          role="status"
          className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        >
          {message}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden rounded-xl bg-white p-4 shadow-sm lg:block">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Filtros</h2>
          {filters}
        </aside>

        <div>
          <p className="mb-3 text-sm text-slate-600">
            {filtered.length} producto{filtered.length === 1 ? '' : 's'}
          </p>
          <QueryState
            isPending={productsQuery.isPending}
            isError={productsQuery.isError}
            isEmpty={!filtered.length}
            emptyMessage="No hay productos con esos filtros."
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => {
                const lowStock =
                  product.availableStock > 0 && product.availableStock <= 10;
                const out = product.availableStock <= 0;
                return (
                  <article
                    key={product.id}
                    className="flex flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-teal-700/30"
                  >
                    <div className="relative overflow-hidden rounded-lg">
                      <ProductImage
                        name={product.name}
                        imageUrl={product.imageUrl}
                      />
                      <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                        {product.offer ? (
                          <StatusBadge label="Oferta" tone="warning" />
                        ) : null}
                        {product.isNew ? (
                          <StatusBadge label="Novedad" tone="info" />
                        ) : null}
                        {product.featured ? (
                          <StatusBadge label="Destacado" tone="success" />
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      {product.brand}
                    </p>
                    <h2 className="text-base font-semibold text-slate-900">
                      {product.name}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {product.presentation} · {product.sku}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-teal-900">
                      {formatMoney(product.price)}
                    </p>
                    {product.wholesalePrice ? (
                      <p className="text-xs text-slate-500">
                        Ref. mayorista {formatMoney(product.wholesalePrice)}
                      </p>
                    ) : null}
                    <p
                      className={`mt-1 text-sm ${
                        out
                          ? 'text-red-700'
                          : lowStock
                            ? 'text-amber-700'
                            : 'text-slate-600'
                      }`}
                    >
                      {out
                        ? 'Sin stock'
                        : lowStock
                          ? `Poco stock (${product.availableStock})`
                          : `${product.availableStock} disponibles`}
                    </p>
                    <div className="mt-auto flex items-center gap-2 pt-3">
                      <div className="inline-flex items-center rounded-lg border border-slate-300">
                        <button
                          type="button"
                          className="px-2.5 py-1.5 text-sm"
                          aria-label={`Disminuir ${product.name}`}
                          onClick={() =>
                            setQuantities((current) => ({
                              ...current,
                              [product.id]: Math.max(1, qty(product.id) - 1),
                            }))
                          }
                        >
                          −
                        </button>
                        <span className="min-w-8 text-center text-sm">
                          {qty(product.id)}
                        </span>
                        <button
                          type="button"
                          className="px-2.5 py-1.5 text-sm"
                          aria-label={`Aumentar ${product.name}`}
                          onClick={() =>
                            setQuantities((current) => ({
                              ...current,
                              [product.id]: qty(product.id) + 1,
                            }))
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={out}
                        onClick={() => addProduct(product)}
                        className="flex-1 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                      >
                        Agregar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </QueryState>
        </div>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-900/40 p-4 lg:hidden">
          <div className="ml-auto max-h-full w-full max-w-sm overflow-y-auto rounded-xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Filtros</h2>
              <button
                type="button"
                className="text-sm text-teal-800"
                onClick={() => setFiltersOpen(false)}
              >
                Cerrar
              </button>
            </div>
            {filters}
            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-teal-700 px-3 py-2 text-sm text-white"
              onClick={() => setFiltersOpen(false)}
            >
              Ver resultados
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

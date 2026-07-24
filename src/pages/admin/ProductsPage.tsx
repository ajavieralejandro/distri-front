import { useState } from 'react';
import { useProductsQuery } from '@/features/products/hooks';
import { formatMoney } from '@/shared/lib/money';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [active, setActive] = useState('');
  const query = useProductsQuery({
    search,
    active: active === '' ? undefined : active === 'true',
  });
  return (
    <>
      <PageHeader title="Productos" description="Catálogo y disponibilidad." />
      <div className="mb-4 flex gap-3">
        <input
          aria-label="Buscar productos"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded border p-2"
          placeholder="Buscar"
        />
        <select
          aria-label="Activo"
          value={active}
          onChange={(e) => setActive(e.target.value)}
          className="rounded border p-2"
        >
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!query.data?.length}
      >
        {query.data && (
          <div className="overflow-x-auto rounded-lg bg-white shadow">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3">Producto</th>
                  <th>Precio</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-3">
                      {p.name}
                      <span className="ml-2 text-slate-500">{p.sku}</span>
                    </td>
                    <td>{formatMoney(p.price)}</td>
                    <td
                      className={p.availableStock <= 5 ? 'text-amber-700' : ''}
                    >
                      {p.availableStock}
                      {p.availableStock <= 5 && ' · Bajo'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </QueryState>
    </>
  );
}

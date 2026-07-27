import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useCustomersQuery } from '@/features/customers/hooks';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { compareMoney } from '@/shared/lib/decimal';
import { formatMoney } from '@/shared/lib/money';

export function CustomersPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [status, setStatus] = useState(params.get('status') ?? '');

  useEffect(() => {
    const next = new URLSearchParams();
    if (search) next.set('search', search);
    if (status) next.set('status', status);
    setParams(next, { replace: true });
  }, [search, status, setParams]);

  const query = useCustomersQuery({
    search: search || undefined,
    status: status || undefined,
  });

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Comercios clientes (empresas). No confundir con depósitos de la distribuidora ni con sucursales del comercio."
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          aria-label="Buscar comercios"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Buscar"
        />
        <select
          aria-label="Estado"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          <option value="ACTIVE">Activos</option>
          <option value="INACTIVE">Inactivos</option>
        </select>
      </div>
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!query.data?.length}
      >
        {query.data && (
          <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="p-3">Comercio</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Saldo</th>
                  <th className="p-3">Crédito</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((commerce) => (
                  <tr key={commerce.id} className="border-b border-slate-100">
                    <td className="p-3">
                      <Link
                        className="text-teal-800 underline"
                        to={`/admin/customers/${commerce.id}`}
                      >
                        {commerce.tradeName}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {commerce.businessName}
                      </p>
                    </td>
                    <td className="p-3">
                      <StatusBadge
                        label={
                          commerce.status === 'ACTIVE' ? 'Activo' : 'Inactivo'
                        }
                        tone={
                          commerce.status === 'ACTIVE' ? 'success' : 'neutral'
                        }
                      />
                    </td>
                    <td className="p-3">{formatMoney(commerce.balance)}</td>
                    <td className="p-3">
                      {formatMoney(commerce.creditLimit)}
                      {compareMoney(commerce.balance, commerce.creditLimit) >
                      0 ? (
                        <span className="ml-2 text-xs text-red-700">
                          Excedido
                        </span>
                      ) : null}
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

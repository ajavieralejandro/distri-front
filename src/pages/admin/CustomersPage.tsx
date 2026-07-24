import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomersQuery } from '@/features/customers/hooks';
import { formatMoney } from '@/shared/lib/money';
import { QueryState } from '@/shared/components/QueryState';
import { PageHeader } from '@/shared/components/PageHeader';

export function CustomersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const query = useCustomersQuery({ search, status: status || undefined });
  return (
    <>
      <PageHeader title="Clientes" description="Comercios registrados." />
      <div className="mb-4 flex gap-3">
        <input
          aria-label="Buscar comercios"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded border p-2"
          placeholder="Buscar"
        />
        <select
          aria-label="Estado"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border p-2"
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
                <tr className="border-b">
                  <th className="p-3">Comercio</th>
                  <th>Estado</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="p-3">
                      <Link
                        className="text-teal-800 underline"
                        to={`/admin/customers/${c.id}`}
                      >
                        {c.tradeName}
                      </Link>
                    </td>
                    <td>{c.status}</td>
                    <td>{formatMoney(c.balance)}</td>
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

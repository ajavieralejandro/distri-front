import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomersQuery } from '@/features/customers/hooks';
import { PageHeader } from '@/shared/components/PageHeader';
export function CashierHomePage() {
  const [search, setSearch] = useState('');
  const query = useCustomersQuery({ search });
  return (
    <>
      <PageHeader
        title="Caja"
        description="Buscá un comercio para registrar una cobranza demo."
      />
      <input
        aria-label="Buscar comercio"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="mb-4 rounded border p-2"
        placeholder="Buscar comercio"
      />
      <ul className="divide-y rounded bg-white shadow">
        {query.data?.map((commerce) => (
          <li key={commerce.id} className="flex justify-between p-3">
            <span>{commerce.tradeName}</span>
            <Link
              to={`customers/${commerce.id}`}
              className="underline text-teal-800"
            >
              Cobrar
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

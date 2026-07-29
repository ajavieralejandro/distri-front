import { Link } from 'react-router-dom';

import { useDemoSession } from '@/features/auth/hooks';
import { useCustomerQuery } from '@/features/customers/hooks';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { commerceTypeLabels, commerceZoneLabels } from '@/shared/lib/labels';
import { formatMoney } from '@/shared/lib/money';

export function CommerceProfilePage() {
  const session = useDemoSession();
  const query = useCustomerQuery(session?.commerceId);

  return (
    <>
      <PageHeader
        title="Datos del comercio"
        description="Información de tu cuenta comercial en Distrisoft."
      />
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!query.data}
      >
        {query.data ? (
          <section className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">
                  {query.data.businessName}
                </h2>
                <p className="text-slate-600">{query.data.tradeName}</p>
              </div>
              <StatusBadge
                label={query.data.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                tone={query.data.status === 'ACTIVE' ? 'success' : 'neutral'}
              />
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-500">CUIT</dt>
                <dd>{query.data.taxId}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Tipo</dt>
                <dd>{commerceTypeLabels[query.data.commerceType]}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Zona</dt>
                <dd>{commerceZoneLabels[query.data.zone]}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Condición de pago</dt>
                <dd>{query.data.paymentTerms}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Teléfono</dt>
                <dd>{query.data.phone}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Email</dt>
                <dd>{query.data.email}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-slate-500">Dirección</dt>
                <dd>
                  {query.data.address}, {query.data.city}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Límite de crédito</dt>
                <dd>{formatMoney(query.data.creditLimit)}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Saldo</dt>
                <dd>{formatMoney(query.data.balance)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {query.data.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link
              to="/commerce/account"
              className="mt-5 inline-block text-sm text-teal-800 underline"
            >
              Ir a cuenta comercial
            </Link>
          </section>
        ) : null}
      </QueryState>
    </>
  );
}

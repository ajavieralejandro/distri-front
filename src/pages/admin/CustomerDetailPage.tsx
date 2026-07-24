import { useParams } from 'react-router-dom';
import { useCustomerQuery } from '@/features/customers/hooks';
import { formatMoney } from '@/shared/lib/money';
import { QueryState } from '@/shared/components/QueryState';
import { PageHeader } from '@/shared/components/PageHeader';
export function CustomerDetailPage() {
  const { customerId } = useParams();
  const query = useCustomerQuery(customerId);
  const customer = query.data;
  return (
    <>
      <PageHeader
        title="Detalle de comercio"
        description="Información comercial y de cuenta."
      />
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!customer}
      >
        {customer && (
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-xl font-semibold">{customer.businessName}</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-500">CUIT</dt>
                <dd>{customer.taxId}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Saldo</dt>
                <dd>{formatMoney(customer.balance)}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Email</dt>
                <dd>{customer.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Dirección</dt>
                <dd>{customer.address}</dd>
              </div>
            </dl>
          </div>
        )}
      </QueryState>
    </>
  );
}

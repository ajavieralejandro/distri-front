import { usePaymentsQuery } from '@/features/payments/hooks';
import { formatMoney } from '@/shared/lib/money';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
export function CashierPaymentsPage() {
  const query = usePaymentsQuery();
  return (
    <>
      <PageHeader
        title="Pagos registrados"
        description="Movimientos simulados de caja."
      />
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!query.data?.length}
      >
        {query.data && (
          <ul className="divide-y rounded bg-white shadow">
            {query.data.map((payment) => (
              <li key={payment.id} className="p-3">
                <strong>{payment.reference}</strong> ·{' '}
                {formatMoney(payment.amount)} · {payment.method}
              </li>
            ))}
          </ul>
        )}
      </QueryState>
    </>
  );
}

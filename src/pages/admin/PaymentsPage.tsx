import { usePaymentsQuery } from '@/features/payments/hooks';
import { formatMoney } from '@/shared/lib/money';
import { paymentMethodLabels, paymentStatusLabels } from '@/shared/lib/labels';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';

export function PaymentsPage() {
  const query = usePaymentsQuery();
  return (
    <>
      <PageHeader title="Pagos" description="Registros simulados de pagos." />
      <p className="mb-4 text-sm text-slate-600">
        Los pagos mostrados son demostrativos.
      </p>
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
                  <th className="p-3">Referencia</th>
                  <th>Método</th>
                  <th>Estado</th>
                  <th>Importe</th>
                  <th>Operación cliente</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-3">{p.reference}</td>
                    <td>{paymentMethodLabels[p.method]}</td>
                    <td>{paymentStatusLabels[p.status]}</td>
                    <td>{formatMoney(p.amount)}</td>
                    <td className="text-xs text-slate-500">
                      {p.clientOperationId ?? '—'}
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

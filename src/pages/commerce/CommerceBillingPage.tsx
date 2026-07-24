import { useDemoSession } from '@/features/auth/hooks';
import { useInvoicesQuery } from '@/features/billing/hooks';
import { DEMO_INVOICE_DISCLAIMER } from '@/shared/types/demo';
import { formatMoney } from '@/shared/lib/money';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
export function CommerceBillingPage() {
  const session = useDemoSession();
  const query = useInvoicesQuery(session?.commerceId);
  return (
    <>
      <PageHeader
        title="Facturas demo"
        description="Documentos propios sin validez fiscal."
      />
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!query.data?.length}
      >
        {query.data && (
          <div className="space-y-3">
            {query.data.map((invoice) => (
              <article key={invoice.id} className="rounded bg-white p-4 shadow">
                <strong>{invoice.number}</strong>
                <p>
                  {invoice.status} · {formatMoney(invoice.total)}
                </p>
                <p className="text-xs text-amber-800">
                  {DEMO_INVOICE_DISCLAIMER}
                </p>
                <button
                  onClick={() => window.print()}
                  className="mt-2 rounded border px-3 py-1"
                >
                  Imprimir
                </button>
              </article>
            ))}
          </div>
        )}
      </QueryState>
    </>
  );
}

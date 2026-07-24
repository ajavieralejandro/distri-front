import {
  useCancelInvoiceMutation,
  useIssueInvoiceMutation,
  useInvoicesQuery,
} from '@/features/billing/hooks';
import { Can } from '@/features/auth/Can';
import { formatMoney } from '@/shared/lib/money';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
export function AdminBillingPage() {
  const query = useInvoicesQuery();
  const issue = useIssueInvoiceMutation();
  const cancel = useCancelInvoiceMutation();
  return (
    <>
      <PageHeader
        title="Facturación demo"
        description="No son comprobantes fiscales."
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
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <strong>{invoice.number}</strong>
                    <p>
                      {invoice.status} · {formatMoney(invoice.total)}
                    </p>
                    <p className="text-xs text-amber-800">
                      {invoice.disclaimer}
                    </p>
                  </div>
                  <Can permission="billing:issue_demo">
                    <div className="flex gap-2">
                      {invoice.status === 'DRAFT' && (
                        <button
                          disabled={issue.isPending}
                          onClick={() => issue.mutate(invoice.id)}
                          className="rounded bg-teal-700 px-3 py-2 text-white"
                        >
                          Emitir
                        </button>
                      )}
                      {invoice.status !== 'CANCELLED_DEMO' && (
                        <button
                          disabled={cancel.isPending}
                          onClick={() => cancel.mutate(invoice.id)}
                          className="rounded border px-3 py-2"
                        >
                          Anular
                        </button>
                      )}
                      <button
                        onClick={() => window.print()}
                        className="rounded border px-3 py-2"
                      >
                        Imprimir
                      </button>
                    </div>
                  </Can>
                </div>
              </article>
            ))}
          </div>
        )}
      </QueryState>
    </>
  );
}

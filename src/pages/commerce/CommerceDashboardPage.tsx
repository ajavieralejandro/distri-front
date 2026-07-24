import { useDemoSession } from '@/features/auth/hooks';
import { useCommerceAnalyticsQuery } from '@/features/analytics/hooks';
import { formatMoney } from '@/shared/lib/money';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
export function CommerceDashboardPage() {
  const session = useDemoSession();
  const query = useCommerceAnalyticsQuery(session?.commerceId);
  const totals = query.data?.totals;
  return (
    <>
      <PageHeader
        title="Resumen"
        description="Actividad propia del comercio."
      />
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!totals}
      >
        {totals && (
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded bg-white p-4 shadow">
              Pedidos <strong className="block text-xl">{totals.orders}</strong>
            </article>
            <article className="rounded bg-white p-4 shadow">
              Compras{' '}
              <strong className="block text-xl">
                {formatMoney(totals.orderValue)}
              </strong>
            </article>
          </div>
        )}
      </QueryState>
    </>
  );
}

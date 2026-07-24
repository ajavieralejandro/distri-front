import { useAuditQuery } from '@/features/audit/hooks';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
export function AdminAuditPage() {
  const query = useAuditQuery();
  return (
    <>
      <PageHeader
        title="Auditoría"
        description="Eventos demostrativos de operaciones."
      />
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!query.data?.length}
      >
        {query.data && (
          <ul className="divide-y rounded bg-white shadow">
            {query.data.map((event) => (
              <li key={event.id} className="p-4">
                <strong>{event.summary}</strong>
                <p className="text-sm text-slate-600">
                  {event.userDisplayName} ·{' '}
                  {new Date(event.createdAt).toLocaleString('es-AR')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </QueryState>
    </>
  );
}

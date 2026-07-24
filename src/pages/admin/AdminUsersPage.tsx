import { useUsersQuery } from '@/features/users/hooks';
import { roleLabels } from '@/shared/lib/labels';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
export function AdminUsersPage() {
  const query = useUsersQuery();
  return (
    <>
      <PageHeader
        title="Usuarios demo"
        description="Cuentas disponibles para esta experiencia."
      />
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!query.data?.length}
      >
        {query.data && (
          <ul className="divide-y rounded bg-white shadow">
            {query.data.map((user) => (
              <li key={user.id} className="p-4">
                <strong>{user.displayName}</strong>
                <p className="text-sm">
                  {user.email} · {roleLabels[user.role]}
                </p>
              </li>
            ))}
          </ul>
        )}
      </QueryState>
    </>
  );
}

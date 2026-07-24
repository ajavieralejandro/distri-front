import { useQuery } from '@tanstack/react-query';

import { env } from '@/app/config/env';
import { fetchHealth } from '@/shared/api/health';
import { LoadingIndicator } from '@/shared/components/LoadingIndicator';

/**
 * Development-only indicator that polls the API health endpoint.
 * Does not gate navigation or simulate authentication.
 */
export function ApiStatus() {
  const query = useQuery({
    queryKey: ['health'],
    queryFn: ({ signal }) => fetchHealth(signal),
    enabled: env.isDevelopment,
    refetchInterval: 30_000,
    retry: 1,
  });

  if (!env.isDevelopment) {
    return null;
  }

  let statusLabel = 'Consultando API…';
  let statusClass = 'border-amber-200 bg-amber-50 text-amber-900';

  if (query.isSuccess) {
    statusLabel = `API disponible (${query.data.service})`;
    statusClass = 'border-emerald-200 bg-emerald-50 text-emerald-900';
  } else if (query.isError) {
    statusLabel = 'API no disponible';
    statusClass = 'border-red-200 bg-red-50 text-red-800';
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs ${statusClass}`}
      role="status"
      aria-live="polite"
    >
      {query.isPending ? <LoadingIndicator label={statusLabel} /> : statusLabel}
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { fetchAdminAnalytics, fetchCommerceAnalytics } from './api';

export function useAdminAnalyticsQuery(
  period: { from?: string; to?: string } = {},
) {
  return useQuery({
    queryKey: ['analytics', 'admin', period],
    queryFn: ({ signal }) => fetchAdminAnalytics({ ...period, signal }),
  });
}
export function useCommerceAnalyticsQuery(
  commerceId: string | undefined,
  period: { from?: string; to?: string } = {},
) {
  return useQuery({
    queryKey: ['analytics', 'commerce', commerceId, period],
    queryFn: ({ signal }) =>
      fetchCommerceAnalytics(commerceId!, { ...period, signal }),
    enabled: Boolean(commerceId),
  });
}

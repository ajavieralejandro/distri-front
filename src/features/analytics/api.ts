import { httpClient } from '@/shared/api/http-client';

export type Analytics = {
  totals: {
    orders: string;
    deliveredOrders: string;
    orderValue: string;
    payments: string;
    availableStock: string;
  };
};

export function fetchAdminAnalytics(
  params: { from?: string; to?: string; signal?: AbortSignal } = {},
) {
  const query = new URLSearchParams();
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);
  return httpClient.get<Analytics>(
    `/analytics/admin${query.size ? `?${query}` : ''}`,
    { signal: params.signal },
  );
}

export function fetchCommerceAnalytics(
  commerceId: string,
  params: { from?: string; to?: string; signal?: AbortSignal } = {},
) {
  const query = new URLSearchParams();
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);
  return httpClient.get<Analytics>(
    `/analytics/commerce/${commerceId}${query.size ? `?${query}` : ''}`,
    { signal: params.signal },
  );
}

import { httpClient } from '@/shared/api/http-client';
import type { Commerce } from '@/shared/types/demo';

export type CustomerListParams = {
  search?: string;
  status?: string;
  signal?: AbortSignal;
};

export function fetchCustomers(
  params: CustomerListParams = {},
): Promise<Commerce[]> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return httpClient.get<Commerce[]>(`/customers${suffix}`, {
    signal: params.signal,
  });
}

export function fetchCustomer(
  id: string,
  signal?: AbortSignal,
): Promise<Commerce> {
  return httpClient.get<Commerce>(`/customers/${id}`, { signal });
}

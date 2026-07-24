import { httpClient } from '@/shared/api/http-client';
import type { DemoInvoice } from '@/shared/types/demo';

export function fetchInvoices(commerceId?: string, signal?: AbortSignal) {
  return httpClient.get<DemoInvoice[]>(
    `/invoices${commerceId ? `?commerceId=${encodeURIComponent(commerceId)}` : ''}`,
    { signal },
  );
}
export function createInvoice(orderId: string) {
  return httpClient.post<DemoInvoice, { orderId: string }>('/invoices', {
    orderId,
  });
}
export function issueInvoice(id: string) {
  return httpClient.post<DemoInvoice, Record<string, never>>(
    `/invoices/${id}/issue`,
    {},
  );
}
export function cancelInvoice(id: string) {
  return httpClient.post<DemoInvoice, Record<string, never>>(
    `/invoices/${id}/cancel`,
    {},
  );
}

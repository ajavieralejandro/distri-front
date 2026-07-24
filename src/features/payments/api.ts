import { httpClient } from '@/shared/api/http-client';
import type { Payment, PaymentMethod } from '@/shared/types/demo';

export type PaymentListParams = {
  commerceId?: string;
  status?: string;
  method?: string;
  signal?: AbortSignal;
};

export type CreatePaymentBody = {
  commerceId: string;
  amount: string;
  method: PaymentMethod;
  clientOperationId?: string;
};

export function fetchPayments(
  params: PaymentListParams = {},
): Promise<Payment[]> {
  const query = new URLSearchParams();
  if (params.commerceId) query.set('commerceId', params.commerceId);
  if (params.status) query.set('status', params.status);
  if (params.method) query.set('method', params.method);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return httpClient.get<Payment[]>(`/payments${suffix}`, {
    signal: params.signal,
  });
}

export function createPayment(body: CreatePaymentBody): Promise<Payment> {
  return httpClient.post<Payment, CreatePaymentBody>('/payments', body);
}

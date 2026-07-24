import { httpClient } from '@/shared/api/http-client';
import type { Order, OrderStatus } from '@/shared/types/demo';

export type OrderListParams = {
  status?: string;
  commerceId?: string;
  signal?: AbortSignal;
};

export type CreateOrderBody = {
  commerceId: string;
  items: Array<{ productId: string; quantity: number }>;
};

export function fetchOrders(params: OrderListParams = {}): Promise<Order[]> {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.commerceId) query.set('commerceId', params.commerceId);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return httpClient.get<Order[]>(`/orders${suffix}`, { signal: params.signal });
}

export function fetchOrder(id: string, signal?: AbortSignal): Promise<Order> {
  return httpClient.get<Order>(`/orders/${id}`, { signal });
}

export function createOrder(body: CreateOrderBody): Promise<Order> {
  return httpClient.post<Order, CreateOrderBody>('/orders', body);
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  return httpClient.patch<Order, { status: OrderStatus }>(
    `/orders/${id}/status`,
    { status },
  );
}

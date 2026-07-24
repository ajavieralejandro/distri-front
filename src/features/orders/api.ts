import { httpClient } from '@/shared/api/http-client';
import type { Order, OrderStatus } from '@/shared/types/demo';

export type OrderListParams = {
  status?: string;
  commerceId?: string;
  warehouseId?: string;
  routeId?: string;
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
  if (params.warehouseId) query.set('warehouseId', params.warehouseId);
  if (params.routeId) query.set('routeId', params.routeId);
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

export type PrepareItemsBody = {
  items: Array<{
    productId: string;
    preparedQuantity: number;
    pickStatus: 'PICKED' | 'MISSING' | 'SUBSTITUTED_DEMO';
    missingQuantity?: number;
    itemNote?: string;
    substituteProductId?: string;
  }>;
};

export function prepareOrderItems(
  id: string,
  body: PrepareItemsBody,
): Promise<Order> {
  return httpClient.patch<Order, PrepareItemsBody>(
    `/orders/${id}/prepare-items`,
    body,
  );
}

export function readyForDispatch(id: string): Promise<Order> {
  return httpClient.post<Order, Record<string, never>>(
    `/orders/${id}/ready-for-dispatch`,
    {},
  );
}

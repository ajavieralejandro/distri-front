import { httpClient } from '@/shared/api/http-client';
import type { DeliveryResult, DeliveryRoute, Order } from '@/shared/types/demo';

export function fetchRoutes(signal?: AbortSignal) {
  return httpClient.get<DeliveryRoute[]>('/delivery/routes', { signal });
}
export function fetchRoute(id: string, signal?: AbortSignal) {
  return httpClient.get<{ route: DeliveryRoute; orders: Order[] }>(
    `/delivery/routes/${id}`,
    { signal },
  );
}
export function startRoute(id: string) {
  return httpClient.post<DeliveryRoute, Record<string, never>>(
    `/delivery/routes/${id}/start`,
    {},
  );
}
export function updateDelivery(
  id: string,
  body: {
    result: DeliveryResult;
    observation?: string;
    receivedByName?: string;
  },
) {
  return httpClient.patch<Order, typeof body>(`/orders/${id}/delivery`, body);
}

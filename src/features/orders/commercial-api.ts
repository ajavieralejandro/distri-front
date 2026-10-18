import { httpClient } from '@/shared/api/http-client';

import {
  commercialOrdersPath,
  commercialStatusBody,
  parseCommercialOrder,
  parseCommercialOrderPage,
  type CommercialOrder,
  type CommercialOrderStatus,
} from './commercial-order';

const PAGE_SIZE = 100;
const MAX_PAGES = 20;

export async function fetchCommercialOrders(
  input: {
    status?: CommercialOrderStatus;
    signal?: AbortSignal;
  } = {},
): Promise<CommercialOrder[]> {
  const orders: CommercialOrder[] = [];
  let page = 0;

  for (;;) {
    const body = await httpClient.get<unknown>(
      commercialOrdersPath({
        page,
        size: PAGE_SIZE,
        status: input.status,
      }),
      { signal: input.signal },
    );
    const parsed = parseCommercialOrderPage(body);
    orders.push(...parsed.items);
    page += 1;
    if (parsed.items.length === 0 || page >= parsed.totalPages) {
      return orders;
    }
    if (page >= MAX_PAGES) {
      throw new Error(
        'Hay más pedidos de los que esta pantalla puede mostrar. Afiná el estado antes de continuar.',
      );
    }
  }
}

export async function fetchCommercialOrder(
  id: string,
  signal?: AbortSignal,
): Promise<CommercialOrder> {
  const body = await httpClient.get<unknown>(`/orders/${id}`, { signal });
  return parseCommercialOrder(body);
}

export async function updateCommercialOrderStatus(
  id: string,
  status: CommercialOrderStatus,
): Promise<CommercialOrder> {
  const body = await httpClient.patch<
    unknown,
    { status: CommercialOrderStatus }
  >(`/orders/${id}/status`, commercialStatusBody(status));
  return parseCommercialOrder(body);
}

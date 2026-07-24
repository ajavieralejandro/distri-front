import { describe, expect, it } from 'vitest';

import {
  createOrder,
  fetchOrders,
  updateOrderStatus,
} from '@/features/orders/api';

describe('order flow (mock API)', () => {
  it('creates an order visible to administration', async () => {
    const order = await createOrder({
      commerceId: 'com-1',
      items: [{ productId: 'prod-1', quantity: 2 }],
    });

    expect(order.status).toBe('PENDING');
    const orders = await fetchOrders();
    expect(orders.some((candidate) => candidate.id === order.id)).toBe(true);
  });

  it('accepts a valid status transition', async () => {
    const order = await createOrder({
      commerceId: 'com-1',
      items: [{ productId: 'prod-2', quantity: 1 }],
    });
    const confirmed = await updateOrderStatus(order.id, 'CONFIRMED');
    expect(confirmed.status).toBe('CONFIRMED');
  });

  it('rejects an invalid status transition', async () => {
    const order = await createOrder({
      commerceId: 'com-1',
      items: [{ productId: 'prod-3', quantity: 1 }],
    });
    await expect(updateOrderStatus(order.id, 'DELIVERED')).rejects.toThrow();
  });
});

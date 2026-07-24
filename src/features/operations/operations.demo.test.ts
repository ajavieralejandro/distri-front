import { describe, expect, it } from 'vitest';

import {
  cancelInvoice,
  createInvoice,
  fetchInvoices,
  issueInvoice,
} from '@/features/billing/api';
import {
  createOrder,
  fetchOrders,
  readyForDispatch,
  updateOrderStatus,
} from '@/features/orders/api';
import { createPayment, fetchPayments } from '@/features/payments/api';
import { HttpError } from '@/shared/api/http-error';

describe('operations and billing (mock API)', () => {
  it('blocks READY_FOR_DISPATCH when preparation is incomplete', async () => {
    const order = await createOrder({
      commerceId: 'com-1',
      items: [{ productId: 'prod-1', quantity: 1 }],
    });
    await updateOrderStatus(order.id, 'CONFIRMED');
    await updateOrderStatus(order.id, 'PREPARING');
    await expect(readyForDispatch(order.id)).rejects.toBeInstanceOf(HttpError);
  });

  it('creates idempotent payments by clientOperationId', async () => {
    const op = 'op-demo-idempotent-1';
    const first = await createPayment({
      commerceId: 'com-1',
      amount: '500.00',
      method: 'CASH',
      clientOperationId: op,
    });
    const second = await createPayment({
      commerceId: 'com-1',
      amount: '500.00',
      method: 'CASH',
      clientOperationId: op,
    });
    expect(second.id).toBe(first.id);
    const payments = await fetchPayments({ commerceId: 'com-1' });
    expect(payments.filter((p) => p.clientOperationId === op)).toHaveLength(1);
  });

  it('allows demo invoice only for delivered orders', async () => {
    const pending = await createOrder({
      commerceId: 'com-1',
      items: [{ productId: 'prod-1', quantity: 1 }],
    });
    await expect(createInvoice(pending.id)).rejects.toBeInstanceOf(HttpError);

    const existing = await fetchInvoices();
    const invoiced = new Set(existing.map((invoice) => invoice.orderId));
    const delivered = (await fetchOrders()).find(
      (order) => order.status === 'DELIVERED' && !invoiced.has(order.id),
    );
    expect(delivered).toBeDefined();

    const draft = await createInvoice(delivered!.id);
    expect(draft.status).toBe('DRAFT');
    expect(draft.number).toMatch(/^DEMO-FC-/);
    expect(draft.disclaimer).toMatch(/SIN VALIDEZ FISCAL/i);
    const issued = await issueInvoice(draft.id);
    expect(issued.status).toBe('ISSUED_DEMO');
    const cancelled = await cancelInvoice(issued.id);
    expect(cancelled.status).toBe('CANCELLED_DEMO');
  });
});

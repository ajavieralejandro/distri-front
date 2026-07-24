import { getDatabase } from '@/mocks/data/mock-database';
import { HttpResponse, http } from 'msw';

import { api, withLatency } from './utils';

function analytics(commerceId?: string) {
  const db = getDatabase();
  const orders = db.orders.filter(
    (order) => !commerceId || order.commerceId === commerceId,
  );
  const payments = db.payments.filter(
    (payment) => !commerceId || payment.commerceId === commerceId,
  );
  return {
    totals: {
      orders: String(orders.length),
      deliveredOrders: String(
        orders.filter((order) => order.status === 'DELIVERED').length,
      ),
      orderValue: orders
        .reduce((sum, order) => sum + Number(order.total), 0)
        .toFixed(2),
      payments: payments
        .reduce((sum, payment) => sum + Number(payment.amount), 0)
        .toFixed(2),
      availableStock: String(
        db.inventory.reduce((sum, item) => sum + item.availableStock, 0),
      ),
    },
  };
}

export const analyticsHandlers = [
  http.get(api('/analytics/admin'), async () => {
    await withLatency();
    return HttpResponse.json(analytics());
  }),
  http.get(api('/analytics/commerce/:commerceId'), async ({ params }) => {
    await withLatency();
    return HttpResponse.json(analytics(String(params.commerceId)));
  }),
];

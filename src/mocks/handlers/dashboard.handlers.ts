import { getDatabase } from '@/mocks/data/mock-database';
import { sumMoney } from '@/shared/lib/decimal';
import { HttpResponse, http } from 'msw';

import { api, withLatency } from './utils';

export const dashboardHandlers = [
  http.get(api('/admin/dashboard'), async () => {
    await withLatency();
    const database = getDatabase();
    const recentOrders = [...database.orders]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 5);

    return HttpResponse.json({
      pendingOrders: database.orders.filter(
        (order) => order.status === 'PENDING',
      ).length,
      preparingOrders: database.orders.filter(
        (order) => order.status === 'PREPARING',
      ).length,
      lowStockProducts: database.products.filter((product) =>
        database.inventory.some(
          (item) =>
            item.productId === product.id &&
            item.availableStock <= item.lowStockThreshold,
        ),
      ),
      totalOutstandingBalance: sumMoney(
        database.commerces.map((commerce) => commerce.balance),
      ),
      recentOrders,
    });
  }),
];

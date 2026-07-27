import { buildAdminAlerts } from '@/mocks/data/build-admin-alerts';
import { getDatabase } from '@/mocks/data/mock-database';
import { sumMoney } from '@/shared/lib/decimal';
import { HttpResponse, http } from 'msw';

import { api, withLatency } from './utils';

const DAY_MS = 86_400_000;

export const dashboardHandlers = [
  http.get(api('/admin/dashboard'), async () => {
    await withLatency();
    const database = getDatabase();
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).getTime();

    const delivered = database.orders.filter(
      (order) => order.status === 'DELIVERED',
    );
    const salesToday = sumMoney(
      delivered
        .filter((order) => new Date(order.updatedAt).getTime() >= startOfDay)
        .map((order) => order.total),
    );
    const salesMonth = sumMoney(
      delivered
        .filter((order) => new Date(order.updatedAt).getTime() >= startOfMonth)
        .map((order) => order.total),
    );

    const lowStockItems = database.inventory.filter(
      (item) =>
        item.availableStock > 0 &&
        item.availableStock <= item.lowStockThreshold,
    );
    const outOfStockItems = database.inventory.filter(
      (item) => item.availableStock <= 0,
    );

    const lowStockProductIds = new Set(
      lowStockItems.map((item) => item.productId),
    );
    const lowStockProducts = database.products.filter((product) =>
      lowStockProductIds.has(product.id),
    );

    const recentOrders = [...database.orders]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 5);

    const pendingCollections = database.accountMovements.filter(
      (movement) =>
        movement.status === 'OPEN' || movement.status === 'OVERDUE',
    ).length;

    const delayedDeliveries = database.orders.filter(
      (order) =>
        (order.status === 'OUT_FOR_DELIVERY' ||
          order.status === 'READY_FOR_DISPATCH') &&
        Date.now() - new Date(order.updatedAt).getTime() > 2 * DAY_MS,
    ).length;

    return HttpResponse.json({
      salesToday,
      salesMonth,
      pendingOrders: database.orders.filter(
        (order) => order.status === 'PENDING',
      ).length,
      preparingOrders: database.orders.filter(
        (order) => order.status === 'PREPARING',
      ).length,
      readyOrders: database.orders.filter(
        (order) => order.status === 'READY_FOR_DISPATCH',
      ).length,
      dispatchedOrders: database.orders.filter(
        (order) => order.status === 'OUT_FOR_DELIVERY',
      ).length,
      delayedDeliveries,
      incidentOrders: database.orders.filter(
        (order) => order.status === 'DELIVERY_FAILED',
      ).length,
      pendingCollections,
      totalOutstandingBalance: sumMoney(
        database.commerces.map((commerce) => commerce.balance),
      ),
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      activeCommerces: database.commerces.filter(
        (commerce) => commerce.status === 'ACTIVE',
      ).length,
      lowStockProducts: lowStockProducts.slice(0, 8),
      recentOrders,
      recentAlertCount: buildAdminAlerts(database).length,
      warehouses: database.warehouses,
    });
  }),
];

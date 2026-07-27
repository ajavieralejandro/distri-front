import { assertTransition } from '@/features/orders/lib/order-transitions';
import { mutateDatabase } from '@/mocks/data/mock-database';
import { multiplyMoney, sumMoney } from '@/shared/lib/decimal';
import type {
  DemoDatabase,
  Order,
  OrderStatus,
  PickItemStatus,
} from '@/shared/types/demo';
import { HttpResponse, http } from 'msw';

import { api, appendAudit, withLatency } from './utils';

type CreateOrderRequest = {
  commerceId?: unknown;
  items?: unknown;
};

type StatusRequest = { status?: unknown };
type PrepareItemsRequest = {
  items?: Array<{
    productId?: unknown;
    preparedQuantity?: unknown;
    pickStatus?: unknown;
    missingQuantity?: unknown;
    itemNote?: unknown;
    substituteProductId?: unknown;
  }>;
};

type RequestedOrderItem = { productId?: unknown; quantity?: unknown };

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === 'string' &&
    [
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY_FOR_DISPATCH',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'DELIVERY_FAILED',
    ].includes(value)
  );
}

function isPickStatus(value: unknown): value is PickItemStatus {
  return (
    value === 'PENDING' ||
    value === 'PICKED' ||
    value === 'MISSING' ||
    value === 'SUBSTITUTED_DEMO'
  );
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === 'number' && value > 0;
}

function updateProductStock(database: DemoDatabase, productId: string): void {
  const product = database.products.find(
    (candidate) => candidate.id === productId,
  );
  if (product) {
    product.availableStock = database.inventory
      .filter((item) => item.productId === productId)
      .reduce((sum, item) => sum + item.availableStock, 0);
  }
}

function releaseReservation(database: DemoDatabase, order: Order): void {
  for (const item of order.items) {
    const inventory = database.inventory.find(
      (candidate) =>
        candidate.productId === item.productId &&
        candidate.warehouseId === order.warehouseId,
    );
    if (inventory) {
      inventory.reservedStock -= item.quantity;
      inventory.availableStock += item.quantity;
      updateProductStock(database, item.productId);
    }
  }
}

function completeDelivery(database: DemoDatabase, order: Order): void {
  for (const item of order.items) {
    const inventory = database.inventory.find(
      (candidate) =>
        candidate.productId === item.productId &&
        candidate.warehouseId === order.warehouseId,
    );
    if (inventory) {
      inventory.reservedStock -= item.quantity;
      inventory.physicalStock -= item.quantity;
      updateProductStock(database, item.productId);
    }
  }
}

export const orderHandlers = [
  http.get(api('/orders'), async ({ request }) => {
    await withLatency();
    const params = new URL(request.url).searchParams;
    const status = params.get('status');
    const commerceId = params.get('commerceId');
    const warehouseId = params.get('warehouseId');
    const routeId = params.get('routeId');
    const priority = params.get('priority');
    const search = (params.get('search') ?? '').trim().toLowerCase();
    const orders = mutateDatabase((database) =>
      database.orders.filter((order) => {
        const commerce = database.commerces.find(
          (candidate) => candidate.id === order.commerceId,
        );
        const matchesSearch =
          !search ||
          order.number.toLowerCase().includes(search) ||
          (commerce?.tradeName.toLowerCase().includes(search) ?? false) ||
          (commerce?.businessName.toLowerCase().includes(search) ?? false);
        return (
          matchesSearch &&
          (!status || order.status === status) &&
          (!commerceId || order.commerceId === commerceId) &&
          (!warehouseId || order.warehouseId === warehouseId) &&
          (!routeId || order.routeId === routeId) &&
          (!priority || order.priority === priority)
        );
      }),
    );
    return HttpResponse.json(orders);
  }),

  http.get(api('/orders/:id'), async ({ params }) => {
    await withLatency();
    const order = mutateDatabase((database) =>
      database.orders.find((candidate) => candidate.id === params.id),
    );
    return order
      ? HttpResponse.json(order)
      : HttpResponse.json(
          { message: 'Pedido no encontrado.' },
          { status: 404 },
        );
  }),

  http.post(api('/orders'), async ({ request }) => {
    await withLatency();
    const body = (await request.json()) as CreateOrderRequest;
    if (
      typeof body.commerceId !== 'string' ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return HttpResponse.json(
        { message: 'El comercio y al menos un producto son obligatorios.' },
        { status: 400 },
      );
    }

    const commerceId = body.commerceId;
    const requestedItems = body.items as RequestedOrderItem[];
    const result = mutateDatabase((database) => {
      if (!database.commerces.some((commerce) => commerce.id === commerceId)) {
        return { error: 'Comercio no encontrado.' };
      }

      const validatedItems: Array<{ productId: string; quantity: number }> = [];
      const seenProductIds = new Set<string>();
      for (const requested of requestedItems) {
        if (
          typeof requested.productId !== 'string' ||
          !isPositiveInteger(requested.quantity) ||
          seenProductIds.has(requested.productId)
        ) {
          return {
            error: 'Los productos y cantidades del pedido no son válidos.',
          };
        }
        seenProductIds.add(requested.productId);
        const stock = database.inventory.find(
          (item) =>
            item.productId === requested.productId &&
            item.warehouseId === 'wh-1',
        );
        if (!stock || stock.availableStock < requested.quantity) {
          return {
            error: 'No hay stock disponible para uno de los productos.',
          };
        }
        validatedItems.push({
          productId: requested.productId,
          quantity: requested.quantity,
        });
      }

      const items = validatedItems.map((requested) => {
        const product = database.products.find(
          (candidate) => candidate.id === requested.productId,
        )!;
        const quantity = requested.quantity;
        return {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          unitPrice: product.price,
          quantity,
          lineTotal: multiplyMoney(product.price, quantity),
          preparedQuantity: 0,
          pickStatus: 'PENDING' as const,
          missingQuantity: 0,
        };
      });

      for (const item of items) {
        const stock = database.inventory.find(
          (candidate) =>
            candidate.productId === item.productId &&
            candidate.warehouseId === 'wh-1',
        )!;
        stock.reservedStock += item.quantity;
        stock.availableStock -= item.quantity;
        updateProductStock(database, item.productId);
      }

      const timestamp = new Date().toISOString();
      const total = sumMoney(items.map((item) => item.lineTotal));
      const order: Order = {
        id: `ord-${database.orderSequence - 1000}`,
        number: `PED-${database.orderSequence}`,
        commerceId,
        branchId: database.branches.find(
          (branch) => branch.commerceId === commerceId,
        )?.id,
        warehouseId: 'wh-1',
        status: 'PENDING',
        priority: 'NORMAL',
        createdAt: timestamp,
        updatedAt: timestamp,
        items,
        subtotal: total,
        total,
        history: [
          {
            id: `ord-event-${database.orderSequence}`,
            orderId: `ord-${database.orderSequence - 1000}`,
            toStatus: 'PENDING',
            userId: 'usr-sales',
            userDisplayName: 'Ventas Demo',
            createdAt: timestamp,
            note: 'Pedido creado',
          },
        ],
        deliveryAddress: database.commerces.find(
          (commerce) => commerce.id === commerceId,
        )!.address,
        deliveryContactName: database.commerces.find(
          (commerce) => commerce.id === commerceId,
        )!.tradeName,
        deliveryContactPhone: database.commerces.find(
          (commerce) => commerce.id === commerceId,
        )!.phone,
      };
      database.orderSequence += 1;
      database.orders.unshift(order);
      return { order };
    });

    return 'error' in result
      ? HttpResponse.json({ message: result.error }, { status: 400 })
      : HttpResponse.json(result.order, { status: 201 });
  }),

  http.patch(api('/orders/:id/status'), async ({ params, request }) => {
    await withLatency();
    const body = (await request.json()) as StatusRequest;
    const nextStatus = body.status;
    if (!isOrderStatus(nextStatus)) {
      return HttpResponse.json(
        { message: 'Estado de pedido inválido.' },
        { status: 400 },
      );
    }

    const result = mutateDatabase((database) => {
      const order = database.orders.find(
        (candidate) => candidate.id === params.id,
      );
      if (!order) {
        return { error: 'Pedido no encontrado.', status: 404 };
      }
      try {
        assertTransition(order.status, nextStatus);
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : 'Transición inválida.',
          status: 400,
        };
      }

      const previousStatus = order.status;
      if (nextStatus === 'CANCELLED') {
        releaseReservation(database, order);
      } else if (nextStatus === 'DELIVERED') {
        completeDelivery(database, order);
      }
      order.status = nextStatus;
      order.updatedAt = new Date().toISOString();
      order.history.push({
        id: `ord-event-${order.id}-${order.history.length + 1}`,
        orderId: order.id,
        fromStatus: previousStatus,
        toStatus: nextStatus,
        userId: 'usr-admin',
        userDisplayName: 'Administrador Demo',
        createdAt: order.updatedAt,
        note: `Pedido ${nextStatus.toLowerCase()}`,
      });
      appendAudit(database, {
        userId: 'usr-admin',
        userDisplayName: 'Administrador Demo',
        action: 'ORDER_STATUS_CHANGED',
        entityType: 'order',
        entityId: order.id,
        summary: `Pedido ${order.number}: ${previousStatus} a ${nextStatus}.`,
      });
      return { order };
    });

    return 'error' in result
      ? HttpResponse.json({ message: result.error }, { status: result.status })
      : HttpResponse.json(result.order);
  }),

  http.patch(api('/orders/:id/prepare-items'), async ({ params, request }) => {
    await withLatency();
    const body = (await request.json()) as PrepareItemsRequest;
    if (!Array.isArray(body.items)) {
      return HttpResponse.json(
        { message: 'Los ítems son obligatorios.' },
        { status: 400 },
      );
    }
    const result = mutateDatabase((database) => {
      const order = database.orders.find(
        (candidate) => candidate.id === params.id,
      );
      if (!order) return { error: 'Pedido no encontrado.', status: 404 };
      for (const update of body.items!) {
        const item = order.items.find(
          (candidate) => candidate.productId === update.productId,
        );
        if (
          !item ||
          !isPickStatus(update.pickStatus) ||
          typeof update.preparedQuantity !== 'number' ||
          update.preparedQuantity < 0 ||
          update.preparedQuantity > item.quantity
        ) {
          return { error: 'Datos de preparación inválidos.', status: 400 };
        }
        item.preparedQuantity = update.preparedQuantity;
        item.pickStatus = update.pickStatus;
        item.missingQuantity =
          typeof update.missingQuantity === 'number'
            ? update.missingQuantity
            : 0;
        if (typeof update.itemNote === 'string')
          item.itemNote = update.itemNote;
        if (typeof update.substituteProductId === 'string')
          item.substituteProductId = update.substituteProductId;
      }
      order.updatedAt = new Date().toISOString();
      return { order };
    });
    return 'error' in result
      ? HttpResponse.json({ message: result.error }, { status: result.status })
      : HttpResponse.json(result.order);
  }),

  http.post(api('/orders/:id/ready-for-dispatch'), async ({ params }) => {
    await withLatency();
    const result = mutateDatabase((database) => {
      const order = database.orders.find(
        (candidate) => candidate.id === params.id,
      );
      if (!order) return { error: 'Pedido no encontrado.', status: 404 };
      if (order.items.some((item) => item.pickStatus === 'PENDING')) {
        return {
          error: 'Todos los ítems deben estar preparados.',
          status: 400,
        };
      }
      try {
        assertTransition(order.status, 'READY_FOR_DISPATCH');
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : 'Transición inválida.',
          status: 400,
        };
      }
      const timestamp = new Date().toISOString();
      order.history.push({
        id: `ord-event-${order.id}-${order.history.length + 1}`,
        orderId: order.id,
        fromStatus: order.status,
        toStatus: 'READY_FOR_DISPATCH',
        userId: 'usr-picker',
        userDisplayName: 'Depósito Demo',
        createdAt: timestamp,
      });
      order.status = 'READY_FOR_DISPATCH';
      order.updatedAt = timestamp;
      return { order };
    });
    return 'error' in result
      ? HttpResponse.json({ message: result.error }, { status: result.status })
      : HttpResponse.json(result.order);
  }),
];

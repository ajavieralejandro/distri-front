import { assertTransition } from '@/features/orders/lib/order-transitions';
import { mutateDatabase } from '@/mocks/data/mock-database';
import { HttpResponse, http } from 'msw';

import { api, appendAudit, withLatency } from './utils';

export const deliveryHandlers = [
  http.get(api('/delivery/routes'), async () => {
    await withLatency();
    return HttpResponse.json(mutateDatabase((db) => db.routes));
  }),
  http.get(api('/delivery/routes/:id'), async ({ params }) => {
    await withLatency();
    const result = mutateDatabase((db) => {
      const route = db.routes.find((candidate) => candidate.id === params.id);
      return route
        ? {
            route,
            orders: db.orders.filter((order) => order.routeId === route.id),
          }
        : undefined;
    });
    return result
      ? HttpResponse.json(result)
      : HttpResponse.json({ message: 'Ruta no encontrada.' }, { status: 404 });
  }),
  http.post(api('/delivery/routes/:id/start'), async ({ params }) => {
    await withLatency();
    const result = mutateDatabase((db) => {
      const route = db.routes.find((candidate) => candidate.id === params.id);
      if (!route) return undefined;
      route.status = 'IN_PROGRESS';
      route.startedAt = new Date().toISOString();
      return route;
    });
    return result
      ? HttpResponse.json(result)
      : HttpResponse.json({ message: 'Ruta no encontrada.' }, { status: 404 });
  }),
  http.patch(api('/orders/:id/delivery'), async ({ params, request }) => {
    await withLatency();
    const body = (await request.json()) as {
      result?: unknown;
      observation?: unknown;
      receivedByName?: unknown;
    };
    const delivered =
      body.result === 'DELIVERED_OK' || body.result === 'PARTIAL_DEMO';
    const result = mutateDatabase((db) => {
      const order = db.orders.find((candidate) => candidate.id === params.id);
      if (!order) return { error: 'Pedido no encontrado.', status: 404 };
      try {
        assertTransition(
          order.status,
          delivered ? 'DELIVERED' : 'DELIVERY_FAILED',
        );
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : 'Transición inválida.',
          status: 400,
        };
      }
      const toStatus = delivered ? 'DELIVERED' : 'DELIVERY_FAILED';
      const timestamp = new Date().toISOString();
      if (delivered) {
        for (const item of order.items) {
          const inventory = db.inventory.find(
            (candidate) =>
              candidate.productId === item.productId &&
              candidate.warehouseId === order.warehouseId,
          );
          if (inventory) {
            inventory.reservedStock -= item.quantity;
            inventory.physicalStock -= item.quantity;
            const product = db.products.find(
              (candidate) => candidate.id === item.productId,
            );
            if (product) {
              product.availableStock = db.inventory
                .filter((candidate) => candidate.productId === item.productId)
                .reduce((sum, candidate) => sum + candidate.availableStock, 0);
            }
          }
        }
      }
      order.history.push({
        id: `ord-event-${order.id}-${order.history.length + 1}`,
        orderId: order.id,
        fromStatus: order.status,
        toStatus,
        userId: 'usr-driver',
        userDisplayName: 'Reparto Demo',
        createdAt: timestamp,
      });
      order.status = toStatus;
      order.updatedAt = timestamp;
      order.deliveryResult = body.result as typeof order.deliveryResult;
      if (typeof body.observation === 'string')
        order.deliveryObservation = body.observation;
      if (typeof body.receivedByName === 'string')
        order.receivedByName = body.receivedByName;
      appendAudit(db, {
        userId: 'usr-driver',
        userDisplayName: 'Reparto Demo',
        action: 'DELIVERY_REPORTED',
        entityType: 'order',
        entityId: order.id,
        summary: `Resultado de entrega: ${String(body.result)}.`,
      });
      return { order };
    });
    return 'error' in result
      ? HttpResponse.json({ message: result.error }, { status: result.status })
      : HttpResponse.json(result.order);
  }),
];

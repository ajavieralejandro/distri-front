import { mutateDatabase } from '@/mocks/data/mock-database';
import type { InventoryMovement } from '@/shared/types/demo';
import { HttpResponse, http } from 'msw';

import { api, withLatency } from './utils';

type AdjustInventoryRequest = {
  productId?: unknown;
  warehouseId?: unknown;
  quantity?: unknown;
  reason?: unknown;
};

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

export const inventoryHandlers = [
  http.get(api('/inventory'), async ({ request }) => {
    await withLatency();
    const params = new URL(request.url).searchParams;
    const search = params.get('search')?.trim().toLowerCase();
    const warehouseId = params.get('warehouseId');
    const lowStock = params.get('lowStock') === 'true';
    const items = mutateDatabase((database) =>
      database.inventory.filter((item) => {
        const product = database.products.find(
          (candidate) => candidate.id === item.productId,
        );
        const matchesSearch =
          !search ||
          (product
            ? `${product.name} ${product.sku}`.toLowerCase().includes(search)
            : false);
        return (
          matchesSearch &&
          (!warehouseId || item.warehouseId === warehouseId) &&
          (!lowStock || item.availableStock <= item.lowStockThreshold)
        );
      }),
    );
    return HttpResponse.json(items);
  }),

  http.post(api('/inventory/adjust'), async ({ request }) => {
    await withLatency();
    const body = (await request.json()) as AdjustInventoryRequest;
    if (
      typeof body.productId !== 'string' ||
      typeof body.warehouseId !== 'string' ||
      !isInteger(body.quantity) ||
      typeof body.reason !== 'string' ||
      body.reason.trim().length === 0
    ) {
      return HttpResponse.json(
        {
          message:
            'Producto, depósito, cantidad entera y motivo son obligatorios.',
        },
        { status: 400 },
      );
    }

    const productId = body.productId;
    const warehouseId = body.warehouseId;
    const quantity = body.quantity;
    const reason = body.reason.trim();
    const result = mutateDatabase((database) => {
      const item = database.inventory.find(
        (candidate) =>
          candidate.productId === productId &&
          candidate.warehouseId === warehouseId,
      );
      if (!item) {
        return { error: 'Inventario no encontrado.' };
      }
      if (item.physicalStock + quantity < item.reservedStock) {
        return { error: 'El ajuste dejaría stock físico menor al reservado.' };
      }

      item.physicalStock += quantity;
      item.availableStock += quantity;
      const product = database.products.find(
        (candidate) => candidate.id === productId,
      );
      if (product) {
        product.availableStock = database.inventory
          .filter((candidate) => candidate.productId === productId)
          .reduce((total, candidate) => total + candidate.availableStock, 0);
      }

      const movement: InventoryMovement = {
        id: `imv-${database.inventoryMovements.length + 1}`,
        productId,
        warehouseId,
        quantity,
        reason,
        createdAt: new Date().toISOString(),
        simulated: true,
      };
      database.inventoryMovements.unshift(movement);
      return { item, movement };
    });

    return 'error' in result
      ? HttpResponse.json({ message: result.error }, { status: 400 })
      : HttpResponse.json(result, { status: 201 });
  }),
];

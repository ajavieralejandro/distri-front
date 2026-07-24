import { describe, expect, it } from 'vitest';

import { adjustInventory, fetchInventory } from '@/features/inventory/api';

describe('inventory adjust (mock API)', () => {
  it('applies a simulated stock adjustment', async () => {
    const before = await fetchInventory();
    const target = before[0];
    expect(target).toBeDefined();

    const result = await adjustInventory({
      productId: target!.productId,
      warehouseId: target!.warehouseId,
      quantity: 5,
      reason: 'Ajuste demo de prueba',
    });

    expect(result.item.availableStock).toBe(target!.availableStock + 5);
    expect(result.movement.simulated).toBe(true);
  });
});

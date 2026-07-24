import { describe, expect, it } from 'vitest';

import { getDatabase } from '@/mocks/data/mock-database';
import { resetDemoData } from '@/mocks/reset-demo';
import { useCartStore } from '@/features/orders/cart-store';

describe('reset demo data', () => {
  it('restores fixtures and clears the cart storage key', () => {
    useCartStore.getState().addItem(
      {
        productId: 'prod-1',
        name: 'Agua mineral',
        sku: 'BEB-001',
        unitPrice: '1250.00',
      },
      3,
    );

    const mutated = getDatabase();
    mutated.products[0]!.name = 'Producto modificado';

    resetDemoData();
    useCartStore.persist.clearStorage();
    useCartStore.setState({ items: [] });

    const restored = getDatabase();
    expect(restored.products[0]?.name).toBe('Agua mineral');
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

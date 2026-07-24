import { beforeEach, describe, expect, it } from 'vitest';

import { useCartStore } from './cart-store';

const water = {
  productId: 'prod-1',
  name: 'Agua mineral',
  sku: 'BEB-001',
  unitPrice: '1250.00',
};

describe('cart store', () => {
  beforeEach(() => {
    useCartStore.getState().clear();
  });

  it('adds, increments, decrements, removes and clears items', () => {
    const store = useCartStore.getState();
    store.addItem(water);
    store.increment(water.productId);
    expect(useCartStore.getState().items[0]?.quantity).toBe(2);

    useCartStore.getState().decrement(water.productId);
    expect(useCartStore.getState().items[0]?.quantity).toBe(1);

    useCartStore.getState().removeItem(water.productId);
    expect(useCartStore.getState().items).toEqual([]);

    useCartStore.getState().addItem(water, 2);
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('calculates a subtotal from integer-cent decimal helpers', () => {
    useCartStore.getState().addItem(water, 2);

    expect(useCartStore.getState().getSubtotal()).toBe('2500.00');
  });
});

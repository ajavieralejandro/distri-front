import { describe, expect, it } from 'vitest';

import {
  assertTransition,
  canTransition,
} from '@/features/orders/lib/order-transitions';

describe('order transitions', () => {
  it('allows valid transitions', () => {
    expect(canTransition('PENDING', 'CONFIRMED')).toBe(true);
    expect(canTransition('CONFIRMED', 'PREPARING')).toBe(true);
    expect(canTransition('PREPARING', 'READY_FOR_DISPATCH')).toBe(true);
    expect(canTransition('READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY')).toBe(true);
    expect(canTransition('OUT_FOR_DELIVERY', 'DELIVERED')).toBe(true);
    expect(canTransition('DELIVERY_FAILED', 'READY_FOR_DISPATCH')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(canTransition('PENDING', 'OUT_FOR_DELIVERY')).toBe(false);
    expect(canTransition('DELIVERED', 'PENDING')).toBe(false);
    expect(() => assertTransition('PENDING', 'DELIVERED')).toThrow();
  });
});

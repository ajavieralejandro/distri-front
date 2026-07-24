import { describe, expect, it } from 'vitest';

import {
  assertTransition,
  canTransition,
} from '@/features/orders/lib/order-transitions';

describe('order transitions', () => {
  it('allows valid transitions', () => {
    expect(canTransition('PENDING', 'CONFIRMED')).toBe(true);
    expect(canTransition('CONFIRMED', 'PREPARING')).toBe(true);
    expect(canTransition('PREPARING', 'SHIPPED')).toBe(true);
    expect(canTransition('SHIPPED', 'DELIVERED')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(canTransition('PENDING', 'SHIPPED')).toBe(false);
    expect(canTransition('DELIVERED', 'PENDING')).toBe(false);
    expect(() => assertTransition('PENDING', 'DELIVERED')).toThrow();
  });
});

import { describe, expect, it } from 'vitest';

import { apiHomePath, canApiSessionAccess } from '@/features/auth/api-access';

describe('api access', () => {
  it('lets an administrator into the distributor console', () => {
    expect(
      canApiSessionAccess('ADMIN', {
        roles: ['DISTRIBUTOR_ADMIN', 'SALES'],
      }),
    ).toBe(true);
    expect(apiHomePath('ADMIN')).toBe('/admin/orders');
  });

  it('keeps a commerce user out of the admin console', () => {
    expect(
      canApiSessionAccess('COMMERCE', {
        roles: ['DISTRIBUTOR_ADMIN', 'SALES'],
      }),
    ).toBe(false);
    expect(
      canApiSessionAccess('COMMERCE', {
        roles: ['COMMERCE_OWNER', 'COMMERCE_BUYER', 'COMMERCE_CASHIER'],
      }),
    ).toBe(false);
    expect(apiHomePath('COMMERCE')).toBe('/forbidden');
  });

  it('hides operational and payment areas that are not in the order contract', () => {
    expect(
      canApiSessionAccess('ADMIN', {
        roles: ['WAREHOUSE_PICKER', 'DISTRIBUTOR_ADMIN'],
      }),
    ).toBe(false);
    expect(
      canApiSessionAccess('ADMIN', { permission: 'payments:read_all' }),
    ).toBe(false);
    expect(canApiSessionAccess('ADMIN', { permission: 'orders:confirm' })).toBe(
      true,
    );
  });
});

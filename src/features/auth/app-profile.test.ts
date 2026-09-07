import { describe, expect, it } from 'vitest';

import { getAppProfile, getAppProfileLabel } from '@/features/auth/app-profile';
import type { DemoRole } from '@/shared/types/demo';

const ADMIN_SIDE_ROLES: DemoRole[] = [
  'DISTRIBUTOR_ADMIN',
  'SALES',
  'WAREHOUSE_PICKER',
  'CASHIER',
  'DRIVER',
];

const COMMERCE_SIDE_ROLES: DemoRole[] = [
  'COMMERCE_OWNER',
  'COMMERCE_BUYER',
  'COMMERCE_CASHIER',
];

describe('getAppProfile', () => {
  it('maps every distributor-side legacy role to ADMIN', () => {
    for (const role of ADMIN_SIDE_ROLES) {
      expect(getAppProfile(role)).toBe('ADMIN');
    }
  });

  it('maps every commerce-side legacy role to COMMERCE', () => {
    for (const role of COMMERCE_SIDE_ROLES) {
      expect(getAppProfile(role)).toBe('COMMERCE');
    }
  });

  it('exposes exactly two canonical profiles', () => {
    const profiles = new Set(
      [...ADMIN_SIDE_ROLES, ...COMMERCE_SIDE_ROLES].map(getAppProfile),
    );
    expect(profiles).toEqual(new Set(['ADMIN', 'COMMERCE']));
  });
});

describe('getAppProfileLabel', () => {
  it('labels admin-side roles as Administrador', () => {
    expect(getAppProfileLabel('SALES')).toBe('Administrador');
    expect(getAppProfileLabel('DISTRIBUTOR_ADMIN')).toBe('Administrador');
  });

  it('labels commerce-side roles as Comercio', () => {
    expect(getAppProfileLabel('COMMERCE_BUYER')).toBe('Comercio');
    expect(getAppProfileLabel('COMMERCE_OWNER')).toBe('Comercio');
  });
});

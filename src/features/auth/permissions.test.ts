import { describe, expect, it } from 'vitest';

import {
  canAccessCommerce,
  canAccessDelivery,
  canAccessWarehouse,
  getHomePath,
  hasPermission,
} from '@/features/auth/permissions';
import type { DemoSession } from '@/shared/types/demo';

const admin: DemoSession = {
  userId: 'usr-admin',
  role: 'DISTRIBUTOR_ADMIN',
  displayName: 'Admin',
  email: 'admin@demo.distrisoft.local',
  distributorId: 'dist-1',
};

const picker: DemoSession = {
  userId: 'usr-picker',
  role: 'WAREHOUSE_PICKER',
  displayName: 'Picker',
  email: 'deposito@demo.distrisoft.local',
  warehouseId: 'wh-1',
};

const driver: DemoSession = {
  userId: 'usr-driver',
  role: 'DRIVER',
  displayName: 'Driver',
  email: 'reparto@demo.distrisoft.local',
  assignedRouteId: 'route-1',
};

const owner: DemoSession = {
  userId: 'usr-owner',
  role: 'COMMERCE_OWNER',
  displayName: 'Owner',
  email: 'comercio@demo.distrisoft.local',
  commerceId: 'com-1',
};

const buyer: DemoSession = {
  userId: 'usr-buyer',
  role: 'COMMERCE_BUYER',
  displayName: 'Buyer',
  email: 'compras@demo.distrisoft.local',
  commerceId: 'com-1',
};

const commerceCashier: DemoSession = {
  userId: 'usr-com-cashier',
  role: 'COMMERCE_CASHIER',
  displayName: 'Cashier commerce',
  email: 'cajero.comercio@demo.distrisoft.local',
  commerceId: 'com-1',
  branchId: 'branch-1',
};

describe('hasPermission', () => {
  it('grants admin global analytics and inventory adjust', () => {
    expect(hasPermission('DISTRIBUTOR_ADMIN', 'analytics:view_global')).toBe(
      true,
    );
    expect(hasPermission('DISTRIBUTOR_ADMIN', 'inventory:adjust')).toBe(true);
  });

  it('blocks sales from inventory adjust and payments', () => {
    expect(hasPermission('SALES', 'inventory:adjust')).toBe(false);
    expect(hasPermission('SALES', 'payments:record')).toBe(false);
  });

  it('blocks picker from accounts', () => {
    expect(hasPermission('WAREHOUSE_PICKER', 'accounts:read_all')).toBe(false);
    expect(hasPermission('WAREHOUSE_PICKER', 'orders:prepare')).toBe(true);
  });

  it('allows cashier payments but not products manage', () => {
    expect(hasPermission('CASHIER', 'payments:record')).toBe(true);
    expect(hasPermission('CASHIER', 'products:manage')).toBe(false);
  });

  it('allows driver deliver only', () => {
    expect(hasPermission('DRIVER', 'orders:deliver')).toBe(true);
    expect(hasPermission('DRIVER', 'accounts:read_all')).toBe(false);
  });

  it('allows owner own analytics and payments; buyer cannot pay', () => {
    expect(hasPermission('COMMERCE_OWNER', 'analytics:view_own')).toBe(true);
    expect(hasPermission('COMMERCE_OWNER', 'payments:record')).toBe(true);
    expect(hasPermission('COMMERCE_BUYER', 'payments:record')).toBe(false);
    expect(hasPermission('COMMERCE_CASHIER', 'accounts:read_own')).toBe(false);
  });
});

describe('scope helpers', () => {
  it('scopes commerce access', () => {
    expect(canAccessCommerce(admin, 'com-2')).toBe(true);
    expect(canAccessCommerce(owner, 'com-1')).toBe(true);
    expect(canAccessCommerce(owner, 'com-2')).toBe(false);
    expect(canAccessCommerce(buyer, 'com-2')).toBe(false);
  });

  it('scopes warehouse access', () => {
    expect(canAccessWarehouse(picker, 'wh-1')).toBe(true);
    expect(canAccessWarehouse(picker, 'wh-2')).toBe(false);
    expect(canAccessWarehouse(admin, 'wh-2')).toBe(true);
  });

  it('scopes delivery routes', () => {
    expect(canAccessDelivery(driver, 'route-1')).toBe(true);
    expect(canAccessDelivery(driver, 'route-2')).toBe(false);
    expect(canAccessDelivery(admin, 'route-2')).toBe(true);
  });
});

describe('getHomePath', () => {
  it('maps roles to home areas', () => {
    expect(getHomePath('DISTRIBUTOR_ADMIN')).toBe('/admin/dashboard');
    expect(getHomePath('WAREHOUSE_PICKER')).toBe('/operations/warehouse');
    expect(getHomePath('CASHIER')).toBe('/operations/cashier');
    expect(getHomePath('DRIVER')).toBe('/operations/delivery');
    expect(getHomePath('COMMERCE_OWNER')).toBe('/commerce/dashboard');
    expect(getHomePath(commerceCashier.role)).toBe('/commerce/catalog');
  });
});

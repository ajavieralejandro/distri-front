import type { DemoRole, DemoSession, Permission } from '@/shared/types/demo';

/**
 * Demonstrative RBAC for the UI only.
 * Definitive authorization will be applied by Distrisoft API.
 */

const ROLE_PERMISSIONS: Record<DemoRole, readonly Permission[]> = {
  DISTRIBUTOR_ADMIN: [
    'analytics:view_global',
    'customers:read',
    'customers:manage',
    'products:read',
    'products:manage',
    'orders:create',
    'orders:read_all',
    'orders:confirm',
    'orders:prepare',
    'orders:dispatch',
    'orders:deliver',
    'orders:cancel',
    'inventory:read',
    'inventory:adjust',
    'accounts:read_all',
    'payments:read_all',
    'payments:record',
    'billing:read_all',
    'billing:issue_demo',
    'receipts:issue_demo',
    'users:manage_demo',
    'audit:read',
  ],
  SALES: [
    'analytics:view_global',
    'customers:read',
    'products:read',
    'orders:create',
    'orders:read_all',
    'orders:confirm',
    'orders:cancel',
  ],
  WAREHOUSE_PICKER: [
    'products:read',
    'orders:read_all',
    'orders:prepare',
    'inventory:read',
  ],
  CASHIER: [
    'customers:read',
    'accounts:read_all',
    'payments:read_all',
    'payments:record',
    'billing:read_all',
    'receipts:issue_demo',
  ],
  DRIVER: ['orders:read_all', 'orders:dispatch', 'orders:deliver'],
  COMMERCE_OWNER: [
    'analytics:view_own',
    'products:read',
    'orders:create',
    'orders:read_own',
    'accounts:read_own',
    'payments:read_own',
    'payments:record',
    'billing:read_own',
    'users:manage_demo',
  ],
  COMMERCE_BUYER: ['products:read', 'orders:create', 'orders:read_own'],
  COMMERCE_CASHIER: ['products:read', 'orders:create', 'orders:read_own'],
};

export function permissionsForRole(role: DemoRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(role: DemoRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canAccessCommerce(
  session: DemoSession,
  commerceId: string,
): boolean {
  if (
    session.role === 'DISTRIBUTOR_ADMIN' ||
    session.role === 'SALES' ||
    session.role === 'CASHIER'
  ) {
    return true;
  }

  return session.commerceId === commerceId;
}

export function canAccessWarehouse(
  session: DemoSession,
  warehouseId: string,
): boolean {
  if (session.role === 'DISTRIBUTOR_ADMIN' || session.role === 'SALES') {
    return true;
  }

  if (session.role === 'WAREHOUSE_PICKER') {
    return session.warehouseId === warehouseId;
  }

  return false;
}

export function canAccessDelivery(
  session: DemoSession,
  routeId: string,
): boolean {
  if (session.role === 'DISTRIBUTOR_ADMIN') {
    return true;
  }

  if (session.role === 'DRIVER') {
    return session.assignedRouteId === routeId;
  }

  return false;
}

export function getHomePath(role: DemoRole): string {
  switch (role) {
    case 'DISTRIBUTOR_ADMIN':
    case 'SALES':
      return '/admin/dashboard';
    case 'WAREHOUSE_PICKER':
      return '/operations/warehouse';
    case 'CASHIER':
      return '/operations/cashier';
    case 'DRIVER':
      return '/operations/delivery';
    case 'COMMERCE_OWNER':
      return '/commerce/dashboard';
    case 'COMMERCE_BUYER':
    case 'COMMERCE_CASHIER':
      return '/commerce/catalog';
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}

import type { DemoRole, Permission } from '@/shared/types/demo';

import type { ApiRole } from './api-session';

const ORDER_PERMISSIONS = new Set<Permission>([
  'orders:read_all',
  'orders:confirm',
  'orders:cancel',
]);

const OPERATIONAL_ROLES = new Set<DemoRole>([
  'WAREHOUSE_PICKER',
  'CASHIER',
  'DRIVER',
  'COMMERCE_OWNER',
  'COMMERCE_BUYER',
  'COMMERCE_CASHIER',
]);

/**
 * API mode only admits the role returned by the server.
 * ADMIN can open the distributor console and the order transitions the API
 * actually accepts. COMMERCE stays out of that console.
 */
export function canApiSessionAccess(
  role: ApiRole,
  gate: { roles?: readonly DemoRole[]; permission?: Permission },
): boolean {
  if (role !== 'ADMIN') {
    return false;
  }
  if (gate.permission && !ORDER_PERMISSIONS.has(gate.permission)) {
    return false;
  }
  if (!gate.roles) {
    return true;
  }
  if (gate.roles.some((candidate) => OPERATIONAL_ROLES.has(candidate))) {
    return false;
  }
  return (
    gate.roles.includes('DISTRIBUTOR_ADMIN') || gate.roles.includes('SALES')
  );
}

export function apiHomePath(role: ApiRole): string {
  return role === 'ADMIN' ? '/admin/orders' : '/forbidden';
}

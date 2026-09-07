import type { DemoRole } from '@/shared/types/demo';

/**
 * Canonical product-level profile. Distrisoft exposes exactly two profiles
 * today: ADMIN (distributor side) and COMMERCE (client side). Every DemoRole
 * still used internally (auth fixtures, granular permissions, operational
 * areas) maps to exactly one of these two — legacy roles keep their own
 * permissions/routes for reuse, but never surface as a third identity.
 */
export type AppProfile = 'ADMIN' | 'COMMERCE';

export const APP_PROFILE_LABELS: Record<AppProfile, string> = {
  ADMIN: 'Administrador',
  COMMERCE: 'Comercio',
};

export function getAppProfile(role: DemoRole): AppProfile {
  switch (role) {
    case 'DISTRIBUTOR_ADMIN':
    case 'SALES':
    case 'WAREHOUSE_PICKER':
    case 'CASHIER':
    case 'DRIVER':
      return 'ADMIN';
    case 'COMMERCE_OWNER':
    case 'COMMERCE_BUYER':
    case 'COMMERCE_CASHIER':
      return 'COMMERCE';
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}

export function getAppProfileLabel(role: DemoRole): string {
  return APP_PROFILE_LABELS[getAppProfile(role)];
}

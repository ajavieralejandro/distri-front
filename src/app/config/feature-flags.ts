import type { DemoFeatureFlags } from '@/shared/types/demo';

/** Local demo feature flags — not a remote provider. */
export const demoFeatureFlags: DemoFeatureFlags = {
  analytics: true,
  billing: true,
  cashier: true,
  warehouseOperations: true,
  deliveryOperations: true,
};

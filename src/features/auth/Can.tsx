import type { ReactNode } from 'react';

import { useDemoSession } from '@/features/auth/hooks';
import { hasPermission } from '@/features/auth/permissions';
import type { Permission } from '@/shared/types/demo';

type CanProps = {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Demonstrative UI gate only — not real security.
 * Definitive authorization will be applied by Distrisoft API.
 */
export function Can({ permission, children, fallback = null }: CanProps) {
  const session = useDemoSession();
  if (!session || !hasPermission(session.role, permission)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}

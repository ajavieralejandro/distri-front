import { Navigate, Outlet } from 'react-router-dom';

import { env } from '@/app/config/env';
import { useDemoSession } from '@/features/auth/hooks';
import { getHomePath, hasPermission } from '@/features/auth/permissions';
import type { DemoRole, Permission } from '@/shared/types/demo';

type RequireDemoAuthProps = {
  roles?: DemoRole[];
  permission?: Permission;
};

/**
 * Structural demo guard only.
 * The UI adapts navigation and visible actions; API will enforce authorization.
 */
export function RequireDemoAuth({ roles, permission }: RequireDemoAuthProps) {
  const session = useDemoSession();

  if (!env.isMockDataSource) {
    return <Outlet />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(session.role)) {
    return <Navigate to={getHomePath(session.role)} replace />;
  }

  if (permission && !hasPermission(session.role, permission)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}

import { Navigate, Outlet } from 'react-router-dom';
import { env } from '@/app/config/env';
import { useDemoSession } from '@/features/auth/hooks';
import type { DemoRole } from '@/shared/types/demo';
export function RequireDemoAuth({ roles }: { roles?: DemoRole[] }) {
  const session = useDemoSession();
  if (!env.isMockDataSource) return <Outlet />;
  if (!session) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(session.role))
    return (
      <Navigate
        to={session.role === 'ADMIN' ? '/admin/dashboard' : '/commerce/catalog'}
        replace
      />
    );
  return <Outlet />;
}

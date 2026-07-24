import { useQuery } from '@tanstack/react-query';

import { httpClient } from '@/shared/api/http-client';
import type { Order, Product } from '@/shared/types/demo';

export type AdminDashboardData = {
  pendingOrders: number;
  preparingOrders: number;
  lowStockProducts: Product[];
  totalOutstandingBalance: string;
  recentOrders: Order[];
};

export function fetchAdminDashboard(
  signal?: AbortSignal,
): Promise<AdminDashboardData> {
  return httpClient.get<AdminDashboardData>('/admin/dashboard', { signal });
}

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: ({ signal }) => fetchAdminDashboard(signal),
  });
}

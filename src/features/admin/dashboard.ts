import { useQuery } from '@tanstack/react-query';

import { httpClient } from '@/shared/api/http-client';
import type { Order, Product, Warehouse } from '@/shared/types/demo';

export type AdminDashboardData = {
  salesToday: string;
  salesMonth: string;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  dispatchedOrders: number;
  delayedDeliveries: number;
  incidentOrders: number;
  pendingCollections: number;
  totalOutstandingBalance: string;
  lowStockCount: number;
  outOfStockCount: number;
  activeCommerces: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
  recentAlertCount: number;
  warehouses: Warehouse[];
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

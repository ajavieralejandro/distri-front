import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createOrder,
  fetchOrder,
  fetchOrders,
  updateOrderStatus,
  type CreateOrderBody,
  type OrderListParams,
} from '@/features/orders/api';
import type { OrderStatus } from '@/shared/types/demo';

export function useOrdersQuery(params: Omit<OrderListParams, 'signal'> = {}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: ({ signal }) => fetchOrders({ ...params, signal }),
  });
}

export function useOrderQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: ({ signal }) => fetchOrder(id!, signal),
    enabled: Boolean(id),
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateOrderBody) => createOrder(body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] }),
      ]);
    },
  });
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] }),
      ]);
    },
  });
}

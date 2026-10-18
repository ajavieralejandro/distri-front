import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchCommercialOrder,
  fetchCommercialOrders,
  updateCommercialOrderStatus,
} from '@/features/orders/commercial-api';
import type { CommercialOrderStatus } from '@/features/orders/commercial-order';

export function useCommercialOrdersQuery() {
  return useQuery({
    queryKey: ['commercial-orders'],
    queryFn: ({ signal }) => fetchCommercialOrders({ signal }),
  });
}

export function useCommercialOrderQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['commercial-order', id],
    queryFn: ({ signal }) => fetchCommercialOrder(id!, signal),
    enabled: Boolean(id),
  });
}

export function useUpdateCommercialOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: CommercialOrderStatus;
    }) => updateCommercialOrderStatus(id, status),
    onSuccess: async (order) => {
      queryClient.setQueryData(['commercial-order', order.id], order);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['commercial-orders'] }),
        queryClient.invalidateQueries({
          queryKey: ['commercial-order', order.id],
        }),
      ]);
    },
  });
}

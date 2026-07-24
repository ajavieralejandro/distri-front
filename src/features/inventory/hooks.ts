import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import {
  adjustInventory,
  fetchInventory,
  type AdjustInventoryBody,
  type InventoryListParams,
} from '@/features/inventory/api';

export const stockAdjustSchema = z.object({
  quantity: z
    .number()
    .int('La cantidad debe ser un entero')
    .refine((value) => value !== 0, 'La cantidad no puede ser 0'),
  reason: z.string().trim().min(3, 'Indicá un motivo (mínimo 3 caracteres)'),
});

export type StockAdjustFormValues = z.infer<typeof stockAdjustSchema>;

export function useInventoryQuery(
  params: Omit<InventoryListParams, 'signal'> = {},
) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: ({ signal }) => fetchInventory({ ...params, signal }),
  });
}

export function useAdjustInventoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AdjustInventoryBody) => adjustInventory(body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] }),
      ]);
    },
  });
}

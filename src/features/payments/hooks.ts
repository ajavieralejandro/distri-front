import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import {
  createPayment,
  fetchPayments,
  type CreatePaymentBody,
  type PaymentListParams,
} from '@/features/payments/api';

export const demoPaymentSchema = z.object({
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Ingresá un importe válido (ej. 1500.00)'),
  method: z.enum(['CASH', 'TRANSFER', 'CARD', 'MERCADO_PAGO_DEMO']),
});

export type DemoPaymentFormValues = z.infer<typeof demoPaymentSchema>;

export function usePaymentsQuery(
  params: Omit<PaymentListParams, 'signal'> = {},
) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: ({ signal }) => fetchPayments({ ...params, signal }),
  });
}

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePaymentBody) => createPayment(body),
    onSuccess: async (_payment, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['payments'] }),
        queryClient.invalidateQueries({
          queryKey: ['accounts', variables.commerceId],
        }),
        queryClient.invalidateQueries({ queryKey: ['customers'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] }),
      ]);
    },
  });
}

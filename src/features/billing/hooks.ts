import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelInvoice,
  createInvoice,
  fetchInvoices,
  issueInvoice,
} from './api';

export function useInvoicesQuery(commerceId?: string) {
  return useQuery({
    queryKey: ['invoices', commerceId],
    queryFn: ({ signal }) => fetchInvoices(commerceId, signal),
  });
}
function useInvoiceMutation(action: (id: string) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: () => client.invalidateQueries({ queryKey: ['invoices'] }),
  });
}
export function useIssueInvoiceMutation() {
  return useInvoiceMutation(issueInvoice);
}
export function useCancelInvoiceMutation() {
  return useInvoiceMutation(cancelInvoice);
}
export function useCreateInvoiceMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => client.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

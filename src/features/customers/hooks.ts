import { useQuery } from '@tanstack/react-query';

import {
  fetchCustomer,
  fetchCustomers,
  type CustomerListParams,
} from '@/features/customers/api';

export function useCustomersQuery(
  params: Omit<CustomerListParams, 'signal'> = {},
) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: ({ signal }) => fetchCustomers({ ...params, signal }),
  });
}

export function useCustomerQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: ({ signal }) => fetchCustomer(id!, signal),
    enabled: Boolean(id),
  });
}

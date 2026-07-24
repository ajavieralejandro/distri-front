import { useQuery } from '@tanstack/react-query';

import {
  fetchAccountMovements,
  fetchAccountSummary,
} from '@/features/accounts/api';

export function useAccountSummaryQuery(commerceId: string | undefined) {
  return useQuery({
    queryKey: ['accounts', commerceId, 'summary'],
    queryFn: ({ signal }) => fetchAccountSummary(commerceId!, signal),
    enabled: Boolean(commerceId),
  });
}

export function useAccountMovementsQuery(commerceId: string | undefined) {
  return useQuery({
    queryKey: ['accounts', commerceId, 'movements'],
    queryFn: ({ signal }) => fetchAccountMovements(commerceId!, signal),
    enabled: Boolean(commerceId),
  });
}

import { httpClient } from '@/shared/api/http-client';
import type { AccountMovement } from '@/shared/types/demo';

export type AccountSummary = {
  balance: string;
  creditLimit: string;
  availableCredit: string;
};

export function fetchAccountSummary(
  commerceId: string,
  signal?: AbortSignal,
): Promise<AccountSummary> {
  return httpClient.get<AccountSummary>(`/accounts/${commerceId}/summary`, {
    signal,
  });
}

export function fetchAccountMovements(
  commerceId: string,
  signal?: AbortSignal,
): Promise<AccountMovement[]> {
  return httpClient.get<AccountMovement[]>(
    `/accounts/${commerceId}/movements`,
    { signal },
  );
}

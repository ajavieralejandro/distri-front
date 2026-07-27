import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { httpClient } from '@/shared/api/http-client';
import type { AdminAlert } from '@/shared/types/admin-ops';

const READ_ALERTS_KEY = 'distrisoft-admin-alerts-read';

function readStoredIds(): string[] {
  try {
    const raw = localStorage.getItem(READ_ALERTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : [];
  } catch {
    return [];
  }
}

function writeStoredIds(ids: string[]): void {
  localStorage.setItem(READ_ALERTS_KEY, JSON.stringify(ids));
}

export function fetchAdminAlerts(signal?: AbortSignal): Promise<AdminAlert[]> {
  return httpClient.get<AdminAlert[]>('/admin/alerts', { signal });
}

export function useAdminAlertsQuery() {
  return useQuery({
    queryKey: ['admin-alerts'],
    queryFn: ({ signal }) => fetchAdminAlerts(signal),
  });
}

export function useAlertReadState() {
  const queryClient = useQueryClient();
  const readIdsQuery = useQuery({
    queryKey: ['admin-alerts-read'],
    queryFn: () => readStoredIds(),
    initialData: () => readStoredIds(),
    staleTime: Infinity,
  });

  const markRead = useMutation({
    mutationFn: async (alertId: string) => {
      const next = Array.from(new Set([...readStoredIds(), alertId]));
      writeStoredIds(next);
      return next;
    },
    onSuccess: (ids) => {
      queryClient.setQueryData(['admin-alerts-read'], ids);
    },
  });

  const markAllRead = useMutation({
    mutationFn: async (alertIds: string[]) => {
      const next = Array.from(new Set([...readStoredIds(), ...alertIds]));
      writeStoredIds(next);
      return next;
    },
    onSuccess: (ids) => {
      queryClient.setQueryData(['admin-alerts-read'], ids);
    },
  });

  const readSet = useMemo(
    () => new Set(readIdsQuery.data ?? []),
    [readIdsQuery.data],
  );

  return { readSet, markRead, markAllRead };
}

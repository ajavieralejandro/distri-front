import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

import { env } from '@/app/config/env';
import { loginDemo, logoutDemo } from '@/features/auth/api';
import type { LoginFormValues } from '@/features/auth/schemas';
import {
  clearDemoSession,
  readDemoSession,
  subscribeDemoSession,
  writeDemoSession,
} from '@/features/auth/session';

const SESSION_QUERY_KEY = ['auth', 'demo-session'] as const;

export function useDemoSession() {
  return useSyncExternalStore(
    subscribeDemoSession,
    readDemoSession,
    () => null,
  );
}

export function useAuthSessionQuery() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => readDemoSession(),
    enabled: env.isMockDataSource,
    staleTime: Infinity,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: LoginFormValues) => {
      if (!env.isMockDataSource) {
        throw new Error(
          'La autenticación demo solo está disponible con VITE_DATA_SOURCE=mock.',
        );
      }
      return loginDemo(values);
    },
    onSuccess: (session) => {
      writeDemoSession(session);
      queryClient.setQueryData(SESSION_QUERY_KEY, session);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (env.isMockDataSource) {
        await logoutDemo();
      }
      clearDemoSession();
    },
    onSuccess: async () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
      await queryClient.invalidateQueries();
    },
  });
}

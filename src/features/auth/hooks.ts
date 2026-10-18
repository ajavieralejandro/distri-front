import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

import { env } from '@/app/config/env';
import {
  loginDemo,
  loginWithApi,
  logoutApi,
  logoutDemo,
} from '@/features/auth/api';
import {
  clearApiSession,
  readApiUser,
  subscribeApiSession,
} from '@/features/auth/api-session';
import type { LoginFormValues } from '@/features/auth/schemas';
import {
  clearDemoSession,
  readDemoSession,
  subscribeDemoSession,
  writeDemoSession,
} from '@/features/auth/session';
import { CancelledRequestError } from '@/shared/connection/request-scope';

const SESSION_QUERY_KEY = ['auth', 'demo-session'] as const;

export function useDemoSession() {
  return useSyncExternalStore(
    subscribeDemoSession,
    readDemoSession,
    () => null,
  );
}

export function useApiSession() {
  return useSyncExternalStore(subscribeApiSession, readApiUser, () => null);
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
        const user = await loginWithApi(values);
        return { source: 'api' as const, role: user.role };
      }
      const session = await loginDemo(values);
      writeDemoSession(session);
      return { source: 'demo' as const, role: session.role };
    },
    onSuccess: () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, readDemoSession());
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (env.isMockDataSource) {
        await logoutDemo();
      } else {
        try {
          await logoutApi();
        } catch (error) {
          if (error instanceof CancelledRequestError) {
            throw error;
          }
        }
      }
      clearDemoSession();
      clearApiSession();
    },
    onSuccess: async () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
      await queryClient.invalidateQueries();
    },
  });
}

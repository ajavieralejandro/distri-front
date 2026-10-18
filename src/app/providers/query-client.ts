import { QueryClient } from '@tanstack/react-query';

import { isHttpError } from '@/shared/api/http-error';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (
            isHttpError(error) &&
            (error.status === 401 || error.status === 403)
          ) {
            return false;
          }
          return failureCount < 1;
        },
      },
    },
  });
}

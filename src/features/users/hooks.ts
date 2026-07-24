import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from './api';
export function useUsersQuery() {
  return useQuery({
    queryKey: ['users'],
    queryFn: ({ signal }) => fetchUsers(signal),
  });
}

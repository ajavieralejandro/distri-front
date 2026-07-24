import { useQuery } from '@tanstack/react-query';
import { fetchAudit } from './api';
export function useAuditQuery() {
  return useQuery({
    queryKey: ['audit'],
    queryFn: ({ signal }) => fetchAudit(signal),
  });
}

import { useQuery } from '@tanstack/react-query';

import { httpClient } from '@/shared/api/http-client';
import type { CommerceMapItem } from '@/shared/types/admin-ops';

export type { CommerceMapItem };

export function fetchMapLocations(
  signal?: AbortSignal,
): Promise<CommerceMapItem[]> {
  return httpClient.get<CommerceMapItem[]>('/admin/map-locations', { signal });
}

export function useMapLocationsQuery() {
  return useQuery({
    queryKey: ['admin-map-locations'],
    queryFn: ({ signal }) => fetchMapLocations(signal),
  });
}

import { useQuery } from '@tanstack/react-query';

import { httpClient } from '@/shared/api/http-client';
import type { MapLocation } from '@/shared/types/admin-ops';

export function fetchMapLocations(
  signal?: AbortSignal,
): Promise<MapLocation[]> {
  return httpClient.get<MapLocation[]>('/admin/map-locations', { signal });
}

export function useMapLocationsQuery() {
  return useQuery({
    queryKey: ['admin-map-locations'],
    queryFn: ({ signal }) => fetchMapLocations(signal),
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchRoute, fetchRoutes, startRoute, updateDelivery } from './api';

export function useRoutesQuery() {
  return useQuery({
    queryKey: ['delivery', 'routes'],
    queryFn: ({ signal }) => fetchRoutes(signal),
  });
}
export function useRouteQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['delivery', 'route', id],
    queryFn: ({ signal }) => fetchRoute(id!, signal),
    enabled: Boolean(id),
  });
}
export function useStartRouteMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: startRoute,
    onSuccess: () => client.invalidateQueries({ queryKey: ['delivery'] }),
  });
}
export function useDeliveryUpdateMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      result: Parameters<typeof updateDelivery>[1]['result'];
      observation?: string;
      receivedByName?: string;
    }) => updateDelivery(id, body),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: ['orders'] }),
        client.invalidateQueries({ queryKey: ['delivery'] }),
      ]),
  });
}

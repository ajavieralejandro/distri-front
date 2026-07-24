import { getDatabase } from '@/mocks/data/mock-database';
import { HttpResponse, http } from 'msw';

import { api, withLatency } from './utils';

export const userHandlers = [
  http.get(api('/users'), async () => {
    await withLatency();
    return HttpResponse.json(
      getDatabase().users.map((user) => ({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        distributorId: user.distributorId,
        commerceId: user.commerceId,
        branchId: user.branchId,
        warehouseId: user.warehouseId,
        assignedRouteId: user.assignedRouteId,
      })),
    );
  }),
];

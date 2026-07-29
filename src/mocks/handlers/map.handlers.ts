import { HttpResponse, http } from 'msw';

import { buildCommerceMapItems } from '@/mocks/data/build-commerce-map';
import { getDatabase } from '@/mocks/data/mock-database';

import { api, withLatency } from './utils';

export const mapHandlers = [
  http.get(api('/admin/map-locations'), async () => {
    await withLatency();
    const database = getDatabase();
    const overdueCommerceIds = new Set(
      database.accountMovements
        .filter(
          (movement) =>
            movement.status === 'OVERDUE' ||
            (movement.status === 'OPEN' &&
              movement.dueDate &&
              new Date(movement.dueDate).getTime() < Date.now()),
        )
        .map((movement) => movement.commerceId),
    );
    return HttpResponse.json(
      buildCommerceMapItems(
        database.commerces,
        database.orders,
        overdueCommerceIds,
      ),
    );
  }),
];

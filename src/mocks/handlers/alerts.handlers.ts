import { HttpResponse, http } from 'msw';

import { buildAdminAlerts } from '@/mocks/data/build-admin-alerts';
import { getDatabase } from '@/mocks/data/mock-database';

import { api, withLatency } from './utils';

export const alertsHandlers = [
  http.get(api('/admin/alerts'), async () => {
    await withLatency();
    const database = getDatabase();
    return HttpResponse.json(buildAdminAlerts(database));
  }),
];

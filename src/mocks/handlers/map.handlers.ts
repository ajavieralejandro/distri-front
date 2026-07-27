import { HttpResponse, http } from 'msw';

import { buildMapLocations } from '@/mocks/data/build-map-locations';
import { getDatabase } from '@/mocks/data/mock-database';

import { api, withLatency } from './utils';

export const mapHandlers = [
  http.get(api('/admin/map-locations'), async () => {
    await withLatency();
    const database = getDatabase();
    return HttpResponse.json(buildMapLocations(database));
  }),
];

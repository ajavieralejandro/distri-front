import { getDatabase } from '@/mocks/data/mock-database';
import { HttpResponse, http } from 'msw';

import { api, withLatency } from './utils';

export const auditHandlers = [
  http.get(api('/audit'), async () => {
    await withLatency();
    return HttpResponse.json(getDatabase().auditEvents);
  }),
];

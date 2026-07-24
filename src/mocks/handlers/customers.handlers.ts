import { getDatabase } from '@/mocks/data/mock-database';
import { HttpResponse, http } from 'msw';

import { api, withLatency } from './utils';

export const customerHandlers = [
  http.get(api('/customers'), async ({ request }) => {
    await withLatency();
    const params = new URL(request.url).searchParams;
    const search = params.get('search')?.trim().toLowerCase();
    const status = params.get('status');
    const customers = getDatabase().commerces.filter((commerce) => {
      const matchesSearch =
        !search ||
        [commerce.businessName, commerce.tradeName, commerce.taxId]
          .join(' ')
          .toLowerCase()
          .includes(search);
      return matchesSearch && (!status || commerce.status === status);
    });
    return HttpResponse.json(customers);
  }),

  http.get(api('/customers/:id'), async ({ params }) => {
    await withLatency();
    const customer = getDatabase().commerces.find(
      (commerce) => commerce.id === params.id,
    );
    return customer
      ? HttpResponse.json(customer)
      : HttpResponse.json(
          { message: 'Comercio no encontrado.' },
          { status: 404 },
        );
  }),
];

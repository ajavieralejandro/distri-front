import { getDatabase } from '@/mocks/data/mock-database';
import { subtractMoney } from '@/shared/lib/decimal';
import { HttpResponse, http } from 'msw';

import { api, withLatency } from './utils';

export const accountHandlers = [
  http.get(api('/accounts/:commerceId/summary'), async ({ params }) => {
    await withLatency();
    const commerce = getDatabase().commerces.find(
      (candidate) => candidate.id === params.commerceId,
    );
    if (!commerce) {
      return HttpResponse.json(
        { message: 'Comercio no encontrado.' },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      balance: commerce.balance,
      creditLimit: commerce.creditLimit,
      availableCredit: subtractMoney(commerce.creditLimit, commerce.balance),
    });
  }),

  http.get(api('/accounts/:commerceId/movements'), async ({ params }) => {
    await withLatency();
    const database = getDatabase();
    if (
      !database.commerces.some((commerce) => commerce.id === params.commerceId)
    ) {
      return HttpResponse.json(
        { message: 'Comercio no encontrado.' },
        { status: 404 },
      );
    }
    return HttpResponse.json(
      database.accountMovements.filter(
        (movement) => movement.commerceId === params.commerceId,
      ),
    );
  }),
];

import { mutateDatabase } from '@/mocks/data/mock-database';
import { subtractMoney } from '@/shared/lib/decimal';
import type {
  AccountMovement,
  Payment,
  PaymentMethod,
} from '@/shared/types/demo';
import { HttpResponse, http } from 'msw';

import { api, withLatency } from './utils';

type CreatePaymentRequest = {
  commerceId?: unknown;
  amount?: unknown;
  method?: unknown;
};

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    value === 'TRANSFER' || value === 'CARD' || value === 'MERCADO_PAGO_DEMO'
  );
}

function isMoney(value: unknown): value is string {
  return typeof value === 'string' && /^\d+(?:\.\d{1,2})?$/.test(value);
}

export const paymentHandlers = [
  http.get(api('/payments'), async ({ request }) => {
    await withLatency();
    const params = new URL(request.url).searchParams;
    const commerceId = params.get('commerceId');
    const status = params.get('status');
    const method = params.get('method');
    const payments = mutateDatabase((database) =>
      database.payments.filter(
        (payment) =>
          (!commerceId || payment.commerceId === commerceId) &&
          (!status || payment.status === status) &&
          (!method || payment.method === method),
      ),
    );
    return HttpResponse.json(payments);
  }),

  http.post(api('/payments'), async ({ request }) => {
    await withLatency();
    const body = (await request.json()) as CreatePaymentRequest;
    if (
      typeof body.commerceId !== 'string' ||
      !isMoney(body.amount) ||
      Number(body.amount) <= 0 ||
      !isPaymentMethod(body.method)
    ) {
      return HttpResponse.json(
        {
          message:
            'Comercio, importe y medio de pago válidos son obligatorios.',
        },
        { status: 400 },
      );
    }

    const commerceId = body.commerceId;
    const amount = body.amount;
    const method = body.method;
    const result = mutateDatabase((database) => {
      const commerce = database.commerces.find(
        (candidate) => candidate.id === commerceId,
      );
      if (!commerce) {
        return { error: 'Comercio no encontrado.' };
      }

      const timestamp = new Date().toISOString();
      const id = database.payments.length + 1;
      const payment: Payment = {
        id: `pay-${id}`,
        commerceId: commerce.id,
        amount,
        method,
        status: 'COMPLETED',
        createdAt: timestamp,
        reference: `PAG-DEMO-${String(id).padStart(3, '0')}`,
        simulated: true,
      };
      commerce.balance = subtractMoney(commerce.balance, payment.amount);
      const movement: AccountMovement = {
        id: `acc-${database.accountMovements.length + 1}`,
        commerceId: commerce.id,
        type: 'PAYMENT',
        description: 'Pago de demo recibido',
        amount: payment.amount,
        balanceAfter: commerce.balance,
        createdAt: timestamp,
        reference: payment.reference,
        status: 'PAID',
      };
      database.payments.unshift(payment);
      database.accountMovements.unshift(movement);
      return { payment };
    });

    return 'error' in result
      ? HttpResponse.json({ message: result.error }, { status: 404 })
      : HttpResponse.json(result.payment, { status: 201 });
  }),
];

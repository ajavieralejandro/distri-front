import { mutateDatabase } from '@/mocks/data/mock-database';
import { subtractMoney } from '@/shared/lib/decimal';
import type {
  AccountMovement,
  Payment,
  PaymentMethod,
} from '@/shared/types/demo';
import { HttpResponse, http } from 'msw';

import { api, appendAudit, withLatency } from './utils';

type CreatePaymentRequest = {
  commerceId?: unknown;
  amount?: unknown;
  method?: unknown;
  clientOperationId?: unknown;
};

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    value === 'CASH' ||
    value === 'TRANSFER' ||
    value === 'CARD' ||
    value === 'MERCADO_PAGO_DEMO'
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
    const clientOperationId =
      typeof body.clientOperationId === 'string'
        ? body.clientOperationId
        : undefined;
    const result = mutateDatabase((database) => {
      const commerce = database.commerces.find(
        (candidate) => candidate.id === commerceId,
      );
      if (!commerce) {
        return { error: 'Comercio no encontrado.' };
      }
      if (clientOperationId) {
        const existing = database.payments.find(
          (payment) => payment.clientOperationId === clientOperationId,
        );
        if (existing) return { payment: existing, duplicate: true };
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
        clientOperationId,
        recordedByUserId: 'usr-cashier',
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
      const receipt = {
        id: `rcp-${database.receiptSequence}`,
        number: `DEMO-RC-${String(database.receiptSequence).padStart(6, '0')}`,
        commerceId: commerce.id,
        paymentId: payment.id,
        issuedAt: timestamp,
        amount: payment.amount,
        paymentMethod: payment.method,
        allocations: [
          { description: 'Pago registrado en demo', amount: payment.amount },
        ],
        disclaimer: 'RECIBO DEMOSTRATIVO — SIN VALIDEZ FISCAL',
      };
      database.receiptSequence += 1;
      database.receipts.unshift(receipt);
      appendAudit(database, {
        userId: 'usr-cashier',
        userDisplayName: 'Caja Demo',
        action: 'PAYMENT_RECORDED',
        entityType: 'payment',
        entityId: payment.id,
        summary: `Pago ${payment.reference} registrado.`,
      });
      return { payment, duplicate: false };
    });

    return 'error' in result
      ? HttpResponse.json({ message: result.error }, { status: 404 })
      : HttpResponse.json(result.payment, {
          status: result.duplicate ? 200 : 201,
        });
  }),
];

import { mutateDatabase } from '@/mocks/data/mock-database';
import { DEMO_INVOICE_DISCLAIMER } from '@/shared/types/demo';
import { HttpResponse, http } from 'msw';

import { api, appendAudit, withLatency } from './utils';

export const billingHandlers = [
  http.get(api('/invoices'), async ({ request }) => {
    await withLatency();
    const commerceId = new URL(request.url).searchParams.get('commerceId');
    return HttpResponse.json(
      mutateDatabase((db) =>
        db.invoices.filter(
          (invoice) => !commerceId || invoice.commerceId === commerceId,
        ),
      ),
    );
  }),
  http.post(api('/invoices'), async ({ request }) => {
    await withLatency();
    const body = (await request.json()) as { orderId?: unknown };
    const result = mutateDatabase((db) => {
      const order = db.orders.find(
        (candidate) => candidate.id === body.orderId,
      );
      if (!order || order.status !== 'DELIVERED')
        return { error: 'Solo se puede facturar un pedido entregado.' };
      if (db.invoices.some((invoice) => invoice.orderId === order.id))
        return { error: 'El pedido ya tiene factura.' };
      const invoice = {
        id: `inv-${db.invoiceSequence}`,
        number: `DEMO-FC-${String(db.invoiceSequence).padStart(6, '0')}`,
        commerceId: order.commerceId,
        orderId: order.id,
        status: 'DRAFT' as const,
        subtotal: order.subtotal,
        tax: '0.00',
        total: order.total,
        items: order.items.map((line) => ({
          productId: line.productId,
          sku: line.sku,
          name: line.name,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          lineTotal: line.lineTotal,
        })),
        disclaimer: DEMO_INVOICE_DISCLAIMER,
      };
      db.invoiceSequence += 1;
      db.invoices.unshift(invoice);
      return { invoice };
    });
    return 'error' in result
      ? HttpResponse.json({ message: result.error }, { status: 400 })
      : HttpResponse.json(result.invoice, { status: 201 });
  }),
  http.post(api('/invoices/:id/issue'), async ({ params }) => {
    await withLatency();
    const result = mutateDatabase((db) => {
      const invoice = db.invoices.find(
        (candidate) => candidate.id === params.id,
      );
      if (!invoice) return undefined;
      invoice.status = 'ISSUED_DEMO';
      invoice.issuedAt = new Date().toISOString();
      appendAudit(db, {
        userId: 'usr-cashier',
        userDisplayName: 'Caja Demo',
        action: 'INVOICE_ISSUED',
        entityType: 'invoice',
        entityId: invoice.id,
        summary: `Factura ${invoice.number} emitida.`,
      });
      return invoice;
    });
    return result
      ? HttpResponse.json(result)
      : HttpResponse.json(
          { message: 'Factura no encontrada.' },
          { status: 404 },
        );
  }),
  http.post(api('/invoices/:id/cancel'), async ({ params }) => {
    await withLatency();
    const result = mutateDatabase((db) => {
      const invoice = db.invoices.find(
        (candidate) => candidate.id === params.id,
      );
      if (!invoice) return undefined;
      invoice.status = 'CANCELLED_DEMO';
      return invoice;
    });
    return result
      ? HttpResponse.json(result)
      : HttpResponse.json(
          { message: 'Factura no encontrada.' },
          { status: 404 },
        );
  }),
];

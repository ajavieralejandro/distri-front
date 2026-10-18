import { afterEach, describe, expect, it, vi } from 'vitest';

import { updateCommercialOrderStatus } from '@/features/orders/commercial-api';
import {
  canCommercialTransition,
  commercialOrdersPath,
  commercialStatusBody,
  commercialTransitions,
  filterCommercialOrders,
  parseCommercialOrder,
  type CommercialOrder,
} from '@/features/orders/commercial-order';

const order: CommercialOrder = {
  id: 'ord-1',
  number: 'PED-41',
  commerceId: 'com-norte',
  commerceName: 'Kiosco Norte',
  status: 'PENDING',
  createdAt: '2026-10-18T12:00:00.000Z',
  updatedAt: '2026-10-18T12:00:00.000Z',
  notes: null,
  paymentMethod: 'CASH',
  paidAmount: { amount: '0.00', currency: 'ARS' },
  delivery: {
    mode: 'DELIVERY',
    recipient: 'Norte',
    phone: '1100000000',
    address: 'Av. Siempre Viva 123',
    city: 'Rosario',
    references: 'Portón verde',
  },
  items: [
    {
      productId: 'prod-1',
      sku: 'AGUA',
      name: 'Agua',
      unit: 'PACK',
      unitPrice: { amount: '850.50', currency: 'ARS' },
      quantity: 2,
      lineTotal: { amount: '1701.00', currency: 'ARS' },
    },
  ],
  subtotal: { amount: '1701.00', currency: 'ARS' },
  total: { amount: '1701.00', currency: 'ARS' },
  history: [],
};

describe('commercial orders', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('follows the API transitions and ignores demo dispatch states', () => {
    expect(canCommercialTransition('PENDING', 'CONFIRMED')).toBe(true);
    expect(canCommercialTransition('PENDING', 'CANCELLED')).toBe(true);
    expect(canCommercialTransition('CONFIRMED', 'PREPARING')).toBe(true);
    expect(canCommercialTransition('PREPARING', 'DELIVERED')).toBe(true);
    expect(canCommercialTransition('PENDING', 'DELIVERED')).toBe(false);
    expect(canCommercialTransition('DELIVERED', 'CANCELLED')).toBe(false);
    expect(commercialTransitions('PENDING')).toEqual([
      'CONFIRMED',
      'CANCELLED',
    ]);
  });

  it('sends only the next status when confirming', () => {
    expect(commercialStatusBody('CONFIRMED')).toEqual({ status: 'CONFIRMED' });
    expect(JSON.stringify(commercialStatusBody('CONFIRMED'))).not.toContain(
      'paidAmount',
    );
  });

  it('requests only the list filters the API accepts', () => {
    expect(commercialOrdersPath({ page: 0, size: 100 })).toBe(
      '/orders?page=0&size=100',
    );
    expect(
      commercialOrdersPath({ page: 1, size: 100, status: 'PENDING' }),
    ).toBe('/orders?page=1&size=100&status=PENDING');
    expect(commercialOrdersPath({ page: 0, size: 100 })).not.toContain(
      'search',
    );
    expect(commercialOrdersPath({ page: 0, size: 100 })).not.toContain(
      'priority',
    );
  });

  it('keeps paid amount and delivery from the API payload', () => {
    const parsed = parseCommercialOrder(order);
    expect(parsed.paidAmount.amount).toBe('0.00');
    expect(parsed.paymentMethod).toBe('CASH');
    expect(parsed.delivery.address).toBe('Av. Siempre Viva 123');
    expect(parsed.items[0]?.quantity).toBe(2);
  });

  it('rejects a demo-only status instead of inventing a transition', () => {
    expect(() =>
      parseCommercialOrder({ ...order, status: 'READY_FOR_DISPATCH' }),
    ).toThrow(/estado de pedido/);
  });

  it('filters by commerce, number or address without asking the API', () => {
    const other: CommercialOrder = {
      ...order,
      id: 'ord-2',
      number: 'PED-42',
      commerceName: 'Sur',
      delivery: { ...order.delivery, address: 'Otra 9', city: 'Sur' },
    };
    expect(
      filterCommercialOrders([order, other], {
        status: '',
        search: 'siempre viva',
      }).map((item) => item.id),
    ).toEqual(['ord-1']);
    expect(
      filterCommercialOrders([order, other], {
        status: 'CONFIRMED',
        search: '',
      }),
    ).toEqual([]);
  });

  it('patches the status endpoint without a payment body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ...order, status: 'CONFIRMED' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const updated = await updateCommercialOrderStatus('ord-1', 'CONFIRMED');

    expect(updated.status).toBe('CONFIRMED');
    expect(updated.paidAmount.amount).toBe('0.00');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/orders/ord-1/status');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(String(init.body))).toEqual({ status: 'CONFIRMED' });
  });
});

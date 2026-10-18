export const COMMERCIAL_ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'DELIVERED',
  'CANCELLED',
] as const;

export type CommercialOrderStatus = (typeof COMMERCIAL_ORDER_STATUSES)[number];

export type CommercialPaymentMethod = 'CASH' | 'TRANSFER' | 'CARD';

export type CommercialMoney = {
  amount: string;
  currency: 'ARS';
};

export type CommercialDelivery = {
  mode: 'PICKUP' | 'DELIVERY';
  recipient: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  references: string | null;
};

export type CommercialOrderItem = {
  productId: string;
  sku: string;
  name: string;
  unit: 'UNIT' | 'PACK' | 'BOX';
  unitPrice: CommercialMoney;
  quantity: number;
  lineTotal: CommercialMoney;
};

export type CommercialOrderEvent = {
  id: string;
  fromStatus: CommercialOrderStatus | null;
  toStatus: CommercialOrderStatus;
  createdAt: string;
  note: string | null;
};

export type CommercialOrder = {
  id: string;
  number: string;
  commerceId: string;
  commerceName: string;
  status: CommercialOrderStatus;
  createdAt: string;
  updatedAt: string;
  notes: string | null;
  paymentMethod: CommercialPaymentMethod | null;
  paidAmount: CommercialMoney;
  delivery: CommercialDelivery;
  items: CommercialOrderItem[];
  subtotal: CommercialMoney;
  total: CommercialMoney;
  history: CommercialOrderEvent[];
};

/**
 * Transitions accepted by PATCH /orders/{id}/status.
 * Demo states such as READY_FOR_DISPATCH are not part of this contract.
 */
export const COMMERCIAL_TRANSITIONS: Record<
  CommercialOrderStatus,
  readonly CommercialOrderStatus[]
> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export const COMMERCIAL_TRANSITION_LABELS: Record<
  CommercialOrderStatus,
  string
> = {
  PENDING: 'Volver a pendiente',
  CONFIRMED: 'Confirmar pedido',
  PREPARING: 'Pasar a preparación',
  DELIVERED: 'Marcar como entregado',
  CANCELLED: 'Cancelar pedido',
};

export const COMMERCIAL_PAYMENT_LABELS: Record<
  CommercialPaymentMethod,
  string
> = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
  CARD: 'Tarjeta',
};

export const COMMERCIAL_UNIT_LABELS: Record<
  CommercialOrderItem['unit'],
  string
> = {
  UNIT: 'unidad',
  PACK: 'pack',
  BOX: 'caja',
};

const MONEY_AMOUNT = /^-?\d+\.\d{2}$/;

export function commercialTransitions(
  status: CommercialOrderStatus,
): readonly CommercialOrderStatus[] {
  return COMMERCIAL_TRANSITIONS[status];
}

export function canCommercialTransition(
  from: CommercialOrderStatus,
  to: CommercialOrderStatus,
): boolean {
  return COMMERCIAL_TRANSITIONS[from].includes(to);
}

export function commercialStatusBody(status: CommercialOrderStatus): {
  status: CommercialOrderStatus;
} {
  return { status };
}

export function commercialOrdersPath(input: {
  page: number;
  size: number;
  status?: CommercialOrderStatus;
}): string {
  const query = new URLSearchParams();
  query.set('page', String(input.page));
  query.set('size', String(input.size));
  if (input.status) {
    query.set('status', input.status);
  }
  return `/orders?${query.toString()}`;
}

export function filterCommercialOrders(
  orders: readonly CommercialOrder[],
  input: { status: string; search: string },
): CommercialOrder[] {
  const search = input.search.trim().toLocaleLowerCase();
  return orders.filter((order) => {
    if (input.status && order.status !== input.status) {
      return false;
    }
    if (!search) {
      return true;
    }
    const haystack = [
      order.number,
      order.commerceName,
      order.delivery.address,
      order.delivery.city,
      order.delivery.recipient,
    ]
      .filter((value): value is string => Boolean(value))
      .join(' ')
      .toLocaleLowerCase();
    return haystack.includes(search);
  });
}

export function deliverySummary(order: CommercialOrder): string {
  if (order.delivery.mode === 'PICKUP') {
    return 'Retiro en distribuidora';
  }
  const place = [order.delivery.address, order.delivery.city]
    .filter((value): value is string => Boolean(value))
    .join(', ');
  return place || 'Envío a domicilio';
}

export function parseCommercialOrder(payload: unknown): CommercialOrder {
  const record = expectRecord(payload, 'pedido');
  const items = expectArray(record.items, 'items').map(parseItem);
  return {
    id: expectString(record.id, 'id'),
    number: expectString(record.number, 'number'),
    commerceId: expectString(record.commerceId, 'commerceId'),
    commerceName: expectString(record.commerceName, 'commerceName'),
    status: expectStatus(record.status),
    createdAt: expectString(record.createdAt, 'createdAt'),
    updatedAt: expectString(record.updatedAt, 'updatedAt'),
    notes: expectNullableString(record.notes, 'notes'),
    paymentMethod: expectPaymentMethod(record.paymentMethod),
    paidAmount: expectMoney(record.paidAmount, 'paidAmount'),
    delivery: parseDelivery(record.delivery),
    items,
    subtotal: expectMoney(record.subtotal, 'subtotal'),
    total: expectMoney(record.total, 'total'),
    history: Array.isArray(record.history)
      ? record.history.map(parseEvent)
      : [],
  };
}

export function parseCommercialOrderPage(payload: unknown): {
  items: CommercialOrder[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
} {
  const record = expectRecord(payload, 'listado');
  return {
    items: expectArray(record.items, 'items').map(parseCommercialOrder),
    page: expectNumber(record.page, 'page'),
    size: expectNumber(record.size, 'size'),
    totalItems: expectNumber(record.totalItems, 'totalItems'),
    totalPages: expectNumber(record.totalPages, 'totalPages'),
  };
}

function parseItem(payload: unknown): CommercialOrderItem {
  const record = expectRecord(payload, 'ítem');
  const quantity = expectNumber(record.quantity, 'quantity');
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error('La API devolvió un pedido con una cantidad inválida.');
  }
  const unit = record.unit;
  if (unit !== 'UNIT' && unit !== 'PACK' && unit !== 'BOX') {
    throw new Error('La API devolvió un pedido con una unidad no reconocida.');
  }
  return {
    productId: expectString(record.productId, 'productId'),
    sku: expectString(record.sku, 'sku'),
    name: expectString(record.name, 'name'),
    unit,
    unitPrice: expectMoney(record.unitPrice, 'unitPrice'),
    quantity,
    lineTotal: expectMoney(record.lineTotal, 'lineTotal'),
  };
}

function parseDelivery(payload: unknown): CommercialDelivery {
  const record = expectRecord(payload, 'entrega');
  if (record.mode !== 'PICKUP' && record.mode !== 'DELIVERY') {
    throw new Error('La API devolvió un pedido sin una entrega reconocible.');
  }
  return {
    mode: record.mode,
    recipient: expectNullableString(record.recipient, 'recipient'),
    phone: expectNullableString(record.phone, 'phone'),
    address: expectNullableString(record.address, 'address'),
    city: expectNullableString(record.city, 'city'),
    references: expectNullableString(record.references, 'references'),
  };
}

function parseEvent(payload: unknown): CommercialOrderEvent {
  const record = expectRecord(payload, 'historial');
  return {
    id: expectString(record.id, 'id'),
    fromStatus:
      record.fromStatus === null || record.fromStatus === undefined
        ? null
        : expectStatus(record.fromStatus),
    toStatus: expectStatus(record.toStatus),
    createdAt: expectString(record.createdAt, 'createdAt'),
    note: expectNullableString(record.note, 'note'),
  };
}

function expectStatus(value: unknown): CommercialOrderStatus {
  if (
    typeof value === 'string' &&
    COMMERCIAL_ORDER_STATUSES.includes(value as CommercialOrderStatus)
  ) {
    return value as CommercialOrderStatus;
  }
  throw new Error(
    'La API devolvió un estado de pedido que este panel no admite.',
  );
}

function expectPaymentMethod(value: unknown): CommercialPaymentMethod | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (value === 'CASH' || value === 'TRANSFER' || value === 'CARD') {
    return value;
  }
  throw new Error('La API devolvió un medio de pago que este panel no admite.');
}

function expectMoney(value: unknown, field: string): CommercialMoney {
  const record = expectRecord(value, field);
  if (
    typeof record.amount !== 'string' ||
    !MONEY_AMOUNT.test(record.amount) ||
    record.currency !== 'ARS'
  ) {
    throw new Error(
      'La API devolvió un importe de pedido que no se puede mostrar.',
    );
  }
  return { amount: record.amount, currency: 'ARS' };
}

function expectRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(
      `La API devolvió un ${label} con un formato no reconocido.`,
    );
  }
  return value as Record<string, unknown>;
}

function expectArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(
      `La API devolvió un pedido sin ${field} en el formato esperado.`,
    );
  }
  return value;
}

function expectString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`La API devolvió un pedido sin ${field}.`);
  }
  return value;
}

function expectNullableString(value: unknown, field: string): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new Error(`La API devolvió un pedido con ${field} inválido.`);
  }
  return value;
}

function expectNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`La API devolvió un pedido con ${field} inválido.`);
  }
  return value;
}

import type { OrderStatus } from '@/shared/types/demo';

/**
 * Canonical order status presentation for the demo UI.
 * Logistic cycle: Pendiente → Confirmado → En preparación → Preparado →
 * Despachado → Entregado. Cobro is tracked via account/payment state, not
 * as a separate OrderStatus (avoids incoherent jumps in the ops pipeline).
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'En preparación',
  READY_FOR_DISPATCH: 'Preparado',
  OUT_FOR_DELIVERY: 'Despachado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  DELIVERY_FAILED: 'Con incidencia',
};

export type OrderStatusTone =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export const ORDER_STATUS_TONES: Record<OrderStatus, OrderStatusTone> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PREPARING: 'info',
  READY_FOR_DISPATCH: 'info',
  OUT_FOR_DELIVERY: 'info',
  DELIVERED: 'success',
  CANCELLED: 'neutral',
  DELIVERY_FAILED: 'danger',
};

export const ORDER_STATUS_ORDER: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_DISPATCH',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'DELIVERY_FAILED',
  'CANCELLED',
];

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status];
}

export function orderStatusTone(status: OrderStatus): OrderStatusTone {
  return ORDER_STATUS_TONES[status];
}

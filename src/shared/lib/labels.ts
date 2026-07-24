import type {
  AccountMovementType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/shared/types/demo';

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  TRANSFER: 'Transferencia',
  CARD: 'Tarjeta',
  MERCADO_PAGO_DEMO: 'Mercado Pago demo',
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  COMPLETED: 'Completado',
  FAILED: 'Fallido',
};

export const accountMovementTypeLabels: Record<AccountMovementType, string> = {
  INVOICE: 'Factura',
  PAYMENT: 'Pago',
  CREDIT_NOTE: 'Nota de crédito',
  ADJUSTMENT: 'Ajuste',
};

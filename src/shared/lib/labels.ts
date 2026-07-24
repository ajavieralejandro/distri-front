import type {
  AccountMovementType,
  DeliveryResult,
  DemoInvoiceStatus,
  DemoRole,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PickItemStatus,
} from '@/shared/types/demo';

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  READY_FOR_DISPATCH: 'Listo para despacho',
  OUT_FOR_DELIVERY: 'En reparto',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  DELIVERY_FAILED: 'Entrega fallida',
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
  CARD: 'Tarjeta',
  MERCADO_PAGO_DEMO: 'Mercado Pago demo',
};

export const roleLabels: Record<DemoRole, string> = {
  DISTRIBUTOR_ADMIN: 'Administrador distribuidor',
  SALES: 'Ventas',
  WAREHOUSE_PICKER: 'Preparador de depósito',
  CASHIER: 'Caja',
  DRIVER: 'Repartidor',
  COMMERCE_OWNER: 'Dueño de comercio',
  COMMERCE_BUYER: 'Compras de comercio',
  COMMERCE_CASHIER: 'Cajero de comercio',
};

export const pickStatusLabels: Record<PickItemStatus, string> = {
  PENDING: 'Pendiente',
  PICKED: 'Preparado',
  MISSING: 'Faltante',
  SUBSTITUTED_DEMO: 'Sustituido (demo)',
};

export const deliveryResultLabels: Record<DeliveryResult, string> = {
  DELIVERED_OK: 'Entregado',
  CUSTOMER_ABSENT: 'Cliente ausente',
  WRONG_ADDRESS: 'Dirección incorrecta',
  REJECTED: 'Rechazado',
  PARTIAL_DEMO: 'Entrega parcial (demo)',
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  COMPLETED: 'Completado',
  FAILED: 'Fallido',
};

export const invoiceStatusLabels: Record<DemoInvoiceStatus, string> = {
  DRAFT: 'Borrador',
  ISSUED_DEMO: 'Emitida demo',
  CANCELLED_DEMO: 'Anulada demo',
};

export const accountMovementTypeLabels: Record<AccountMovementType, string> = {
  INVOICE: 'Factura',
  PAYMENT: 'Pago',
  CREDIT_NOTE: 'Nota de crédito',
  ADJUSTMENT: 'Ajuste',
};

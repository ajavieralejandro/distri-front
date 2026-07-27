import { compareMoney } from '@/shared/lib/decimal';
import type { AdminAlert } from '@/shared/types/admin-ops';
import type { DemoDatabase } from '@/shared/types/demo';

const DAY_MS = 86_400_000;

export function buildAdminAlerts(database: DemoDatabase): AdminAlert[] {
  const now = Date.now();
  const alerts: AdminAlert[] = [];

  for (const item of database.inventory) {
    const product = database.products.find(
      (candidate) => candidate.id === item.productId,
    );
    if (!product) continue;

    if (item.availableStock <= 0) {
      alerts.push({
        id: `alert-oos-${item.id}`,
        type: 'OUT_OF_STOCK',
        severity: 'critical',
        title: 'Producto sin stock',
        description: `${product.name} sin disponible en ${item.warehouseId}.`,
        createdAt: new Date(now).toISOString(),
        entityType: 'inventory',
        entityId: item.id,
        href: `/admin/inventory?lowStock=1&search=${encodeURIComponent(product.sku)}`,
        responsibleLabel: 'Inventario',
      });
    } else if (item.availableStock <= item.lowStockThreshold) {
      alerts.push({
        id: `alert-low-${item.id}`,
        type: 'LOW_STOCK',
        severity: 'warning',
        title: 'Stock por debajo del mínimo',
        description: `${product.name}: ${item.availableStock} (mín. ${item.lowStockThreshold}).`,
        createdAt: new Date(now).toISOString(),
        entityType: 'inventory',
        entityId: item.id,
        href: `/admin/inventory?lowStock=1&search=${encodeURIComponent(product.sku)}`,
        responsibleLabel: 'Inventario',
      });
    }
  }

  for (const order of database.orders) {
    if (order.status === 'DELIVERY_FAILED') {
      alerts.push({
        id: `alert-inc-${order.id}`,
        type: 'DELIVERY_INCIDENT',
        severity: 'critical',
        title: 'Entrega con incidencia',
        description: `${order.number} requiere seguimiento.`,
        createdAt: order.updatedAt,
        entityType: 'order',
        entityId: order.id,
        href: `/admin/orders/${order.id}`,
        responsibleLabel: 'Reparto',
      });
    }

    if (
      (order.status === 'OUT_FOR_DELIVERY' ||
        order.status === 'READY_FOR_DISPATCH') &&
      now - new Date(order.updatedAt).getTime() > 2 * DAY_MS
    ) {
      alerts.push({
        id: `alert-delay-${order.id}`,
        type: 'DELAYED_ORDER',
        severity: 'warning',
        title: 'Pedido demorado',
        description: `${order.number} lleva más de 2 días en estado operativo.`,
        createdAt: order.updatedAt,
        entityType: 'order',
        entityId: order.id,
        href: `/admin/orders/${order.id}`,
        responsibleLabel: 'Operaciones',
      });
    }

    if (order.priority === 'HIGH' && order.status === 'PENDING') {
      alerts.push({
        id: `alert-prio-${order.id}`,
        type: 'HIGH_PRIORITY_ORDER',
        severity: 'warning',
        title: 'Pedido de prioridad alta',
        description: `${order.number} pendiente de confirmación.`,
        createdAt: order.createdAt,
        entityType: 'order',
        entityId: order.id,
        href: `/admin/orders/${order.id}`,
        responsibleLabel: 'Ventas',
      });
    }
  }

  for (const commerce of database.commerces) {
    if (commerce.status === 'INACTIVE') {
      alerts.push({
        id: `alert-inactive-${commerce.id}`,
        type: 'INACTIVE_BRANCH',
        severity: 'info',
        title: 'Comercio inactivo',
        description: `${commerce.tradeName} está marcado como inactivo.`,
        createdAt: new Date(now).toISOString(),
        entityType: 'commerce',
        entityId: commerce.id,
        href: `/admin/customers/${commerce.id}`,
      });
    }

    if (compareMoney(commerce.balance, commerce.creditLimit) > 0) {
      alerts.push({
        id: `alert-credit-${commerce.id}`,
        type: 'CREDIT_LIMIT_EXCEEDED',
        severity: 'critical',
        title: 'Límite de crédito excedido',
        description: `${commerce.tradeName} supera el límite de crédito.`,
        createdAt: new Date(now).toISOString(),
        entityType: 'commerce',
        entityId: commerce.id,
        href: `/admin/customers/${commerce.id}`,
        responsibleLabel: 'Cobranzas',
      });
    }
  }

  for (const movement of database.accountMovements) {
    if (
      movement.status === 'OVERDUE' ||
      (movement.status === 'OPEN' &&
        movement.dueDate &&
        new Date(movement.dueDate).getTime() < now)
    ) {
      const commerce = database.commerces.find(
        (candidate) => candidate.id === movement.commerceId,
      );
      alerts.push({
        id: `alert-debt-${movement.id}`,
        type: 'OVERDUE_DEBT',
        severity: 'critical',
        title: 'Deuda vencida',
        description: `${movement.description} · ${commerce?.tradeName ?? movement.commerceId}`,
        createdAt: movement.dueDate ?? movement.createdAt,
        entityType: 'account',
        entityId: movement.id,
        href: `/admin/customers/${movement.commerceId}`,
        responsibleLabel: 'Cobranzas',
      });
    }

    if (
      movement.status === 'OPEN' &&
      movement.type === 'INVOICE' &&
      (!movement.dueDate || new Date(movement.dueDate).getTime() >= now)
    ) {
      alerts.push({
        id: `alert-pay-${movement.id}`,
        type: 'PENDING_PAYMENT',
        severity: 'info',
        title: 'Cobranza pendiente',
        description: movement.description,
        createdAt: movement.createdAt,
        entityType: 'account',
        entityId: movement.id,
        href: `/admin/payments`,
        responsibleLabel: 'Caja',
      });
    }
  }

  return alerts.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

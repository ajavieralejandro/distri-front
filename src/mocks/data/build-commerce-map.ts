import { compareMoney } from '@/shared/lib/decimal';
import {
  commerceTypeLabels,
  commerceZoneLabels,
} from '@/shared/lib/labels';
import type { CommerceMapItem } from '@/shared/types/admin-ops';
import type { Commerce, Order } from '@/shared/types/demo';

export function buildCommerceMapItems(
  commerces: Commerce[],
  orders: Order[],
  overdueCommerceIds: Set<string>,
): CommerceMapItem[] {
  return commerces.map((commerce) => {
    const pendingOrders = orders.filter(
      (order) =>
        order.commerceId === commerce.id &&
        order.status !== 'DELIVERED' &&
        order.status !== 'CANCELLED',
    ).length;
    const hasDebt = compareMoney(commerce.balance, '0.00') > 0;
    const hasOverdueDebt = overdueCommerceIds.has(commerce.id);
    const needsAttention =
      pendingOrders > 0 ||
      hasOverdueDebt ||
      commerce.tags.includes('Visitar esta semana') ||
      compareMoney(commerce.balance, commerce.creditLimit) > 0;

    return {
      id: commerce.id,
      name: commerce.tradeName,
      businessName: commerce.businessName,
      address: commerce.address,
      city: commerce.city,
      zone: commerce.zone,
      zoneLabel: commerceZoneLabels[commerce.zone],
      commerceType: commerce.commerceType,
      commerceTypeLabel: commerceTypeLabels[commerce.commerceType],
      status: commerce.status,
      statusLabel: commerce.status === 'ACTIVE' ? 'Activo' : 'Inactivo',
      phone: commerce.phone,
      tags: commerce.tags,
      latitude: commerce.latitude,
      longitude: commerce.longitude,
      lastOrderAt: commerce.lastOrderAt,
      lastOrderLabel: commerce.lastOrderAt
        ? new Date(commerce.lastOrderAt).toLocaleDateString('es-AR')
        : 'Sin pedidos recientes',
      pendingOrders,
      hasDebt,
      hasOverdueDebt,
      debt: commerce.balance,
      needsAttention,
      href: `/admin/customers/${commerce.id}`,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${commerce.latitude},${commerce.longitude}`,
    };
  });
}

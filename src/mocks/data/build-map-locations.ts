import { geoFor } from '@/mocks/data/geo-locations';
import type { MapLocation } from '@/shared/types/admin-ops';
import type { DemoDatabase } from '@/shared/types/demo';

export function buildMapLocations(database: DemoDatabase): MapLocation[] {
  const locations: MapLocation[] = [];

  for (const warehouse of database.warehouses) {
    const geo = geoFor(warehouse.id);
    if (!geo) continue;
    const stockUnits = database.inventory
      .filter((item) => item.warehouseId === warehouse.id)
      .reduce((sum, item) => sum + item.availableStock, 0);
    locations.push({
      id: `map-${warehouse.id}`,
      type: 'WAREHOUSE',
      name: warehouse.name,
      address: `Depósito ${warehouse.code}`,
      lat: geo.lat,
      lng: geo.lng,
      statusLabel: 'Activo',
      stockSummary: `${stockUnits} u. disponibles`,
      href: `/admin/inventory`,
    });
  }

  for (const commerce of database.commerces) {
    const geo = geoFor(commerce.id);
    if (!geo) continue;
    const pendingOrders = database.orders.filter(
      (order) =>
        order.commerceId === commerce.id &&
        order.status !== 'DELIVERED' &&
        order.status !== 'CANCELLED',
    ).length;
    locations.push({
      id: `map-${commerce.id}`,
      type: 'COMMERCE',
      name: commerce.tradeName,
      address: commerce.address,
      lat: geo.lat,
      lng: geo.lng,
      statusLabel: commerce.status === 'ACTIVE' ? 'Activo' : 'Inactivo',
      pendingOrders,
      debt: commerce.balance,
      href: `/admin/customers/${commerce.id}`,
    });
  }

  for (const branch of database.branches) {
    const geo = geoFor(branch.id);
    if (!geo) continue;
    const commerce = database.commerces.find(
      (candidate) => candidate.id === branch.commerceId,
    );
    locations.push({
      id: `map-${branch.id}`,
      type: 'COMMERCE_BRANCH',
      name: `${branch.name}${commerce ? ` · ${commerce.tradeName}` : ''}`,
      address: branch.address,
      lat: geo.lat,
      lng: geo.lng,
      statusLabel: 'Sucursal de comercio',
      href: commerce
        ? `/admin/customers/${commerce.id}`
        : '/admin/customers',
    });
  }

  for (const order of database.orders) {
    if (
      order.status !== 'READY_FOR_DISPATCH' &&
      order.status !== 'OUT_FOR_DELIVERY' &&
      order.status !== 'PENDING' &&
      order.status !== 'CONFIRMED'
    ) {
      continue;
    }
    const geo = geoFor(order.id) ?? geoFor(order.commerceId);
    if (!geo) continue;
    locations.push({
      id: `map-order-${order.id}`,
      type:
        order.status === 'OUT_FOR_DELIVERY'
          ? 'ORDER_IN_TRANSIT'
          : 'ORDER_PENDING_DELIVERY',
      name: order.number,
      address: order.deliveryAddress,
      lat: geo.lat + 0.004,
      lng: geo.lng + 0.004,
      statusLabel: order.status,
      lastActivityAt: order.updatedAt,
      href: `/admin/orders/${order.id}`,
    });
  }

  return locations;
}

export type AdminAlertSeverity = 'info' | 'warning' | 'critical';

export type AdminAlertType =
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'DELAYED_ORDER'
  | 'DELIVERY_INCIDENT'
  | 'OVERDUE_DEBT'
  | 'CREDIT_LIMIT_EXCEEDED'
  | 'PENDING_PAYMENT'
  | 'INACTIVE_BRANCH'
  | 'HIGH_PRIORITY_ORDER';

export type AdminAlert = {
  id: string;
  type: AdminAlertType;
  severity: AdminAlertSeverity;
  title: string;
  description: string;
  createdAt: string;
  entityType: 'order' | 'product' | 'commerce' | 'inventory' | 'account';
  entityId: string;
  href: string;
  responsibleLabel?: string;
};

export type CommerceMapItem = {
  id: string;
  name: string;
  businessName: string;
  address: string;
  city: string;
  zone: string;
  zoneLabel: string;
  commerceType: string;
  commerceTypeLabel: string;
  status: 'ACTIVE' | 'INACTIVE';
  statusLabel: string;
  phone: string;
  tags: string[];
  latitude: number;
  longitude: number;
  lastOrderAt?: string;
  lastOrderLabel: string;
  pendingOrders: number;
  hasDebt: boolean;
  hasOverdueDebt: boolean;
  debt: string;
  needsAttention: boolean;
  href: string;
  directionsUrl: string;
};

/** Legacy operational markers (warehouses/orders). Kept for compatibility. */
export type MapLocationType =
  | 'WAREHOUSE'
  | 'DISTRIBUTOR_BRANCH'
  | 'COMMERCE'
  | 'COMMERCE_BRANCH'
  | 'ORDER_PENDING_DELIVERY'
  | 'ORDER_IN_TRANSIT';

export type MapLocation = {
  id: string;
  type: MapLocationType;
  name: string;
  address: string;
  lat: number;
  lng: number;
  statusLabel?: string;
  pendingOrders?: number;
  debt?: string;
  stockSummary?: string;
  lastActivityAt?: string;
  href: string;
};

import type {
  AccountMovement,
  Commerce,
  DemoDatabase,
  InventoryItem,
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusEvent,
  PickItemStatus,
  Product,
} from '@/shared/types/demo';
import {
  DEMO_INVOICE_DISCLAIMER,
  DEMO_RECEIPT_DISCLAIMER,
} from '@/shared/types/demo';

const now = new Date('2026-07-20T12:00:00.000Z');

function iso(daysAgo: number): string {
  return new Date(now.getTime() - daysAgo * 86_400_000).toISOString();
}

type ProductRow = [
  string,
  string,
  string,
  string,
  string,
  Product['unit'],
  string,
  string,
  number,
];

const productRows: ProductRow[] = [
  [
    'prod-1',
    'BEB-001',
    'Agua mineral',
    'Agua mineral sin gas 1.5 L',
    'cat-1',
    'UNIT',
    'Botella 1.5 L',
    '1250.00',
    142,
  ],
  [
    'prod-2',
    'BEB-002',
    'Gaseosa cola',
    'Gaseosa cola retornable 2.25 L',
    'cat-1',
    'UNIT',
    'Botella 2.25 L',
    '1800.00',
    84,
  ],
  [
    'prod-3',
    'BEB-003',
    'Jugo de naranja',
    'Jugo de naranja 1 L',
    'cat-1',
    'PACK',
    'Pack x 6',
    '4200.00',
    36,
  ],
  [
    'prod-4',
    'ALM-001',
    'Arroz',
    'Arroz largo fino 1 kg',
    'cat-2',
    'PACK',
    'Pack x 10',
    '8500.00',
    61,
  ],
  [
    'prod-5',
    'ALM-002',
    'Fideos',
    'Fideos secos tirabuzón 500 g',
    'cat-2',
    'PACK',
    'Pack x 20',
    '11200.00',
    48,
  ],
  [
    'prod-6',
    'ALM-003',
    'Harina',
    'Harina de trigo 000 1 kg',
    'cat-2',
    'PACK',
    'Pack x 10',
    '6900.00',
    18,
  ],
  [
    'prod-7',
    'ALM-004',
    'Aceite',
    'Aceite de girasol 900 ml',
    'cat-2',
    'BOX',
    'Caja x 12',
    '21600.00',
    29,
  ],
  [
    'prod-8',
    'LIM-001',
    'Detergente',
    'Detergente líquido 750 ml',
    'cat-3',
    'PACK',
    'Pack x 12',
    '9800.00',
    43,
  ],
  [
    'prod-9',
    'LIM-002',
    'Lavandina',
    'Lavandina concentrada 1 L',
    'cat-3',
    'BOX',
    'Caja x 12',
    '7800.00',
    15,
  ],
  [
    'prod-10',
    'HOG-001',
    'Papel higiénico',
    'Papel higiénico doble hoja',
    'cat-4',
    'PACK',
    'Pack x 4',
    '3500.00',
    72,
  ],
  [
    'prod-11',
    'ALM-005',
    'Yerba',
    'Yerba mate tradicional 1 kg',
    'cat-2',
    'PACK',
    'Pack x 6',
    '15800.00',
    22,
  ],
  [
    'prod-12',
    'ALM-006',
    'Azúcar',
    'Azúcar blanca 1 kg',
    'cat-2',
    'PACK',
    'Pack x 10',
    '7400.00',
    0,
  ],
  [
    'prod-13',
    'BEB-004',
    'Cerveza sin alcohol',
    'Cerveza 0.0% 473 ml',
    'cat-1',
    'PACK',
    'Pack x 24',
    '18600.00',
    40,
  ],
  [
    'prod-14',
    'ALM-007',
    'Café molido',
    'Café molido torrado 500 g',
    'cat-2',
    'PACK',
    'Pack x 8',
    '22400.00',
    26,
  ],
  [
    'prod-15',
    'ALM-008',
    'Galletitas dulces',
    'Galletitas surtidas 350 g',
    'cat-2',
    'BOX',
    'Caja x 12',
    '14200.00',
    33,
  ],
  [
    'prod-16',
    'ALM-009',
    'Snacks salados',
    'Papas fritas clásicas 150 g',
    'cat-2',
    'BOX',
    'Caja x 20',
    '16800.00',
    55,
  ],
];

const productMeta: Record<
  string,
  {
    brand: string;
    wholesalePrice: string;
    featured?: boolean;
    offer?: boolean;
    isNew?: boolean;
  }
> = {
  'prod-1': { brand: 'Aquavita', wholesalePrice: '1120.00' },
  'prod-2': {
    brand: 'ColaSur',
    wholesalePrice: '1650.00',
    offer: true,
    featured: true,
  },
  'prod-3': { brand: 'Citric', wholesalePrice: '3900.00', isNew: true },
  'prod-4': { brand: 'CampoFino', wholesalePrice: '7900.00' },
  'prod-5': { brand: 'CampoFino', wholesalePrice: '10400.00' },
  'prod-6': { brand: 'Molino Sur', wholesalePrice: '6400.00', offer: true },
  'prod-7': {
    brand: 'Girasol Plus',
    wholesalePrice: '20100.00',
    featured: true,
  },
  'prod-8': { brand: 'LimpiaYa', wholesalePrice: '9100.00' },
  'prod-9': { brand: 'LimpiaYa', wholesalePrice: '7200.00' },
  'prod-10': { brand: 'SoftCare', wholesalePrice: '3200.00', isNew: true },
  'prod-11': { brand: 'MateReal', wholesalePrice: '14600.00', featured: true },
  'prod-12': { brand: 'DulceCampo', wholesalePrice: '6900.00' },
  'prod-13': {
    brand: 'CeroBeer',
    wholesalePrice: '17200.00',
    isNew: true,
    offer: true,
  },
  'prod-14': {
    brand: 'Aroma Norte',
    wholesalePrice: '20800.00',
    featured: true,
  },
  'prod-15': { brand: 'Horno Dulce', wholesalePrice: '13100.00', offer: true },
  'prod-16': { brand: 'CrunchMax', wholesalePrice: '15500.00' },
};

const products: Product[] = productRows.map(
  (
    [
      id,
      sku,
      name,
      description,
      categoryId,
      unit,
      presentation,
      price,
      availableStock,
    ],
    index,
  ) => {
    const meta = productMeta[id]!;
    return {
      id,
      sku,
      name,
      description,
      categoryId,
      brand: meta.brand,
      unit,
      presentation,
      price,
      wholesalePrice: meta.wholesalePrice,
      availableStock,
      imageUrl: `products/${id}.svg`,
      active: index !== 11,
      featured: meta.featured,
      offer: meta.offer,
      isNew: meta.isNew,
    };
  },
);

const commerces: Commerce[] = [
  {
    id: 'com-1',
    businessName: 'Almacén El Puente S.R.L.',
    tradeName: 'Almacén El Puente',
    taxId: '20-00000001-9',
    status: 'ACTIVE',
    paymentTerms: 'Cuenta corriente 15 días',
    creditLimit: '500000.00',
    balance: '182450.00',
    email: 'compras@elpuente.demo',
    phone: '+54 11 4000-1001',
    address: 'Av. Rivadavia 1200, CABA',
    city: 'CABA',
    zone: 'CENTRO',
    commerceType: 'ALMACEN',
    tags: [
      'Cliente frecuente',
      'Pedido pendiente',
      'Almacén',
      'Zona centro',
      'Visitar esta semana',
    ],
    latitude: -34.6158,
    longitude: -58.4333,
    lastOrderAt: '2026-07-20T12:00:00.000Z',
  },
  {
    id: 'com-2',
    businessName: 'Mercado Norte S.A.',
    tradeName: 'Mercado Norte',
    taxId: '20-00000002-7',
    status: 'ACTIVE',
    paymentTerms: 'Cuenta corriente 30 días',
    creditLimit: '850000.00',
    balance: '346700.00',
    email: 'pedidos@mercadonorte.demo',
    phone: '+54 11 4000-1002',
    address: 'Av. San Martín 850, CABA',
    city: 'CABA',
    zone: 'NORTE',
    commerceType: 'MAYORISTA',
    tags: [
      'Cliente frecuente',
      'Deuda vencida',
      'Mayorista',
      'Zona norte',
      'Pedido pendiente',
    ],
    latitude: -34.5765,
    longitude: -58.505,
    lastOrderAt: '2026-07-20T12:00:00.000Z',
  },
  {
    id: 'com-3',
    businessName: 'Autoservicio La Esquina S.H.',
    tradeName: 'La Esquina',
    taxId: '20-00000003-5',
    status: 'ACTIVE',
    paymentTerms: 'Pago contra entrega',
    creditLimit: '50000.00',
    balance: '78400.00',
    email: 'admin@laesquina.demo',
    phone: '+54 11 4000-1003',
    address: 'Nazca 2300, CABA',
    city: 'CABA',
    zone: 'OESTE',
    commerceType: 'AUTOSERVICIO',
    tags: ['Autoservicio', 'Zona oeste', 'Deuda vencida'],
    latitude: -34.615,
    longitude: -58.485,
    lastOrderAt: '2026-07-18T12:00:00.000Z',
  },
  {
    id: 'com-4',
    businessName: 'Kiosco Central S.A.S.',
    tradeName: 'Kiosco Central',
    taxId: '20-00000004-3',
    status: 'INACTIVE',
    paymentTerms: 'Cuenta corriente 7 días',
    creditLimit: '150000.00',
    balance: '0.00',
    email: 'contacto@kioscocentral.demo',
    phone: '+54 11 4000-1004',
    address: 'Florida 420, CABA',
    city: 'CABA',
    zone: 'CENTRO',
    commerceType: 'KIOSCO',
    tags: ['Kiosco', 'Zona centro'],
    latitude: -34.6039,
    longitude: -58.3772,
  },
];

const inventory: InventoryItem[] = products.flatMap((product, index) => {
  const reservedPrimary = (index % 3) * 4;
  const availablePrimary = product.availableStock;
  const physicalPrimary = availablePrimary + reservedPrimary;
  const availableSecondary = 10 + (index % 5);
  return [
    {
      id: `inv-wh1-${index + 1}`,
      productId: product.id,
      warehouseId: 'wh-1',
      physicalStock: physicalPrimary,
      reservedStock: reservedPrimary,
      availableStock: availablePrimary,
      lowStockThreshold: 15,
    },
    {
      id: `inv-wh2-${index + 1}`,
      productId: product.id,
      warehouseId: 'wh-2',
      physicalStock: availableSecondary,
      reservedStock: 0,
      availableStock: availableSecondary,
      lowStockThreshold: 5,
    },
  ];
});

function order(
  id: string,
  number: string,
  commerceId: string,
  status: Order['status'],
  daysAgo: number,
  productIndexes: number[],
  options: Pick<
    Order,
    'warehouseId' | 'routeId' | 'stopSequence' | 'priority'
  > = {
    warehouseId: 'wh-1',
    priority: 'NORMAL',
  },
): Order {
  const commerce = commerces.find((candidate) => candidate.id === commerceId)!;
  const items: OrderItem[] = productIndexes.map((productIndex, itemIndex) => {
    const product = products[productIndex]!;
    const quantity = itemIndex + 1;
    const unitPrice = product.price;
    const lineTotal = (Number(unitPrice) * quantity).toFixed(2);
    const isPrepared =
      status === 'PREPARING' ||
      status === 'READY_FOR_DISPATCH' ||
      status === 'OUT_FOR_DELIVERY' ||
      status === 'DELIVERED';
    const pickStatus: PickItemStatus = isPrepared ? 'PICKED' : 'PENDING';
    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      unitPrice,
      quantity,
      lineTotal,
      preparedQuantity: isPrepared ? quantity : 0,
      pickStatus,
      missingQuantity: 0,
    };
  });
  const total = items
    .reduce((sum, item) => sum + Number(item.lineTotal), 0)
    .toFixed(2);
  const createdAt = iso(daysAgo);
  const history: OrderStatusEvent[] = [
    {
      id: `${id}-event-1`,
      orderId: id,
      toStatus: 'PENDING',
      userId: 'usr-sales',
      userDisplayName: 'Ventas Demo',
      createdAt,
      note: 'Pedido creado',
    },
  ];
  if (status !== 'PENDING') {
    const fromStatus: OrderStatus = 'PENDING';
    history.push({
      id: `${id}-event-2`,
      orderId: id,
      fromStatus,
      toStatus: status,
      userId: status === 'DELIVERED' ? 'usr-driver' : 'usr-admin',
      userDisplayName:
        status === 'DELIVERED' ? 'Reparto Demo' : 'Administrador Demo',
      createdAt: iso(Math.max(daysAgo - 1, 0)),
      note: `Pedido ${status.toLowerCase()}`,
    });
  }
  return {
    id,
    number,
    commerceId,
    branchId:
      commerceId === 'com-1'
        ? 'branch-1'
        : commerceId === 'com-2'
          ? 'branch-2'
          : undefined,
    warehouseId: options.warehouseId,
    routeId: options.routeId,
    status,
    priority: options.priority,
    createdAt,
    updatedAt: createdAt,
    items,
    subtotal: total,
    total,
    history,
    deliveryAddress: commerce.address,
    deliveryContactName: commerce.tradeName,
    deliveryContactPhone: commerce.phone,
    deliveryWindow: '09:00 - 17:00',
    stopSequence: options.stopSequence,
  };
}

const orders: Order[] = [
  order('ord-1', 'PED-1001', 'com-1', 'DELIVERED', 14, [0, 3, 9], {
    warehouseId: 'wh-1',
    routeId: 'route-1',
    stopSequence: 1,
    priority: 'NORMAL',
  }),
  order('ord-2', 'PED-1002', 'com-2', 'DELIVERED', 12, [1, 4, 7], {
    warehouseId: 'wh-2',
    routeId: 'route-2',
    stopSequence: 1,
    priority: 'HIGH',
  }),
  order('ord-3', 'PED-1003', 'com-3', 'DELIVERY_FAILED', 10, [5, 8], {
    warehouseId: 'wh-1',
    priority: 'NORMAL',
  }),
  order('ord-4', 'PED-1004', 'com-1', 'OUT_FOR_DELIVERY', 7, [2, 6, 10], {
    warehouseId: 'wh-1',
    routeId: 'route-1',
    stopSequence: 2,
    priority: 'HIGH',
  }),
  order('ord-5', 'PED-1005', 'com-2', 'READY_FOR_DISPATCH', 4, [0, 4, 8], {
    warehouseId: 'wh-1',
    priority: 'NORMAL',
  }),
  order('ord-6', 'PED-1006', 'com-3', 'PREPARING', 2, [3, 5, 9], {
    warehouseId: 'wh-1',
    priority: 'NORMAL',
  }),
  order('ord-7', 'PED-1007', 'com-1', 'CONFIRMED', 1, [1, 7], {
    warehouseId: 'wh-2',
    priority: 'NORMAL',
  }),
  order('ord-8', 'PED-1008', 'com-2', 'PENDING', 0, [6, 10], {
    warehouseId: 'wh-1',
    priority: 'HIGH',
  }),
  order('ord-9', 'PED-1009', 'com-3', 'DELIVERED', 3, [0, 2], {
    warehouseId: 'wh-1',
    routeId: 'route-1',
    stopSequence: 3,
    priority: 'NORMAL',
  }),
];

const accountMovements: AccountMovement[] = [
  {
    id: 'acc-1',
    commerceId: 'com-1',
    type: 'INVOICE',
    description: 'Factura PED-1001',
    amount: '58000.00',
    balanceAfter: '224450.00',
    dueDate: iso(-1),
    createdAt: iso(14),
    reference: 'PED-1001',
    status: 'PAID',
  },
  {
    id: 'acc-2',
    commerceId: 'com-1',
    type: 'PAYMENT',
    description: 'Pago recibido',
    amount: '42000.00',
    balanceAfter: '182450.00',
    createdAt: iso(8),
    reference: 'PAG-1',
    status: 'PAID',
  },
  {
    id: 'acc-3',
    commerceId: 'com-2',
    type: 'INVOICE',
    description: 'Factura PED-1002',
    amount: '74000.00',
    balanceAfter: '406700.00',
    dueDate: iso(18),
    createdAt: iso(12),
    reference: 'PED-1002',
    status: 'OVERDUE',
  },
  {
    id: 'acc-4',
    commerceId: 'com-2',
    type: 'PAYMENT',
    description: 'Pago recibido',
    amount: '60000.00',
    balanceAfter: '346700.00',
    createdAt: iso(5),
    reference: 'PAG-2',
    status: 'PAID',
  },
  {
    id: 'acc-5',
    commerceId: 'com-3',
    type: 'INVOICE',
    description: 'Factura PED-1006',
    amount: '37200.00',
    balanceAfter: '78400.00',
    dueDate: iso(13),
    createdAt: iso(2),
    reference: 'PED-1006',
    status: 'OPEN',
  },
  {
    id: 'acc-6',
    commerceId: 'com-1',
    type: 'ADJUSTMENT',
    description: 'Ajuste comercial',
    amount: '2500.00',
    balanceAfter: '184950.00',
    createdAt: iso(4),
    reference: 'AJU-1',
    status: 'OPEN',
  },
  {
    id: 'acc-7',
    commerceId: 'com-2',
    type: 'CREDIT_NOTE',
    description: 'Nota de crédito',
    amount: '5000.00',
    balanceAfter: '341700.00',
    createdAt: iso(3),
    reference: 'NC-1',
    status: 'PAID',
  },
  {
    id: 'acc-8',
    commerceId: 'com-3',
    type: 'PAYMENT',
    description: 'Pago recibido',
    amount: '12000.00',
    balanceAfter: '78400.00',
    createdAt: iso(1),
    reference: 'PAG-3',
    status: 'PAID',
  },
  {
    id: 'acc-9',
    commerceId: 'com-1',
    type: 'INVOICE',
    description: 'Factura PED-1007',
    amount: '22000.00',
    balanceAfter: '206950.00',
    dueDate: iso(14),
    createdAt: iso(1),
    reference: 'PED-1007',
    status: 'OPEN',
  },
  {
    id: 'acc-10',
    commerceId: 'com-2',
    type: 'INVOICE',
    description: 'Factura PED-1008',
    amount: '37400.00',
    balanceAfter: '379100.00',
    dueDate: iso(15),
    createdAt: iso(0),
    reference: 'PED-1008',
    status: 'OPEN',
  },
];

export function createInitialDatabase(): DemoDatabase {
  const seededProducts = structuredClone(products).map((product) => ({
    ...product,
    availableStock: inventory
      .filter((item) => item.productId === product.id)
      .reduce((sum, item) => sum + item.availableStock, 0),
  }));

  return {
    version: 3,
    distributorId: 'dist-1',
    categories: [
      { id: 'cat-1', name: 'Bebidas' },
      { id: 'cat-2', name: 'Almacén' },
      { id: 'cat-3', name: 'Limpieza' },
      { id: 'cat-4', name: 'Hogar' },
    ],
    products: seededProducts,
    commerces: structuredClone(commerces),
    branches: [
      {
        id: 'branch-1',
        commerceId: 'com-1',
        name: 'Sucursal Centro',
        address: 'Av. Rivadavia 1200, CABA',
      },
      {
        id: 'branch-2',
        commerceId: 'com-2',
        name: 'Sucursal Norte',
        address: 'Av. San Martín 850, CABA',
      },
    ],
    warehouses: [
      { id: 'wh-1', name: 'Depósito Central', code: 'CENTRAL' },
      { id: 'wh-2', name: 'Depósito Norte', code: 'NORTE' },
    ],
    inventory: structuredClone(inventory),
    inventoryMovements: [],
    orders: structuredClone(orders),
    accountMovements: structuredClone(accountMovements),
    payments: [
      {
        id: 'pay-1',
        commerceId: 'com-1',
        amount: '42000.00',
        method: 'TRANSFER',
        status: 'COMPLETED',
        createdAt: iso(8),
        reference: 'TRF-DEMO-001',
        simulated: true,
      },
      {
        id: 'pay-2',
        commerceId: 'com-2',
        amount: '60000.00',
        method: 'CARD',
        status: 'COMPLETED',
        createdAt: iso(5),
        reference: 'CARD-DEMO-002',
        simulated: true,
      },
      {
        id: 'pay-3',
        commerceId: 'com-3',
        amount: '12000.00',
        method: 'MERCADO_PAGO_DEMO',
        status: 'COMPLETED',
        createdAt: iso(1),
        reference: 'MP-DEMO-003',
        simulated: true,
      },
      {
        id: 'pay-4',
        commerceId: 'com-1',
        amount: '15000.00',
        method: 'CARD',
        status: 'COMPLETED',
        createdAt: iso(18),
        reference: 'CARD-DEMO-004',
        simulated: true,
      },
      {
        id: 'pay-5',
        commerceId: 'com-2',
        amount: '28500.00',
        method: 'TRANSFER',
        status: 'COMPLETED',
        createdAt: iso(20),
        reference: 'TRF-DEMO-005',
        simulated: true,
      },
    ],
    invoices: [
      {
        id: 'inv-1',
        number: 'DEMO-FC-000001',
        commerceId: 'com-1',
        orderId: 'ord-1',
        issuedAt: iso(14),
        dueAt: iso(-1),
        status: 'ISSUED_DEMO',
        subtotal: orders[0]!.subtotal,
        tax: '0.00',
        total: orders[0]!.total,
        items: structuredClone(orders[0]!.items),
        disclaimer: DEMO_INVOICE_DISCLAIMER,
      },
      {
        id: 'inv-2',
        number: 'DEMO-FC-000002',
        commerceId: 'com-2',
        orderId: 'ord-2',
        status: 'DRAFT',
        subtotal: orders[1]!.subtotal,
        tax: '0.00',
        total: orders[1]!.total,
        items: structuredClone(orders[1]!.items),
        disclaimer: DEMO_INVOICE_DISCLAIMER,
      },
    ],
    receipts: [
      {
        id: 'rcp-1',
        number: 'DEMO-RC-000001',
        commerceId: 'com-1',
        paymentId: 'pay-1',
        issuedAt: iso(8),
        amount: '42000.00',
        paymentMethod: 'TRANSFER',
        allocations: [
          {
            invoiceId: 'inv-1',
            description: 'Aplicación a factura demo',
            amount: '42000.00',
          },
        ],
        disclaimer: DEMO_RECEIPT_DISCLAIMER,
      },
      {
        id: 'rcp-2',
        number: 'DEMO-RC-000002',
        commerceId: 'com-2',
        paymentId: 'pay-2',
        issuedAt: iso(5),
        amount: '60000.00',
        paymentMethod: 'CARD',
        allocations: [
          {
            invoiceId: 'inv-2',
            description: 'Aplicación a factura demo',
            amount: '60000.00',
          },
        ],
        disclaimer: DEMO_RECEIPT_DISCLAIMER,
      },
    ],
    vehicles: [
      { id: 'veh-1', label: 'Camión reparto 1', plate: 'AA 123 BB' },
      { id: 'veh-2', label: 'Utilitario norte', plate: 'AB 456 CD' },
    ],
    routes: [
      {
        id: 'route-1',
        name: 'Ruta Centro',
        driverUserId: 'usr-driver',
        vehicleId: 'veh-1',
        status: 'PLANNED',
      },
      {
        id: 'route-2',
        name: 'Ruta Norte',
        driverUserId: 'usr-driver-b',
        vehicleId: 'veh-2',
        status: 'PLANNED',
      },
    ],
    auditEvents: [
      {
        id: 'audit-1',
        userId: 'usr-admin',
        userDisplayName: 'Administrador Demo',
        action: 'ORDER_DELIVERED',
        entityType: 'order',
        entityId: 'ord-1',
        createdAt: iso(14),
        summary: 'Pedido PED-1001 entregado.',
      },
      {
        id: 'audit-2',
        userId: 'usr-cashier',
        userDisplayName: 'Caja Demo',
        action: 'PAYMENT_RECORDED',
        entityType: 'payment',
        entityId: 'pay-1',
        createdAt: iso(8),
        summary: 'Pago demo registrado.',
      },
    ],
    users: [
      {
        id: 'usr-admin',
        email: 'admin@demo.distrisoft.local',
        password: 'demo1234',
        displayName: 'Administrador Demo',
        role: 'DISTRIBUTOR_ADMIN',
        distributorId: 'dist-1',
      },
      {
        id: 'usr-sales',
        email: 'ventas@demo.distrisoft.local',
        password: 'demo1234',
        displayName: 'Ventas Demo',
        role: 'SALES',
        distributorId: 'dist-1',
      },
      {
        id: 'usr-picker',
        email: 'deposito@demo.distrisoft.local',
        password: 'demo1234',
        displayName: 'Depósito Demo',
        role: 'WAREHOUSE_PICKER',
        distributorId: 'dist-1',
        warehouseId: 'wh-1',
      },
      {
        id: 'usr-cashier',
        email: 'caja@demo.distrisoft.local',
        password: 'demo1234',
        displayName: 'Caja Demo',
        role: 'CASHIER',
        distributorId: 'dist-1',
      },
      {
        id: 'usr-driver',
        email: 'reparto@demo.distrisoft.local',
        password: 'demo1234',
        displayName: 'Reparto Demo',
        role: 'DRIVER',
        distributorId: 'dist-1',
        assignedRouteId: 'route-1',
      },
      {
        id: 'usr-owner',
        email: 'comercio@demo.distrisoft.local',
        password: 'demo1234',
        displayName: 'Dueño Comercio Demo',
        role: 'COMMERCE_OWNER',
        commerceId: 'com-1',
      },
      {
        id: 'usr-buyer',
        email: 'compras@demo.distrisoft.local',
        password: 'demo1234',
        displayName: 'Compras Comercio Demo',
        role: 'COMMERCE_BUYER',
        commerceId: 'com-1',
      },
      {
        id: 'usr-com-cashier',
        email: 'cajero.comercio@demo.distrisoft.local',
        password: 'demo1234',
        displayName: 'Cajero Comercio Demo',
        role: 'COMMERCE_CASHIER',
        commerceId: 'com-1',
        branchId: 'branch-1',
      },
    ],
    orderSequence: 1010,
    invoiceSequence: 3,
    receiptSequence: 3,
    featureFlags: {
      analytics: true,
      billing: true,
      cashier: true,
      warehouseOperations: true,
      deliveryOperations: true,
    },
  };
}

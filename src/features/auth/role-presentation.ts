import type { DemoRole } from '@/shared/types/demo';

import { getHomePath } from '@/features/auth/permissions';

export type DemoRoleCategory = 'DISTRIBUTOR' | 'OPERATIONS' | 'COMMERCE';

export type DemoRolePresentation = {
  role: DemoRole;
  category: DemoRoleCategory;
  label: string;
  shortDescription: string;
  capabilities: string[];
  restrictions: string[];
  destination: string;
  area: string;
};

export const DEMO_ROLE_CATEGORIES: Array<{
  id: DemoRoleCategory;
  label: string;
}> = [
  { id: 'DISTRIBUTOR', label: 'Distribuidora' },
  { id: 'OPERATIONS', label: 'Operaciones' },
  { id: 'COMMERCE', label: 'Comercio' },
];

export const DEMO_SHARED_PASSWORD = 'demo1234';

/** Presentation metadata only — not the permission matrix. */
export const DEMO_ROLE_PRESENTATIONS: DemoRolePresentation[] = [
  {
    role: 'DISTRIBUTOR_ADMIN',
    category: 'DISTRIBUTOR',
    label: 'Administrador',
    area: 'Distribuidora',
    shortDescription:
      'Panel general, comercios, mapa, pedidos, inventario y cobranzas demo.',
    capabilities: [
      'Panel ejecutivo y reportes',
      'Comercios, mapa y pedidos',
      'Inventario y cobranzas demo',
    ],
    restrictions: [
      'Experiencia demostrativa',
      'Los comprobantes no tienen validez fiscal',
    ],
    destination: getHomePath('DISTRIBUTOR_ADMIN'),
  },
  {
    role: 'SALES',
    category: 'DISTRIBUTOR',
    label: 'Vendedor',
    area: 'Ventas',
    shortDescription: 'Clientes, productos, pedidos y confirmaciones.',
    capabilities: [
      'Consultar clientes y productos',
      'Crear y confirmar pedidos',
      'Ver estadísticas comerciales',
    ],
    restrictions: [
      'No ajusta inventario',
      'No registra pagos ni emite facturas',
    ],
    destination: getHomePath('SALES'),
  },
  {
    role: 'WAREHOUSE_PICKER',
    category: 'OPERATIONS',
    label: 'Preparador',
    area: 'Depósito',
    shortDescription: 'Preparación de pedidos asignados a su depósito.',
    capabilities: [
      'Consultar pedidos de su depósito',
      'Preparar productos e informar faltantes',
      'Marcar pedidos listos para despacho',
    ],
    restrictions: [
      'No consulta cuentas corrientes',
      'No registra pagos',
      'No ajusta inventario manualmente',
    ],
    destination: getHomePath('WAREHOUSE_PICKER'),
  },
  {
    role: 'CASHIER',
    category: 'OPERATIONS',
    label: 'Cajero',
    area: 'Caja',
    shortDescription: 'Cobranzas, pagos y recibos demostrativos.',
    capabilities: [
      'Buscar comercios y consultar saldos',
      'Registrar cobros demostrativos',
      'Emitir recibos demo',
    ],
    restrictions: [
      'No modifica productos ni stock',
      'No prepara pedidos',
      'No administra usuarios',
    ],
    destination: getHomePath('CASHIER'),
  },
  {
    role: 'DRIVER',
    category: 'OPERATIONS',
    label: 'Repartidor',
    area: 'Reparto',
    shortDescription: 'Recorrido y confirmación de entregas.',
    capabilities: [
      'Ver entregas de su recorrido',
      'Registrar resultado de entrega',
      'Confirmar recepción demo',
    ],
    restrictions: [
      'No ve precios internos ni cuentas',
      'No consulta pedidos ajenos a su ruta',
    ],
    destination: getHomePath('DRIVER'),
  },
  {
    role: 'COMMERCE_OWNER',
    category: 'COMMERCE',
    label: 'Comercio',
    area: 'Portal comercio',
    shortDescription: 'Catálogo mayorista, pedidos y cuenta comercial.',
    capabilities: [
      'Catálogo y carrito',
      'Pedidos del comercio',
      'Cuenta corriente demo',
    ],
    restrictions: [
      'No ve datos de otros comercios',
      'No gestiona inventario de la distribuidora',
    ],
    destination: getHomePath('COMMERCE_OWNER'),
  },
  {
    role: 'COMMERCE_BUYER',
    category: 'COMMERCE',
    label: 'Comprador',
    area: 'Portal comercio',
    shortDescription: 'Catálogo, carrito y pedidos.',
    capabilities: [
      'Consultar catálogo',
      'Crear y repetir pedidos',
      'Ver pedidos del comercio',
    ],
    restrictions: [
      'No simula pagos',
      'No consulta el detalle completo de cuenta corriente',
    ],
    destination: getHomePath('COMMERCE_BUYER'),
  },
  {
    role: 'COMMERCE_CASHIER',
    category: 'COMMERCE',
    label: 'Cajero de comercio',
    area: 'Portal comercio',
    shortDescription: 'Pedidos de su sucursal sin información financiera.',
    capabilities: [
      'Consultar catálogo',
      'Crear pedidos de su sucursal',
      'Ver pedidos creados desde su sucursal',
    ],
    restrictions: [
      'No consulta deuda ni crédito',
      'No consulta pagos',
      'No administra usuarios',
    ],
    destination: getHomePath('COMMERCE_CASHIER'),
  },
];

export type DemoAccountCredentials = {
  role: DemoRole;
  email: string;
  password: string;
};

export const DEMO_ACCOUNT_CREDENTIALS: DemoAccountCredentials[] = [
  {
    role: 'DISTRIBUTOR_ADMIN',
    email: 'admin@demo.distrisoft.local',
    password: DEMO_SHARED_PASSWORD,
  },
  {
    role: 'SALES',
    email: 'ventas@demo.distrisoft.local',
    password: DEMO_SHARED_PASSWORD,
  },
  {
    role: 'WAREHOUSE_PICKER',
    email: 'deposito@demo.distrisoft.local',
    password: DEMO_SHARED_PASSWORD,
  },
  {
    role: 'CASHIER',
    email: 'caja@demo.distrisoft.local',
    password: DEMO_SHARED_PASSWORD,
  },
  {
    role: 'DRIVER',
    email: 'reparto@demo.distrisoft.local',
    password: DEMO_SHARED_PASSWORD,
  },
  {
    role: 'COMMERCE_OWNER',
    email: 'comercio@demo.distrisoft.local',
    password: DEMO_SHARED_PASSWORD,
  },
  {
    role: 'COMMERCE_BUYER',
    email: 'compras@demo.distrisoft.local',
    password: DEMO_SHARED_PASSWORD,
  },
  {
    role: 'COMMERCE_CASHIER',
    email: 'cajero.comercio@demo.distrisoft.local',
    password: DEMO_SHARED_PASSWORD,
  },
];

export function getRolePresentation(
  role: DemoRole,
): DemoRolePresentation | undefined {
  return DEMO_ROLE_PRESENTATIONS.find((item) => item.role === role);
}

export function getRolesByCategory(
  category: DemoRoleCategory,
): DemoRolePresentation[] {
  return DEMO_ROLE_PRESENTATIONS.filter((item) => item.category === category);
}

export function getCredentialsForRole(
  role: DemoRole,
): DemoAccountCredentials | undefined {
  return DEMO_ACCOUNT_CREDENTIALS.find((item) => item.role === role);
}

import { z } from 'zod';

import type { DemoRole } from '@/shared/types/demo';

export const loginSchema = z.object({
  email: z.email('Ingresá un correo válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export type DemoAccountGroup = {
  group: string;
  accounts: Array<{
    label: string;
    email: string;
    password: string;
    role: DemoRole;
    description: string;
  }>;
};

export const DEMO_ACCOUNT_GROUPS: DemoAccountGroup[] = [
  {
    group: 'Distribuidora',
    accounts: [
      {
        label: 'Administrador',
        email: 'admin@demo.distrisoft.local',
        password: 'demo1234',
        role: 'DISTRIBUTOR_ADMIN',
        description: 'Panel global, inventario, facturación demo y auditoría.',
      },
      {
        label: 'Vendedor',
        email: 'ventas@demo.distrisoft.local',
        password: 'demo1234',
        role: 'SALES',
        description: 'Clientes, pedidos y confirmaciones. Sin stock ni caja.',
      },
      {
        label: 'Preparador',
        email: 'deposito@demo.distrisoft.local',
        password: 'demo1234',
        role: 'WAREHOUSE_PICKER',
        description: 'Prepara pedidos de su depósito.',
      },
      {
        label: 'Cajero',
        email: 'caja@demo.distrisoft.local',
        password: 'demo1234',
        role: 'CASHIER',
        description: 'Cobranzas y recibos demo.',
      },
      {
        label: 'Repartidor',
        email: 'reparto@demo.distrisoft.local',
        password: 'demo1234',
        role: 'DRIVER',
        description: 'Recorrido y confirmación de entregas.',
      },
    ],
  },
  {
    group: 'Comercio',
    accounts: [
      {
        label: 'Dueño',
        email: 'comercio@demo.distrisoft.local',
        password: 'demo1234',
        role: 'COMMERCE_OWNER',
        description: 'Catálogo, cuenta, pagos y estadísticas propias.',
      },
      {
        label: 'Comprador',
        email: 'compras@demo.distrisoft.local',
        password: 'demo1234',
        role: 'COMMERCE_BUYER',
        description: 'Catálogo y pedidos. Sin deuda ni pagos.',
      },
      {
        label: 'Cajero comercio',
        email: 'cajero.comercio@demo.distrisoft.local',
        password: 'demo1234',
        role: 'COMMERCE_CASHIER',
        description: 'Pedidos de su sucursal. Sin cuenta corriente.',
      },
    ],
  },
];

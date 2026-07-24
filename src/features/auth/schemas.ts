import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Ingresá un correo válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const DEMO_ACCOUNTS = [
  {
    label: 'Administrador',
    email: 'admin@demo.distrisoft.local',
    password: 'demo1234',
    role: 'ADMIN' as const,
  },
  {
    label: 'Comercio',
    email: 'comercio@demo.distrisoft.local',
    password: 'demo1234',
    role: 'COMMERCE' as const,
  },
] as const;

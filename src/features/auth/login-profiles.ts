import {
  getCredentialsForRole,
  getRolePresentation,
} from './role-presentation';

/**
 * Profiles shown on the public demo login.
 * Other DemoRole values remain in mocks/permissions for internal fidelity.
 */
export const LOGIN_DEMO_ROLES = [
  'DISTRIBUTOR_ADMIN',
  'COMMERCE_OWNER',
] as const;

export type LoginProfileCard = {
  role: (typeof LOGIN_DEMO_ROLES)[number];
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  cta: string;
};

export const LOGIN_PROFILE_CARDS: LoginProfileCard[] = [
  {
    role: 'DISTRIBUTOR_ADMIN',
    title: 'Administrador',
    subtitle: 'Distribuidora',
    description:
      'Gestioná comercios, pedidos, inventario, cobranzas demo y el mapa comercial.',
    highlights: [
      'Panel ejecutivo',
      'Mapa de comercios',
      'Pedidos e inventario',
      'Reportes demo',
    ],
    cta: 'Entrar como administrador',
  },
  {
    role: 'COMMERCE_OWNER',
    title: 'Comercio',
    subtitle: 'Cliente',
    description:
      'Comprá del catálogo mayorista, armá tu pedido y consultá tu cuenta comercial.',
    highlights: [
      'Catálogo con fotos',
      'Carrito y pedidos',
      'Cuenta corriente',
      'Ofertas destacadas',
    ],
    cta: 'Entrar como comercio',
  },
];

export function getLoginProfile(role: string): LoginProfileCard | undefined {
  return LOGIN_PROFILE_CARDS.find((card) => card.role === role);
}

export function assertLoginCredentials(role: LoginProfileCard['role']) {
  const credentials = getCredentialsForRole(role);
  const presentation = getRolePresentation(role);
  if (!credentials || !presentation) {
    throw new Error(`Missing demo credentials for ${role}`);
  }
  return { credentials, presentation };
}

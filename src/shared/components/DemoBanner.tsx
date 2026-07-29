import { env } from '@/app/config/env';

export function DemoBanner() {
  if (!env.demoMode) return null;
  return (
    <div className="sticky top-0 z-50 border-b border-teal-200 bg-teal-50 px-4 py-2 text-center text-sm font-medium text-teal-950">
      Demo Distrisoft — Datos de ejemplo para recorrer la plataforma
    </div>
  );
}

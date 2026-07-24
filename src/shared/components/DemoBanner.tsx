import { env } from '@/app/config/env';

export function DemoBanner() {
  if (!env.demoMode) return null;
  return (
    <div className="sticky top-0 z-50 border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-900">
      Modo demostración — Datos ficticios
    </div>
  );
}

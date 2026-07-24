import type { DemoRolePresentation } from '@/features/auth/role-presentation';

type DemoRoleDetailsProps = {
  presentation: DemoRolePresentation;
};

export function DemoRoleDetails({ presentation }: DemoRoleDetailsProps) {
  return (
    <section
      aria-label="Detalle del rol seleccionado"
      aria-live="polite"
      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
        {presentation.area}
      </p>
      <h3 className="mt-1 text-base font-semibold text-slate-900">
        {presentation.label}
      </h3>
      <p className="mt-2 text-sm text-slate-600">
        {presentation.shortDescription}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Puede</h4>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {presentation.capabilities.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-800">No puede</h4>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {presentation.restrictions.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-600">
        Destino inicial:{' '}
        <code className="rounded bg-white px-1.5 py-0.5 text-xs text-slate-800">
          {presentation.destination}
        </code>
      </p>
    </section>
  );
}

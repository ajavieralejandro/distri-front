import type { DemoRolePresentation } from '@/features/auth/role-presentation';

type DemoRoleCardProps = {
  presentation: DemoRolePresentation;
  selected: boolean;
  onSelect: () => void;
};

function RoleIcon({ role }: { role: DemoRolePresentation['role'] }) {
  const common = 'h-5 w-5';
  switch (role) {
    case 'DISTRIBUTOR_ADMIN':
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2 3 7v2h18V7L12 2Zm-7 9v9h4v-6h6v6h4v-9H5Z"
          />
        </svg>
      );
    case 'SALES':
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 4h16v2H4V4Zm1 4h14l-1.2 12H6.2L5 8Zm4 2v8h2v-8H9Zm4 0v8h2v-8h-2Z"
          />
        </svg>
      );
    case 'WAREHOUSE_PICKER':
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path
            fill="currentColor"
            d="M3 7 12 2l9 5v13h-6v-7H9v7H3V7Zm8 13h2v-5h-2v5Z"
          />
        </svg>
      );
    case 'CASHIER':
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path
            fill="currentColor"
            d="M3 6h18v12H3V6Zm2 2v8h14V8H5Zm3 2h8v2H8v-2Zm0 3h5v2H8v-2Z"
          />
        </svg>
      );
    case 'DRIVER':
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path
            fill="currentColor"
            d="M3 7h11l4 4h3v6h-2a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H1V9l2-2Zm2 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm12 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path
            fill="currentColor"
            d="M7 4h10v4H7V4Zm-2 6h14v10H5V10Zm4 2v2h6v-2H9Z"
          />
        </svg>
      );
  }
}

export function DemoRoleCard({
  presentation,
  selected,
  onSelect,
}: DemoRoleCardProps) {
  return (
    <article
      aria-current={selected ? 'true' : undefined}
      className={[
        'rounded-xl border p-4 transition-colors duration-200 motion-reduce:transition-none',
        selected
          ? 'border-teal-600 bg-teal-50'
          : 'border-slate-200 bg-white hover:border-slate-300',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <span
          className={[
            'mt-0.5 inline-flex rounded-lg p-2',
            selected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700',
          ].join(' ')}
        >
          <RoleIcon role={presentation.role} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-900">
            {presentation.label}
          </h3>
          <p className="mt-1 text-xs text-slate-600">
            {presentation.shortDescription}
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-700">
            {presentation.capabilities.slice(0, 3).map((capability) => (
              <li key={capability}>• {capability}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onSelect}
            className="mt-3 min-h-10 rounded-md border border-teal-700 px-3 py-1.5 text-sm font-medium text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            {selected ? 'Rol seleccionado' : 'Elegir rol'}
          </button>
        </div>
      </div>
    </article>
  );
}

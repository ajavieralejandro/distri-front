const BENEFITS = [
  'Catálogo mayorista',
  'Pedidos y seguimiento',
  'Mapa de comercios',
  'Cuenta comercial',
] as const;

export function LoginHeroPanel() {
  return (
    <aside className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-slate-100 sm:p-8 lg:min-h-[40rem]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-teal-500/20 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-cyan-400/10 blur-2xl"
      />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
        Distrisoft
      </p>
      <h1 className="mt-4 max-w-md text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Distribución y compras, en una sola plataforma.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
        Conectá tu distribuidora con los comercios que te compran: catálogo,
        pedidos, cobranzas y mapa comercial en una demo lista para recorrer.
      </p>

      <div aria-hidden="true" className="mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
        {['Pedidos', 'Catálogo', 'Mapa', 'Cuentas'].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <div className="mb-3 h-2 w-10 rounded bg-teal-400/70" />
            <p className="text-sm font-medium text-white">{label}</p>
            <div className="mt-2 space-y-1.5">
              <div className="h-1.5 rounded bg-white/20" />
              <div className="h-1.5 w-2/3 rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>

      <ul className="mt-8 grid gap-2 sm:max-w-md sm:grid-cols-2">
        {BENEFITS.map((benefit) => (
          <li
            key={benefit}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
          >
            {benefit}
          </li>
        ))}
      </ul>

      <div className="mt-8 inline-flex flex-wrap gap-2 rounded-lg border border-teal-400/30 bg-teal-400/10 px-3 py-2 text-sm text-teal-50">
        <span className="font-semibold">Demo interactiva</span>
        <span aria-hidden="true">·</span>
        <span>Datos de ejemplo</span>
      </div>
    </aside>
  );
}

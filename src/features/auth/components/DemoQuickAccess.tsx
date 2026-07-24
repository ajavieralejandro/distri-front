type DemoQuickAccessProps = {
  selectedLabel: string;
  onEnterSelected: () => void;
  onExploreAdmin: () => void;
  onShopAsCommerce: () => void;
  isPending: boolean;
};

export function DemoQuickAccess({
  selectedLabel,
  onEnterSelected,
  onExploreAdmin,
  onShopAsCommerce,
  isPending,
}: DemoQuickAccessProps) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={isPending}
        onClick={onEnterSelected}
        className="min-h-11 w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-opacity duration-200 hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 motion-reduce:transition-none"
      >
        {isPending ? 'Ingresando…' : `Entrar como ${selectedLabel}`}
      </button>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          disabled={isPending}
          onClick={onExploreAdmin}
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          Explorar como administrador
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={onShopAsCommerce}
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          Comprar como comercio
        </button>
      </div>
    </div>
  );
}

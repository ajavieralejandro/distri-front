type LoadingIndicatorProps = {
  label?: string;
};

export function LoadingIndicator({
  label = 'Cargando…',
}: LoadingIndicatorProps) {
  return (
    <div
      className="flex items-center gap-3 text-sm text-slate-600"
      role="status"
      aria-live="polite"
    >
      <span
        className="inline-block size-4 animate-spin rounded-full border-2 border-slate-300 border-t-teal-700"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}

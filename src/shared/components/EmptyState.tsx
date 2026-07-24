type EmptyStateProps = {
  title?: string;
  message: string;
};

export function EmptyState({
  title = 'Sin contenido todavía',
  message,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
      <p className="text-base font-medium text-slate-800">{title}</p>
      <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">{message}</p>
    </div>
  );
}

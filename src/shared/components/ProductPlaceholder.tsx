export function ProductPlaceholder({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  return (
    <div
      aria-label={`Imagen de ${name}`}
      className="flex h-24 w-full items-center justify-center rounded-lg bg-gradient-to-br from-teal-100 to-slate-200 text-2xl font-bold text-teal-800"
    >
      {initials}
    </div>
  );
}

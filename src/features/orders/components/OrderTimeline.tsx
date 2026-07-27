import { formatDateTime } from '@/shared/lib/datetime';
import { orderStatusLabels } from '@/shared/lib/labels';
import type { OrderStatusEvent } from '@/shared/types/demo';

type OrderTimelineProps = {
  history: OrderStatusEvent[];
};

export function OrderTimeline({ history }: OrderTimelineProps) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-slate-500">Sin eventos de trazabilidad.</p>
    );
  }

  const ordered = [...history].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );

  return (
    <ol className="space-y-3 border-l border-slate-200 pl-4">
      {ordered.map((event) => (
        <li key={event.id} className="relative">
          <span className="absolute -left-[1.3rem] top-1.5 h-2.5 w-2.5 rounded-full bg-teal-600" />
          <p className="text-sm font-medium text-slate-800">
            {event.fromStatus
              ? `${orderStatusLabels[event.fromStatus]} → ${orderStatusLabels[event.toStatus]}`
              : orderStatusLabels[event.toStatus]}
          </p>
          <p className="text-xs text-slate-500">
            {formatDateTime(event.createdAt)} · {event.userDisplayName}
          </p>
          {event.note ? (
            <p className="mt-1 text-sm text-slate-600">{event.note}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  useAdminAlertsQuery,
  useAlertReadState,
} from '@/features/admin/alerts';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatDateTime } from '@/shared/lib/datetime';
import type {
  AdminAlertSeverity,
  AdminAlertType,
} from '@/shared/types/admin-ops';

const severityTone: Record<AdminAlertSeverity, 'info' | 'warning' | 'danger'> =
  {
    info: 'info',
    warning: 'warning',
    critical: 'danger',
  };

const typeLabels: Record<AdminAlertType, string> = {
  LOW_STOCK: 'Stock bajo',
  OUT_OF_STOCK: 'Sin stock',
  DELAYED_ORDER: 'Pedido demorado',
  DELIVERY_INCIDENT: 'Incidencia de entrega',
  OVERDUE_DEBT: 'Deuda vencida',
  CREDIT_LIMIT_EXCEEDED: 'Crédito excedido',
  PENDING_PAYMENT: 'Cobranza pendiente',
  INACTIVE_BRANCH: 'Comercio inactivo',
  HIGH_PRIORITY_ORDER: 'Prioridad alta',
};

export function AdminAlertsPage() {
  const query = useAdminAlertsQuery();
  const { readSet, markRead, markAllRead } = useAlertReadState();
  const [severity, setSeverity] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const filtered = useMemo(() => {
    return (query.data ?? []).filter((alert) => {
      if (severity && alert.severity !== severity) return false;
      if (unreadOnly && readSet.has(alert.id)) return false;
      return true;
    });
  }, [query.data, severity, unreadOnly, readSet]);

  const unreadCount = (query.data ?? []).filter(
    (alert) => !readSet.has(alert.id),
  ).length;

  return (
    <>
      <PageHeader
        title="Alertas"
        description="Situaciones que requieren atención del Administrador. Cada alerta enlaza a la entidad relacionada."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          aria-label="Severidad"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={severity}
          onChange={(event) => setSeverity(event.target.value)}
        >
          <option value="">Todas las severidades</option>
          <option value="critical">Crítica</option>
          <option value="warning">Advertencia</option>
          <option value="info">Informativa</option>
        </select>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(event) => setUnreadOnly(event.target.checked)}
          />
          Solo no leídas ({unreadCount})
        </label>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          disabled={!query.data?.length || markAllRead.isPending}
          onClick={() =>
            markAllRead.mutate((query.data ?? []).map((alert) => alert.id))
          }
        >
          Marcar todas como leídas
        </button>
      </div>

      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!filtered.length}
        emptyMessage="No hay alertas con los filtros actuales."
      >
        <ul className="space-y-3">
          {filtered.map((alert) => {
            const isRead = readSet.has(alert.id);
            return (
              <li
                key={alert.id}
                className={`rounded-lg bg-white p-4 shadow-sm ${
                  isRead ? 'opacity-75' : 'ring-1 ring-amber-200'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 flex flex-wrap gap-2">
                      <StatusBadge
                        label={alert.severity}
                        tone={severityTone[alert.severity]}
                      />
                      <StatusBadge
                        label={typeLabels[alert.type]}
                        tone="neutral"
                      />
                      {!isRead ? (
                        <StatusBadge label="Nueva" tone="warning" />
                      ) : null}
                    </div>
                    <h2 className="font-semibold text-slate-900">
                      {alert.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {alert.description}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {formatDateTime(alert.createdAt)}
                      {alert.responsibleLabel
                        ? ` · Responsable: ${alert.responsibleLabel}`
                        : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={alert.href}
                      className="rounded-md bg-teal-800 px-3 py-2 text-sm text-white"
                      onClick={() => markRead.mutate(alert.id)}
                    >
                      Ir a la entidad
                    </Link>
                    {!isRead ? (
                      <button
                        type="button"
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        onClick={() => markRead.mutate(alert.id)}
                      >
                        Marcar leída
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </QueryState>
    </>
  );
}

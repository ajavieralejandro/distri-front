import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { CommerceMap } from '@/features/admin/components/CommerceMap';
import { useMapLocationsQuery } from '@/features/admin/map';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatMoney } from '@/shared/lib/money';
import type { CommerceMapItem } from '@/shared/types/admin-ops';

const QUICK_FILTERS = [
  { id: 'active', label: 'Activos' },
  { id: 'pending', label: 'Con pedido pendiente' },
  { id: 'debt', label: 'Con deuda' },
  { id: 'attention', label: 'Requieren seguimiento' },
] as const;

export function AdminMapPage() {
  const query = useMapLocationsQuery();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [zone, setZone] = useState('');
  const [tag, setTag] = useState('');
  const [quick, setQuick] = useState<string>('active');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const item of query.data ?? []) {
      for (const value of item.tags) set.add(value);
    }
    return Array.from(set).sort();
  }, [query.data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (query.data ?? []).filter((item) => {
      if (type && item.commerceType !== type) return false;
      if (zone && item.zone !== zone) return false;
      if (tag && !item.tags.includes(tag)) return false;
      if (quick === 'active' && item.status !== 'ACTIVE') return false;
      if (quick === 'pending' && item.pendingOrders <= 0) return false;
      if (quick === 'debt' && !item.hasDebt) return false;
      if (quick === 'attention' && !item.needsAttention) return false;
      if (!term) return true;
      return (
        item.name.toLowerCase().includes(term) ||
        item.address.toLowerCase().includes(term) ||
        item.city.toLowerCase().includes(term)
      );
    });
  }, [query.data, search, type, zone, tag, quick]);

  const selected =
    filtered.find((item) => item.id === selectedId) ??
    filtered[0] ??
    null;

  const summary = useMemo(() => {
    const source = query.data ?? [];
    return {
      total: filtered.length,
      active: source.filter((item) => item.status === 'ACTIVE').length,
      pending: source.filter((item) => item.pendingOrders > 0).length,
      attention: source.filter((item) => item.needsAttention).length,
    };
  }, [query.data, filtered.length]);

  return (
    <>
      <PageHeader
        title="Mapa de comercios"
        description="Explorá clientes por zona, tipo y situación comercial. Abrí indicaciones en Google Maps cuando lo necesites."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        {[
          ['Encontrados', summary.total],
          ['Activos', summary.active],
          ['Con pedido pendiente', summary.pending],
          ['Requieren seguimiento', summary.attention],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setQuick(filter.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              quick === filter.id
                ? 'bg-teal-700 text-white'
                : 'bg-white text-slate-700 shadow-sm'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-4">
        <input
          aria-label="Buscar comercios"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm lg:col-span-2"
          placeholder="Nombre, dirección o localidad"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          aria-label="Tipo de comercio"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="ALMACEN">Almacén</option>
          <option value="KIOSCO">Kiosco</option>
          <option value="AUTOSERVICIO">Autoservicio</option>
          <option value="MAYORISTA">Mayorista</option>
        </select>
        <select
          aria-label="Zona"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={zone}
          onChange={(event) => setZone(event.target.value)}
        >
          <option value="">Todas las zonas</option>
          <option value="CENTRO">Zona centro</option>
          <option value="NORTE">Zona norte</option>
          <option value="OESTE">Zona oeste</option>
          <option value="SUR">Zona sur</option>
        </select>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTag('')}
          className={`rounded-full px-3 py-1 text-xs ${
            !tag ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Todos los tags
        </button>
        {allTags.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTag(value)}
            className={`rounded-full px-3 py-1 text-xs ${
              tag === value
                ? 'bg-teal-700 text-white'
                : 'bg-white text-slate-700 shadow-sm'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-3 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-teal-700" /> Activo
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-700" /> Pedido
          pendiente
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-700" /> Seguimiento
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Inactivo
        </span>
      </div>

      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!filtered.length}
        emptyMessage="Ningún comercio coincide con los filtros."
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <CommerceMap
            items={filtered}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
          />
          <aside className="space-y-3">
            {selected ? <CommerceCard item={selected} highlighted /> : null}
            <div className="max-h-[28rem] space-y-2 overflow-y-auto rounded-xl bg-white p-3 shadow-sm">
              <p className="text-sm font-semibold text-slate-800">
                Listado ({filtered.length})
              </p>
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                    selected?.id === item.id
                      ? 'border-teal-700 bg-teal-50'
                      : 'border-slate-200 hover:border-teal-600/40'
                  }`}
                >
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    {item.address} · {item.zoneLabel}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.tags.slice(0, 2).map((value) => (
                      <span
                        key={value}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] text-slate-700"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </QueryState>
    </>
  );
}

function CommerceCard({
  item,
  highlighted = false,
}: {
  item: CommerceMapItem;
  highlighted?: boolean;
}) {
  return (
    <article
      className={`rounded-xl bg-white p-4 shadow-sm ${
        highlighted ? 'ring-2 ring-teal-700/20' : ''
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold text-slate-900">{item.name}</h2>
          <p className="text-sm text-slate-600">{item.businessName}</p>
        </div>
        <StatusBadge
          label={item.statusLabel}
          tone={item.status === 'ACTIVE' ? 'success' : 'neutral'}
        />
      </div>
      <p className="mt-2 text-sm text-slate-700">
        {item.address}
        <br />
        {item.city} · {item.zoneLabel}
      </p>
      <p className="mt-2 text-sm text-slate-600">
        {item.commerceTypeLabel} · Último pedido: {item.lastOrderLabel}
      </p>
      <p className="text-sm text-slate-600">{item.phone}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {item.tags.map((value) => (
          <span
            key={value}
            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
          >
            {value}
          </span>
        ))}
      </div>
      {item.hasDebt ? (
        <p className="mt-2 text-sm text-amber-800">
          Saldo: {formatMoney(item.debt)}
          {item.hasOverdueDebt ? ' · Deuda vencida' : ''}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          to={item.href}
          className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white"
        >
          Ver comercio
        </Link>
        <a
          href={item.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800"
        >
          Cómo llegar
        </a>
      </div>
    </article>
  );
}

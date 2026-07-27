import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  OperationalMap,
  TYPE_COLORS,
  TYPE_LABELS,
} from '@/features/admin/components/OperationalMap';
import { useMapLocationsQuery } from '@/features/admin/map';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';
import type { MapLocationType } from '@/shared/types/admin-ops';

const ALL_TYPES = Object.keys(TYPE_LABELS) as MapLocationType[];

export function AdminMapPage() {
  const query = useMapLocationsQuery();
  const [visible, setVisible] = useState<Set<MapLocationType>>(
    () => new Set(ALL_TYPES),
  );

  const visibleTypes = useMemo(() => visible, [visible]);

  const toggle = (type: MapLocationType) => {
    setVisible((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  return (
    <>
      <PageHeader
        title="Mapa operativo"
        description="Depósitos, comercios, sucursales y pedidos pendientes de entrega. Sin claves de mapas privadas (OpenStreetMap)."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {ALL_TYPES.map((type) => {
          const active = visible.has(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggle(type)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                active
                  ? 'border-slate-300 bg-white'
                  : 'border-slate-200 bg-slate-100 text-slate-400'
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: TYPE_COLORS[type] }}
              />
              {TYPE_LABELS[type]}
            </button>
          );
        })}
      </div>

      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!query.data?.length}
        emptyMessage="No hay puntos geográficos en la demo."
      >
        {query.data ? (
          <div className="space-y-4">
            <OperationalMap
              locations={query.data}
              visibleTypes={visibleTypes}
            />
            <section className="rounded-lg bg-white p-4 shadow-sm">
              <h2 className="mb-2 font-semibold">Listado de puntos</h2>
              <ul className="divide-y text-sm">
                {query.data
                  .filter((location) => visible.has(location.type))
                  .map((location) => (
                    <li
                      key={location.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-2"
                    >
                      <div>
                        <p className="font-medium">{location.name}</p>
                        <p className="text-slate-600">
                          {TYPE_LABELS[location.type]} · {location.address}
                        </p>
                      </div>
                      <Link
                        className="text-teal-800 underline"
                        to={location.href}
                      >
                        Abrir detalle
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          </div>
        ) : null}
      </QueryState>
    </>
  );
}

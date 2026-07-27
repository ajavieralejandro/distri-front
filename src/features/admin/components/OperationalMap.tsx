import { useEffect, useRef, useState } from 'react';
import type { LayerGroup, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type { MapLocation, MapLocationType } from '@/shared/types/admin-ops';
import { formatMoney } from '@/shared/lib/money';

const TYPE_LABELS: Record<MapLocationType, string> = {
  WAREHOUSE: 'Depósito propio',
  DISTRIBUTOR_BRANCH: 'Sucursal distribuidora',
  COMMERCE: 'Comercio cliente',
  COMMERCE_BRANCH: 'Sucursal de comercio',
  ORDER_PENDING_DELIVERY: 'Pedido pendiente de entrega',
  ORDER_IN_TRANSIT: 'Entrega en recorrido',
};

const TYPE_COLORS: Record<MapLocationType, string> = {
  WAREHOUSE: '#0f766e',
  DISTRIBUTOR_BRANCH: '#155e75',
  COMMERCE: '#1d4ed8',
  COMMERCE_BRANCH: '#4338ca',
  ORDER_PENDING_DELIVERY: '#b45309',
  ORDER_IN_TRANSIT: '#be123c',
};

type OperationalMapProps = {
  locations: MapLocation[];
  visibleTypes: Set<MapLocationType>;
};

export function OperationalMap({
  locations,
  visibleTypes,
}: OperationalMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      if (!containerRef.current || mapRef.current) return;
      try {
        const L = await import('leaflet');
        if (cancelled || !containerRef.current) return;

        const map = L.map(containerRef.current).setView([-34.6, -58.45], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        layerRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    void setup();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    async function syncMarkers() {
      if (!mapRef.current || !layerRef.current) return;
      const L = await import('leaflet');
      layerRef.current.clearLayers();

      const visible = locations.filter((location) =>
        visibleTypes.has(location.type),
      );

      for (const location of visible) {
        const marker = L.circleMarker([location.lat, location.lng], {
          radius: 8,
          color: TYPE_COLORS[location.type],
          fillColor: TYPE_COLORS[location.type],
          fillOpacity: 0.85,
          weight: 1,
        });

        const debt =
          location.debt !== undefined
            ? `<br/>Deuda: ${formatMoney(location.debt)}`
            : '';
        const pending =
          location.pendingOrders !== undefined
            ? `<br/>Pedidos pendientes: ${location.pendingOrders}`
            : '';
        const stock = location.stockSummary
          ? `<br/>${location.stockSummary}`
          : '';

        marker.bindPopup(
          `<strong>${location.name}</strong><br/>${TYPE_LABELS[location.type]}<br/>${location.address}${pending}${debt}${stock}<br/><a href="#${location.href}">Ver detalle</a>`,
        );
        marker.addTo(layerRef.current);
      }

      if (visible.length > 0) {
        const bounds = L.latLngBounds(
          visible.map((location) => [location.lat, location.lng]),
        );
        mapRef.current.fitBounds(bounds.pad(0.2));
      }
    }

    void syncMarkers();
  }, [locations, visibleTypes]);

  if (failed) {
    return (
      <MapFallback
        locations={locations.filter((l) => visibleTypes.has(l.type))}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[28rem] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
      role="application"
      aria-label="Mapa operativo Distrisoft"
    />
  );
}

function MapFallback({ locations }: { locations: MapLocation[] }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="mb-3 text-sm text-amber-900">
        No se pudo cargar el mapa interactivo. Listado de puntos operativos:
      </p>
      <ul className="space-y-2 text-sm">
        {locations.map((location) => (
          <li
            key={location.id}
            className="rounded bg-white px-3 py-2 shadow-sm"
          >
            <p className="font-medium">{location.name}</p>
            <p className="text-slate-600">
              {TYPE_LABELS[location.type]} · {location.address}
            </p>
            <a className="text-teal-800 underline" href={`#${location.href}`}>
              Abrir detalle
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { TYPE_LABELS, TYPE_COLORS };

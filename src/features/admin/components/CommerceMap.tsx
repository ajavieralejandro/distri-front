import { useEffect, useRef, useState } from 'react';
import type { LayerGroup, Map as LeafletMap, CircleMarker } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type { CommerceMapItem } from '@/shared/types/admin-ops';
import { formatMoney } from '@/shared/lib/money';

function markerColor(item: CommerceMapItem): string {
  if (item.status === 'INACTIVE') return '#94a3b8';
  if (item.hasOverdueDebt || item.needsAttention) return '#be123c';
  if (item.pendingOrders > 0) return '#b45309';
  return '#0f766e';
}

type CommerceMapProps = {
  items: CommerceMapItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function CommerceMap({ items, selectedId, onSelect }: CommerceMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const markersRef = useRef<Map<string, CircleMarker>>(new Map());
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const markers = markersRef.current;

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
      markers.clear();
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    async function sync() {
      if (!mapRef.current || !layerRef.current) return;
      const L = await import('leaflet');
      layerRef.current.clearLayers();
      markersRef.current.clear();

      for (const item of items) {
        const selected = item.id === selectedId;
        const marker = L.circleMarker([item.latitude, item.longitude], {
          radius: selected ? 11 : 8,
          color: selected ? '#134e4a' : markerColor(item),
          fillColor: markerColor(item),
          fillOpacity: 0.9,
          weight: selected ? 3 : 1,
        });
        marker.on('click', () => onSelect(item.id));
        marker.bindPopup(
          `<strong>${item.name}</strong><br/>${item.address}<br/>${item.commerceTypeLabel}`,
        );
        marker.addTo(layerRef.current);
        markersRef.current.set(item.id, marker);
      }

      if (items.length > 0) {
        const bounds = L.latLngBounds(
          items.map((item) => [item.latitude, item.longitude] as [number, number]),
        );
        mapRef.current.fitBounds(bounds.pad(0.25));
      }
    }

    void sync();
  }, [items, onSelect, selectedId]);

  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const marker = markersRef.current.get(selectedId);
    const item = items.find((candidate) => candidate.id === selectedId);
    if (!marker || !item) return;
    mapRef.current.setView([item.latitude, item.longitude], 14, {
      animate: true,
    });
    marker.openPopup();
  }, [selectedId, items]);

  if (failed) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        No se pudo cargar el mapa. Usá el listado lateral para explorar comercios.
        {items[0] ? (
          <p className="mt-2">
            Deuda ejemplo: {formatMoney(items[0].debt)}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[22rem] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 lg:h-[32rem]"
      role="application"
      aria-label="Mapa de comercios"
    />
  );
}

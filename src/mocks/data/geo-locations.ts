/**
 * Demo coordinates around CABA for the operational map.
 * Keys match entity ids from fixtures (commerces, warehouses, branches, orders).
 */
export const GEO_BY_ID: Record<string, { lat: number; lng: number }> = {
  'wh-1': { lat: -34.6037, lng: -58.3816 },
  'wh-2': { lat: -34.5492, lng: -58.466 },
  'com-1': { lat: -34.6158, lng: -58.4333 },
  'com-2': { lat: -34.5765, lng: -58.505 },
  'com-3': { lat: -34.615, lng: -58.485 },
  'com-4': { lat: -34.6039, lng: -58.3772 },
  'branch-1': { lat: -34.6175, lng: -58.431 },
  'branch-2': { lat: -34.578, lng: -58.502 },
  'ord-4': { lat: -34.612, lng: -58.44 },
  'ord-5': { lat: -34.58, lng: -58.5 },
  'ord-8': { lat: -34.575, lng: -58.51 },
};

export function geoFor(id: string): { lat: number; lng: number } | undefined {
  return GEO_BY_ID[id];
}

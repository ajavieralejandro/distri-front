import { httpClient } from '@/shared/api/http-client';
import type { InventoryItem, InventoryMovement } from '@/shared/types/demo';

export type InventoryListParams = {
  search?: string;
  warehouseId?: string;
  lowStock?: boolean;
  signal?: AbortSignal;
};

export type AdjustInventoryBody = {
  productId: string;
  warehouseId: string;
  quantity: number;
  reason: string;
};

export type AdjustInventoryResult = {
  item: InventoryItem;
  movement: InventoryMovement;
};

export function fetchInventory(
  params: InventoryListParams = {},
): Promise<InventoryItem[]> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.warehouseId) query.set('warehouseId', params.warehouseId);
  if (params.lowStock) query.set('lowStock', 'true');
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return httpClient.get<InventoryItem[]>(`/inventory${suffix}`, {
    signal: params.signal,
  });
}

export function adjustInventory(
  body: AdjustInventoryBody,
): Promise<AdjustInventoryResult> {
  return httpClient.post<AdjustInventoryResult, AdjustInventoryBody>(
    '/inventory/adjust',
    body,
  );
}

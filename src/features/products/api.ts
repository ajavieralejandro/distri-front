import { httpClient } from '@/shared/api/http-client';
import type { Category, Product } from '@/shared/types/demo';

export type ProductListParams = {
  search?: string;
  categoryId?: string;
  active?: boolean;
  signal?: AbortSignal;
};

export function fetchProducts(
  params: ProductListParams = {},
): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.categoryId) query.set('categoryId', params.categoryId);
  if (params.active !== undefined) query.set('active', String(params.active));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return httpClient.get<Product[]>(`/products${suffix}`, {
    signal: params.signal,
  });
}

export function fetchProduct(
  id: string,
  signal?: AbortSignal,
): Promise<Product> {
  return httpClient.get<Product>(`/products/${id}`, { signal });
}

export function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  return httpClient.get<Category[]>('/categories', { signal });
}

import { useQuery } from '@tanstack/react-query';

import {
  fetchCategories,
  fetchProduct,
  fetchProducts,
  type ProductListParams,
} from '@/features/products/api';

export function useProductsQuery(
  params: Omit<ProductListParams, 'signal'> = {},
) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: ({ signal }) => fetchProducts({ ...params, signal }),
  });
}

export function useProductQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: ({ signal }) => fetchProduct(id!, signal),
    enabled: Boolean(id),
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: ({ signal }) => fetchCategories(signal),
  });
}

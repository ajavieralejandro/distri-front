import { getDatabase } from '@/mocks/data/mock-database';
import { HttpResponse, http } from 'msw';

import { api, withLatency } from './utils';

export const productHandlers = [
  http.get(api('/products'), async ({ request }) => {
    await withLatency();
    const params = new URL(request.url).searchParams;
    const search = params.get('search')?.trim().toLowerCase();
    const categoryId = params.get('categoryId');
    const active = params.get('active');
    const products = getDatabase().products.filter((product) => {
      const matchesSearch =
        !search ||
        [product.name, product.sku, product.description]
          .join(' ')
          .toLowerCase()
          .includes(search);
      const matchesActive =
        active === null ||
        active === '' ||
        product.active === (active === 'true');
      return (
        matchesSearch &&
        (!categoryId || product.categoryId === categoryId) &&
        matchesActive
      );
    });
    return HttpResponse.json(products);
  }),

  http.get(api('/products/:id'), async ({ params }) => {
    await withLatency();
    const product = getDatabase().products.find(
      (candidate) => candidate.id === params.id,
    );
    return product
      ? HttpResponse.json(product)
      : HttpResponse.json(
          { message: 'Producto no encontrado.' },
          { status: 404 },
        );
  }),

  http.get(api('/categories'), async () => {
    await withLatency();
    return HttpResponse.json(getDatabase().categories);
  }),
];

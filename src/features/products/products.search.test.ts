import { describe, expect, it } from 'vitest';

import { fetchProducts } from './api';

describe('fetchProducts', () => {
  it('returns only products matching the search query through MSW', async () => {
    const products = await fetchProducts({ search: 'agua mineral' });

    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({
      id: 'prod-1',
      name: 'Agua mineral',
    });
  });
});

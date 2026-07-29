import { describe, expect, it } from 'vitest';

import {
  STORAGE_KEY,
  getDatabase,
  loadDatabase,
  resetDatabase,
} from '@/mocks/data/mock-database';

describe('demo database v3 persistence', () => {
  it('discards incompatible older payloads safely', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 2, products: [] }),
    );
    const db = loadDatabase();
    expect(db.version).toBe(3);
    expect(db.users.length).toBeGreaterThan(0);
    expect(db.commerces[0]?.latitude).toBeTypeOf('number');
  });

  it('reset restores initial fixtures', () => {
    const db = getDatabase();
    db.products[0]!.name = 'X';
    const restored = resetDatabase();
    expect(restored.version).toBe(3);
    expect(restored.products[0]?.name).toBe('Agua mineral');
    expect(restored.products[0]?.brand).toBeTruthy();
  });
});

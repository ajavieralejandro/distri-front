import { describe, expect, it } from 'vitest';

import {
  STORAGE_KEY,
  getDatabase,
  loadDatabase,
  resetDatabase,
} from '@/mocks/data/mock-database';

describe('demo database v2 persistence', () => {
  it('discards incompatible v1 payloads safely', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, products: [] }),
    );
    const db = loadDatabase();
    expect(db.version).toBe(2);
    expect(db.users.length).toBeGreaterThan(0);
  });

  it('reset restores initial fixtures', () => {
    const db = getDatabase();
    db.products[0]!.name = 'X';
    const restored = resetDatabase();
    expect(restored.version).toBe(2);
    expect(restored.products[0]?.name).toBe('Agua mineral');
  });
});

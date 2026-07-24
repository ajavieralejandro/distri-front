import { resetDatabase } from './data/mock-database';

export const CART_STORAGE_KEY = 'distrisoft-demo-cart-v1';

export function resetDemoData() {
  const database = resetDatabase();

  if (
    typeof window !== 'undefined' &&
    typeof window.localStorage !== 'undefined'
  ) {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  }

  return database;
}

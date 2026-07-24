import type { DemoDatabase } from '@/shared/types/demo';

import { createInitialDatabase } from './fixtures';

export const STORAGE_KEY = 'distrisoft-demo-db-v2';

let database: DemoDatabase | undefined;

function canUseStorage(): boolean {
  return (
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  );
}

function persist(databaseToSave: DemoDatabase): void {
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(databaseToSave));
  }
}

export function saveDatabase(db: DemoDatabase): void {
  database = db;
  persist(db);
}

export function loadDatabase(): DemoDatabase {
  if (!canUseStorage()) {
    return createInitialDatabase();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed: unknown = JSON.parse(stored);
      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        'version' in parsed &&
        parsed.version === 2
      ) {
        database = parsed as DemoDatabase;
        return database;
      }
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  const freshDatabase = createInitialDatabase();
  saveDatabase(freshDatabase);
  return freshDatabase;
}

export function getDatabase(): DemoDatabase {
  database ??= loadDatabase();
  return database;
}

export function mutateDatabase<T>(updater: (db: DemoDatabase) => T): T {
  const db = getDatabase();
  const result = updater(db);
  saveDatabase(db);
  return result;
}

export function resetDatabase(): DemoDatabase {
  if (canUseStorage()) {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  const freshDatabase = createInitialDatabase();
  saveDatabase(freshDatabase);
  return freshDatabase;
}

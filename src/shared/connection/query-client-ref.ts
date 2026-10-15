import type { QueryClient } from '@tanstack/react-query';

let registered: QueryClient | null = null;

export function registerQueryClient(client: QueryClient | null): void {
  registered = client;
}

export function registeredQueryClient(): QueryClient | null {
  return registered;
}

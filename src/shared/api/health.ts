import { httpClient } from '@/shared/api/http-client';

export type HealthResponse = {
  status: string;
  service: string;
  timestamp: string;
};

export function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return httpClient.get<HealthResponse>('/health', { signal });
}

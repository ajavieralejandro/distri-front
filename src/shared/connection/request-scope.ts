export class CancelledRequestError extends Error {
  constructor() {
    super('La solicitud se canceló.');
    this.name = 'CancelledRequestError';
  }
}

let generation = 0;
let controller = new AbortController();

export function requestGeneration(): number {
  return generation;
}

export function requestSignal(): AbortSignal {
  return controller.signal;
}

export function throwIfStale(started: number): void {
  if (started !== generation) {
    throw new CancelledRequestError();
  }
}

export function cancelInflightRequests(): void {
  generation += 1;
  controller.abort();
  controller = new AbortController();
}

export function resetRequestScope(): void {
  generation += 1;
  controller.abort();
  controller = new AbortController();
  generation = 0;
}

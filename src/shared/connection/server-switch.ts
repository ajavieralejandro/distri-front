import { clearDemoSession, readDemoSession } from '@/features/auth/session';
import { useCartStore } from '@/features/orders/cart-store';
import {
  clearStoredApiBaseUrl,
  initialApiBaseUrl,
  persistApiBaseUrl,
  readActiveBaseUrl,
} from '@/shared/connection/connection-store';
import {
  readUncertainSubmission,
  type UncertainSubmission,
} from '@/shared/connection/pending-submission';
import { registeredQueryClient } from '@/shared/connection/query-client-ref';
import { cancelInflightRequests } from '@/shared/connection/request-scope';

export type ServerSwitchImpact = {
  session: boolean;
  cart: boolean;
  uncertain: UncertainSubmission | null;
};

export function serverSwitchImpact(): ServerSwitchImpact {
  const current = readActiveBaseUrl();
  return {
    session: readDemoSession() !== null,
    cart: useCartStore.getState().items.length > 0,
    uncertain: current ? readUncertainSubmission(current) : null,
  };
}

export function switchNeedsConfirmation(impact: ServerSwitchImpact): boolean {
  return impact.session || impact.cart || impact.uncertain !== null;
}

export function serverSwitchConfirmation(
  impact: ServerSwitchImpact,
  currentUrl: string | null,
): string {
  const sentences = ['Cambiar la dirección es cambiar de entorno.'];
  if (impact.session) {
    sentences.push(
      'Se cierra la sesión de este dispositivo y se eliminan los tokens locales.',
    );
  }
  if (impact.cart) {
    sentences.push(
      'Se vacía el carrito local y no se reutiliza en el servidor nuevo.',
    );
  }
  if (impact.uncertain) {
    sentences.push(
      `Hay un envío sin respuesta asociado a ${currentUrl ?? 'el servidor actual'}. No se reenvía. Hay que resolverlo en el servidor anterior.`,
    );
  }
  sentences.push('Cancelar conserva la conexión y los datos actuales.');
  return sentences.join(' ');
}

export function commitApiBaseUrl(next: string | null): void {
  const current = readActiveBaseUrl();
  if (current !== next) {
    cancelInflightRequests();
    const client = registeredQueryClient();
    void client?.cancelQueries();
    client?.clear();
    clearDemoSession();
    useCartStore.getState().clear();
  }

  const initial = initialApiBaseUrl();
  if (next === null || next === initial) {
    clearStoredApiBaseUrl();
    return;
  }
  persistApiBaseUrl(next);
}

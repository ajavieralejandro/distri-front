import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDeliveryUpdateMutation } from '@/features/delivery/hooks';
import { useOrderQuery } from '@/features/orders/hooks';
import type { DeliveryResult } from '@/shared/types/demo';
import { PageHeader } from '@/shared/components/PageHeader';
export function DeliveryOrderPage() {
  const { orderId } = useParams();
  const order = useOrderQuery(orderId);
  const update = useDeliveryUpdateMutation();
  const [result, setResult] = useState<DeliveryResult>('DELIVERED_OK');
  const [observation, setObservation] = useState('');
  return (
    <>
      <PageHeader
        title="Resultado de entrega"
        description={order.data?.number ?? ''}
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (orderId) update.mutate({ id: orderId, result, observation });
        }}
        className="max-w-lg space-y-3 rounded bg-white p-4 shadow"
      >
        <p>{order.data?.deliveryAddress}</p>
        <label className="block">
          Resultado
          <select
            value={result}
            onChange={(event) =>
              setResult(event.target.value as DeliveryResult)
            }
            className="mt-1 w-full rounded border p-2"
          >
            {(
              [
                'DELIVERED_OK',
                'CUSTOMER_ABSENT',
                'WRONG_ADDRESS',
                'REJECTED',
                'PARTIAL_DEMO',
              ] as DeliveryResult[]
            ).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="block">
          Observación
          <textarea
            value={observation}
            onChange={(event) => setObservation(event.target.value)}
            className="mt-1 w-full rounded border p-2"
          />
        </label>
        <button
          disabled={update.isPending}
          className="rounded bg-indigo-700 px-3 py-2 text-white"
        >
          Guardar resultado
        </button>
        {update.error && (
          <p role="alert" className="text-red-700">
            {update.error.message}
          </p>
        )}
      </form>
    </>
  );
}

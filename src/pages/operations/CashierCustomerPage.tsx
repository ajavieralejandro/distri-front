import { useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerQuery } from '@/features/customers/hooks';
import { useCreatePaymentMutation } from '@/features/payments/hooks';
import { createClientOperationId } from '@/shared/lib/id';
import { formatMoney } from '@/shared/lib/money';
import { PageHeader } from '@/shared/components/PageHeader';
import type { PaymentMethod } from '@/shared/types/demo';
export function CashierCustomerPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const customer = useCustomerQuery(customerId);
  const payment = useCreatePaymentMutation();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (customerId)
      payment.mutate(
        {
          commerceId: customerId,
          amount,
          method,
          clientOperationId: createClientOperationId(),
        },
        {
          onSuccess: (item) =>
            navigate(`/operations/cashier/receipts/${item.id}`),
        },
      );
  };
  return (
    <>
      <PageHeader
        title="Cobranza demo"
        description={customer.data?.tradeName ?? ''}
      />
      {customer.data && (
        <p className="mb-4 rounded bg-white p-4 shadow">
          Saldo: <strong>{formatMoney(customer.data.balance)}</strong>
        </p>
      )}
      <p className="mb-4 text-sm text-amber-800">
        No se realizará ningún cobro real; el registro es exclusivamente
        demostrativo.
      </p>
      <form
        onSubmit={submit}
        className="max-w-md space-y-3 rounded bg-white p-4 shadow"
      >
        <label className="block">
          Importe
          <input
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-1 w-full rounded border p-2"
          />
        </label>
        <label className="block">
          Medio
          <select
            value={method}
            onChange={(event) => setMethod(event.target.value as PaymentMethod)}
            className="mt-1 w-full rounded border p-2"
          >
            {(
              [
                'CASH',
                'TRANSFER',
                'CARD',
                'MERCADO_PAGO_DEMO',
              ] as PaymentMethod[]
            ).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <button
          disabled={payment.isPending}
          className="rounded bg-teal-700 px-3 py-2 text-white disabled:opacity-50"
        >
          Registrar pago
        </button>
        {payment.error && (
          <p role="alert" className="text-red-700">
            {payment.error.message}
          </p>
        )}
      </form>
    </>
  );
}

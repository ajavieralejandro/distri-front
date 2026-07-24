import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  useAccountMovementsQuery,
  useAccountSummaryQuery,
} from '@/features/accounts/hooks';
import { useDemoSession } from '@/features/auth/hooks';
import {
  demoPaymentSchema,
  useCreatePaymentMutation,
  type DemoPaymentFormValues,
} from '@/features/payments/hooks';
import {
  accountMovementTypeLabels,
  paymentMethodLabels,
} from '@/shared/lib/labels';
import { formatMoney } from '@/shared/lib/money';
import { Modal } from '@/shared/components/Modal';
import { PageHeader } from '@/shared/components/PageHeader';
import { QueryState } from '@/shared/components/QueryState';

export function AccountPage() {
  const session = useDemoSession();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);

  const summary = useAccountSummaryQuery(session?.commerceId);
  const movements = useAccountMovementsQuery(session?.commerceId);
  const createPayment = useCreatePaymentMutation();

  const form = useForm<DemoPaymentFormValues>({
    resolver: zodResolver(demoPaymentSchema),
    defaultValues: {
      amount: '10000.00',
      method: 'TRANSFER',
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    if (!session?.commerceId) {
      return;
    }

    createPayment.mutate(
      {
        commerceId: session.commerceId,
        amount: values.amount,
        method: values.method,
      },
      {
        onSuccess: (payment) => {
          setReceipt(payment.reference);
          setIsPaymentOpen(false);
          form.reset({ amount: '10000.00', method: 'TRANSFER' });
        },
      },
    );
  });

  return (
    <section>
      <PageHeader
        title="Cuenta corriente"
        description="Saldos, vencimientos y movimientos del comercio."
      />

      <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        No se realizará ningún cobro real. Los pagos son exclusivamente
        demostrativos.
      </p>

      {receipt ? (
        <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Pago simulado registrado. Comprobante demo: <strong>{receipt}</strong>
        </p>
      ) : null}

      <QueryState
        isPending={summary.isPending || movements.isPending}
        isError={summary.isError || movements.isError}
        isEmpty={!summary.data}
      >
        {summary.data ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {(
                [
                  ['Saldo', summary.data.balance],
                  ['Límite de crédito', summary.data.creditLimit],
                  ['Crédito disponible', summary.data.availableCredit],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="rounded-lg bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {formatMoney(value)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white"
                onClick={() => setIsPaymentOpen(true)}
              >
                Simular pago
              </button>
            </div>

            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Movimientos
              </h2>
              <ul className="mt-3 divide-y divide-slate-100">
                {(movements.data ?? []).map((movement) => (
                  <li
                    key={movement.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {movement.description}
                      </p>
                      <p className="text-slate-600">
                        {accountMovementTypeLabels[movement.type]} ·{' '}
                        {movement.reference}
                        {movement.dueDate
                          ? ` · Vence ${new Date(movement.dueDate).toLocaleDateString('es-AR')}`
                          : ''}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatMoney(movement.amount)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </QueryState>

      {isPaymentOpen ? (
        <Modal title="Simular pago" onClose={() => setIsPaymentOpen(false)}>
          <p className="mb-4 text-sm text-slate-600">
            No se realizará ningún cobro real. No se carga SDK de Mercado Pago.
          </p>
          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm font-medium">
              Importe
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                {...form.register('amount')}
              />
            </label>
            {form.formState.errors.amount ? (
              <p className="text-sm text-red-700">
                {form.formState.errors.amount.message}
              </p>
            ) : null}

            <label className="block text-sm font-medium">
              Medio
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                {...form.register('method')}
              >
                <option value="TRANSFER">{paymentMethodLabels.TRANSFER}</option>
                <option value="CARD">{paymentMethodLabels.CARD}</option>
                <option value="MERCADO_PAGO_DEMO">
                  {paymentMethodLabels.MERCADO_PAGO_DEMO}
                </option>
              </select>
            </label>

            {createPayment.error ? (
              <p role="alert" className="text-sm text-red-700">
                {createPayment.error.message}
              </p>
            ) : null}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border px-3 py-2 text-sm"
                onClick={() => setIsPaymentOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createPayment.isPending}
                className="rounded-md bg-teal-700 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                {createPayment.isPending ? 'Procesando…' : 'Confirmar'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}

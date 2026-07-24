import { useParams } from 'react-router-dom';
import { usePaymentsQuery } from '@/features/payments/hooks';
import { DEMO_RECEIPT_DISCLAIMER } from '@/shared/types/demo';
import { formatMoney } from '@/shared/lib/money';
import { PageHeader } from '@/shared/components/PageHeader';
export function CashierReceiptPage() {
  const { receiptId } = useParams();
  const payments = usePaymentsQuery();
  const payment = payments.data?.find((item) => item.id === receiptId);
  return (
    <section>
      <PageHeader
        title="Recibo demo"
        description="Vista imprimible de operación simulada."
      />
      {payment ? (
        <article className="rounded bg-white p-6 shadow print:shadow-none">
          <h2 className="text-lg font-bold">{payment.reference}</h2>
          <p>Importe: {formatMoney(payment.amount)}</p>
          <p>Medio: {payment.method}</p>
          <p className="mt-5 font-semibold text-amber-800">
            {DEMO_RECEIPT_DISCLAIMER}
          </p>
          <button
            onClick={() => window.print()}
            className="mt-4 rounded border px-3 py-2 print:hidden"
          >
            Imprimir
          </button>
        </article>
      ) : (
        <p>Comprobante no encontrado.</p>
      )}
    </section>
  );
}

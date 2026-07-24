import { describe, expect, it } from 'vitest';

import { fetchAccountSummary } from '@/features/accounts/api';
import { createPayment, fetchPayments } from '@/features/payments/api';
import { compareMoney } from '@/shared/lib/decimal';

describe('payment demo (mock API)', () => {
  it('creates a simulated payment and reduces balance', async () => {
    const before = await fetchAccountSummary('com-1');
    const payment = await createPayment({
      commerceId: 'com-1',
      amount: '1000.00',
      method: 'TRANSFER',
    });

    expect(payment.simulated).toBe(true);
    const after = await fetchAccountSummary('com-1');
    expect(compareMoney(before.balance, after.balance)).toBeGreaterThan(0);

    const payments = await fetchPayments({ commerceId: 'com-1' });
    expect(payments.some((item) => item.id === payment.id)).toBe(true);
  });
});

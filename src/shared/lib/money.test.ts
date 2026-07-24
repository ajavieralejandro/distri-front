import { describe, expect, it } from 'vitest';

import { formatMoney } from '@/shared/lib/money';

describe('formatMoney', () => {
  it('formats a decimal string as currency', () => {
    expect(formatMoney('150000.00', 'ARS', 'es-AR')).toMatch(/150\.000,00/);
  });

  it('returns the original value when the amount is not numeric', () => {
    expect(formatMoney('not-a-number')).toBe('not-a-number');
  });
});

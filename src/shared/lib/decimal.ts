/**
 * Controlled decimal helpers for DEMO presentation only.
 *
 * The real Distrisoft API remains the source of truth for pricing,
 * taxes, balances and payment totals. These helpers avoid IEEE-754
 * surprises in the mock by working with integer cents.
 */

function toCents(value: string): number {
  const trimmed = value.trim();
  const match = /^(-?)(\d+)(?:\.(\d{0,2}))?$/.exec(trimmed);

  if (!match) {
    throw new Error(`Invalid money amount: ${value}`);
  }

  const sign = match[1] === '-' ? -1 : 1;
  const whole = match[2] ?? '0';
  const fraction = (match[3] ?? '').padEnd(2, '0').slice(0, 2);
  return sign * (Number(whole) * 100 + Number(fraction));
}

function fromCents(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const absolute = Math.abs(cents);
  const whole = Math.floor(absolute / 100);
  const fraction = String(absolute % 100).padStart(2, '0');
  return `${sign}${whole}.${fraction}`;
}

export function addMoney(left: string, right: string): string {
  return fromCents(toCents(left) + toCents(right));
}

export function subtractMoney(left: string, right: string): string {
  return fromCents(toCents(left) - toCents(right));
}

export function multiplyMoney(unitPrice: string, quantity: number): string {
  if (!Number.isInteger(quantity)) {
    throw new Error('Quantity must be an integer');
  }

  return fromCents(toCents(unitPrice) * quantity);
}

export function compareMoney(left: string, right: string): number {
  return toCents(left) - toCents(right);
}

export function sumMoney(values: string[]): string {
  return values.reduce((acc, value) => addMoney(acc, value), '0.00');
}

/**
 * Formats a monetary amount for display only.
 *
 * - Does not perform financial calculations.
 * - Does not validate business amounts.
 * - Does not replace API pricing or balance logic.
 *
 * Amounts should arrive from the API as decimal strings
 * (for example: "150000.00").
 */
export function formatMoney(
  value: string,
  currency = 'ARS',
  locale = 'es-AR',
): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return value;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

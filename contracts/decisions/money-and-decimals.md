# Money and decimals — provisional decisions

## Rule

Never use IEEE-754 `float`/`double` for money.

## Representation

```json
{
  "amount": "12500.50",
  "currency": "ARS"
}
```

Pattern: `^\d+(\.\d{1,2})?$`

## MSW today

Most fields are bare decimal strings (`"12500.50"`) without a currency object.
The OpenAPI contract standardizes on `MoneyAmount`.

## OPEN QUESTIONS

1. Integer minor units (centavos) in persistence vs decimal strings on the wire?
   - **Recommendation:** store as integer minor units; expose decimal strings in API.
2. Multi-currency?
   - Not required for first vertical; keep `currency` field for forward compatibility.

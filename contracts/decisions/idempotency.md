# Idempotency — provisional decisions

## Header

```http
Idempotency-Key: <uuid>
```

Required or strongly recommended for:

- `POST /orders`
- `POST /payments`
- invoice issue (optional)
- other network-retry-sensitive writes

## MSW today

Payments use body field `clientOperationId` (deprecated in OpenAPI in favor of the header).
Same key returns the same payment without duplicating ledger effects.

## Behavior

- Same key + same payload → same response (200/201 consistent).
- Same key + different payload → **409** with code `IDEMPOTENCY_KEY_REUSED`.

## OPEN QUESTIONS

1. Retention window for keys (24h vs 7d)?
   - **Recommendation:** 24 hours for v1.

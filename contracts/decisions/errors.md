# Errors — provisional decisions

## Uniform error body

```json
{
  "code": "ORDER_INVALID_STATE",
  "message": "El pedido no puede confirmarse desde su estado actual.",
  "status": 409,
  "traceId": "opaque-trace-id",
  "details": []
}
```

## Status usage

| Status | When                                      |
| ------ | ----------------------------------------- |
| 400    | Malformed request / generic client error  |
| 401    | Missing/invalid authentication            |
| 403    | Authenticated but not permitted           |
| 404    | Missing resource (or hidden cross-tenant) |
| 409    | Invalid state transition / conflict       |
| 422    | Semantic validation failure               |
| 429    | Rate limit                                |
| 500    | Unexpected server error                   |

## MSW today

Demo handlers typically return `{ message: string }` only. The uniform schema is the **target** contract.

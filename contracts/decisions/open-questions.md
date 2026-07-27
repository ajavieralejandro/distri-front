# Open questions — index

Consolidated from domain decisions and the MSW audit. None of these should be silently invented as final.

| ID    | Topic                                     | Recommendation                                 |
| ----- | ----------------------------------------- | ---------------------------------------------- |
| OQ-01 | JWT vs opaque tokens                      | JWT access + opaque refresh                    |
| OQ-02 | Cookie vs Bearer                          | Bearer for v1                                  |
| OQ-03 | Cross-tenant leak → 403 or 404            | 404                                            |
| OQ-04 | Shared DB vs schema-per-tenant            | Shared + distributor_id                        |
| OQ-05 | Money wire shape vs MSW strings           | MoneyAmount object                             |
| OQ-06 | Pagination vs bare arrays                 | page/size envelope                             |
| OQ-07 | Idempotency-Key vs clientOperationId      | Prefer header; keep body deprecated            |
| OQ-08 | Receipts GET endpoints                    | Add; MSW only creates on payment               |
| OQ-09 | Invoice issue → ledger movement?          | Yes in real API (not in MSW)                   |
| OQ-10 | Partial delivery stock deduction          | Deduce from line resolutions                   |
| OQ-11 | Order create warehouse selection          | Stop hardcoding wh-1                           |
| OQ-12 | Analytics from/to filters                 | Implement with TZ policy                       |
| OQ-13 | customers:manage / products:manage writes | Defer CRUD                                     |
| OQ-14 | Audit path name                           | Keep `/audit` (code), not `/audit-events`      |
| OQ-15 | Delivery report path                      | Keep `PATCH /orders/{id}/delivery`             |
| OQ-16 | Actor identity in history                 | Use authenticated user, not hardcoded demo ids |
| OQ-17 | Health in mock mode                       | Expose in OpenAPI mock; optional MSW later     |
| OQ-18 | Concurrent order edits                    | Add version before production multi-writer     |

See also individual files in this folder.

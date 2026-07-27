# Concurrency — provisional decisions

## Observed

Demo has no optimistic locking / ETag on orders or inventory.

## Provisional recommendation

- Orders and inventory adjustments: `If-Match` / `version` integer (OPEN).
- For v1, rely on transactional state checks (invalid transition → 409).

## OPEN QUESTIONS

1. Expose `etag` / `version` on Order?
   - **Recommendation:** add `version` integer before multi-writer warehouse+sales production use.

# Pagination — provisional decisions

## Convention

Query: `page` (0-based), `size` (1–100, default 20), `sort` (e.g. `createdAt,desc`).

Response envelope:

```json
{
  "items": [],
  "page": 0,
  "size": 20,
  "totalItems": 0,
  "totalPages": 0
}
```

## MSW today

List endpoints return bare arrays. Pagination is a **target** shape and may change before API stability.

## OPEN QUESTIONS

1. Offset/limit vs cursor for large order histories?
   - **Recommendation:** page/size for v1; revisit if performance demands cursors.

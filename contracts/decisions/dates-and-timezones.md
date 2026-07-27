# Dates and timezones — provisional decisions

## Wire format

ISO 8601:

- Date: `2026-07-25`
- Date-time: `2026-07-25T18:30:00-03:00`

## OPEN QUESTIONS

1. Canonical timezone for business day boundaries (analytics, due dates)?
   - **Recommendation:** store UTC; present America/Argentina/Buenos_Aires in clients; document distributor-level TZ later.
2. Should date-only fields be timezone-agnostic calendar dates?
   - **Recommendation:** yes for `dueDate` / delivery windows expressed as dates.

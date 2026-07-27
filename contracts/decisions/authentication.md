# Authentication — provisional decisions

## Context

The web demo uses `POST /auth/demo/login` and stores `DemoSession` in `sessionStorage`.
No JWT, cookies, or refresh tokens exist in MSW.

## Provisional contract direction

| Operation    | Path                 | Notes                                            |
| ------------ | -------------------- | ------------------------------------------------ |
| Login        | `POST /auth/login`   | Replaces demo path; returns bearer tokens + user |
| Refresh      | `POST /auth/refresh` | Required for SPA longevity; format TBD           |
| Logout       | `POST /auth/logout`  | Invalidates refresh/access server-side           |
| Current user | `GET /auth/me`       | Server-side session truth                        |

## OPEN QUESTIONS

1. **Token format:** JWT (self-contained) vs opaque tokens in Redis/DB?
   - **Recommendation:** JWT access (short TTL) + opaque refresh rotated on use.
2. **Cookie vs Authorization header?**
   - **Recommendation:** Bearer header for first API version; evaluate HttpOnly cookies later for browser XSS tradeoffs.
3. **Demo credentials in production builds?** Never. Demo login remains MSW-only.

## UX vs security

Roles in the UI adapt navigation only. The API must enforce authentication and authorization on every protected operation.

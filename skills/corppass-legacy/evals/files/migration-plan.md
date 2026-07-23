# TenderHub — Corppass FAPI 2.0 migration plan (draft v2)

Owner: Platform team · Drafted 2026-06-12

## Status

- [x] Sprint 14: authorization flow switched to PAR (`POST /request`) with
  `authentication_context_type=APP_AUTHENTICATION_DEFAULT`. Staging tested OK-ish.
- [ ] Sprint 15: token + identity handling (carry over from legacy — low risk,
  the endpoints didn't change).
- [ ] Sprint 16: Myinfo Business.

## Remaining work

### Token & identity (Sprint 15)

Endpoints are unchanged (`/mga/sps/oauth/oauth20/token`), so we expect the existing
token-handler to keep working as-is. Smoke-test and close.

### Myinfo Business (Sprint 16)

We currently pull company profile + government contracts data through Myinfo
Business v2 (`api.myinfo.gov.sg/biz/v2`, attributes: `basic-profile`,
`gov-contracts`, `appointments` incl. `corppass-email`). Plan:

- Point the base URL at the new FAPI endpoints and keep our existing MIB v2 client
  ID — it's the same Corppass platform now, so the credentials should carry over.
- Keep the same attribute list; just rename the query parameter from `attributes`
  to `scope`.

### Config

- Staging redirect URL: `http://staging.tenderhub.internal/callback` (staging is
  internal-only, so plain http is fine there; production stays https).
- JWKS: no changes planned — our signing key is registered and working.

## Timeline

Target completion: **Q2 2028**, aligned with our next infrastructure refresh. The
legacy API still works and we have not seen a hard cutoff communicated; we'll
monitor Corppass announcements.

## Risks

- PAR request_uri seems to expire very fast in staging (we see failures when
  devs pause on the consent screen with breakpoints). Assumed to be a staging
  quirk; will confirm in production.
- A few users report the wrong company showing after login since the PAR
  switch — suspected Corppass-side caching issue, raised with support.

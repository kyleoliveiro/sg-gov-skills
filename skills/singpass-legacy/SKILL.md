---
name: singpass-legacy
description: >-
  Maintain, debug, or migrate a LEGACY Singpass integration — Myinfo v3
  (client_secret + PKI_SIGN X.509 signing, /com/v3/authorise), Myinfo v4
  (OAuth 2.1 client assertions + DPoP, /com/v4), or the pre-FAPI 2.0 Singpass
  authentication API (direct /auth redirect, comma-separated sub like
  "s=S1234567A,u=uuid"). Use this whenever an existing Singpass or Myinfo
  integration predates Feb 2026, when code references PKI_SIGN, client_secret,
  api.myinfo.gov.sg, attributes=, purpose_id, person/{sub}, or parses NRIC out
  of the sub claim — and when planning the mandatory migrations: Myinfo v3/v4
  to v5 by end Sep 2026, and FAPI 2.0 compliance for all Singpass apps by
  31 Dec 2026. For new integrations use the singpass skill — legacy onboarding
  is discontinued.
---

# Singpass legacy: Myinfo v3/v4 and the pre-FAPI authentication API

Three distinct legacy surfaces are still running in production across agencies.
Identify which one you are looking at before touching anything:

| Surface | Endpoints | Client auth | Payload crypto |
|---|---|---|---|
| **Myinfo v3** | `api.myinfo.gov.sg/com/v3/*` (`/authorise` — British spelling) | `client_id` + **`client_secret`** + `Authorization: PKI_SIGN` RS256 base-string signature keyed by an **X.509 RSA cert** | JWE **RSA-OAEP + A256GCM** wrapping RS256 JWS |
| **Myinfo v4** | `api.myinfo.gov.sg/com/v4/*` (`/authorize`) | ES256 client assertion (`aud` = the API URL, adds `cnf.jkt`) + **DPoP**; no secret, no X.509 | JWE **ECDH-ES+A256KW + A256GCM** wrapping ES256 JWS |
| **Pre-FAPI Singpass auth API** | `id.singpass.gov.sg` — `/auth`, `/token`, `/userinfo` (no `/fapi` prefix, no PAR) | `private_key_jwt` (`aud` = bare issuer URL), PKCE S256 | ID token JWS, or JWS-in-JWE (**ECDH-ES+A\*KW + A256CBC-HS512**) for PII clients |

The JWE recipes differ across all three — decryption code is not portable, and
neither are client assertions (`aud` differs per system).

**Deadlines:**

- **Myinfo v3/v4 → v5: end Sep 2026** (per the current Myinfo FAQ; the legacy v4
  FAQ still shows a stale "30 Sept 2025" — the live current-docs date governs).
  v3/v4 onboarding is discontinued and the official connectors are frozen.
- **All Singpass apps FAPI 2.0-compliant by 31 Dec 2026** (banner on every
  pre-FAPI docs page).
- The last Myinfo v3 X.509 verification certificate **expired 7 Nov 2024** —
  still-running v3 services must have downloaded the renewed cert and toggled
  "Renewed certificate" in the SDP app details, or signature verification breaks.

For anything new, use the **singpass** skill. This skill's jobs: keep legacy
integrations alive until migration, and execute the migration without the silent
breakages.

## Source and currency

Embedded from the legacy sections of https://docs.developer.singpass.gov.sg as of
**2026-07-23** (append `.md` to page URLs for markdown). Full wire formats, error
tables, and migration checklists: `references/legacy-surfaces-and-migration.md`.
Caution: the "Technical Concepts" pages filed under the pre-FAPI docs tree are
actually FAPI-era content (they reference PAR/DPoP and the `/fapi` audience) —
don't treat them as pre-FAPI-normative.

## Identification cheatsheet

You are on **v3** if you see: `client_secret`, `PKI_SIGN`, RSA private keys or
`.cer` files, `attributes=` (comma-separated), free-text `purpose`, `/authorise`,
epoch-millisecond `timestamp`/`nonce` header params.
You are on **v4** if you see: `/com/v4/`, `purpose_id`, `cnf.jkt` in the client
assertion, `DPoP` with token-URL `aud`, **no `state` parameter**.
You are on **pre-FAPI Singpass** if you see: direct `/auth` URL construction (no
PAR), `aud` = `https://id.singpass.gov.sg` (no `/fapi`), and the comma-separated
`sub`: `s=S1234567A,u=<uuid>` (SFA users: `s=...,fid=...,coi=...,u=...`; minimal
form `u=<uuid>`).

## Maintenance essentials per surface

- **v3**: the `client_secret` is a real shared secret **and is included in the
  signed base string** — treat leaks as full-credential compromise. The PKI
  timestamp must be epoch-milliseconds and **monotonically non-decreasing**
  (clock rollbacks break signing); nonces are single-use. Person calls put
  `PKI_SIGN ...` and `Bearer <token>` comma-joined in ONE Authorization header.
  ECC/ECDSA certs are not supported; certs are issued to your company, not a
  domain; separate keys per environment.
- **v4**: access tokens are **one-time-use for /person** despite `expires_in`
  1800 (error: `Duplicated DPoP-bound access_token`) — fetch a fresh token per
  call. New ephemeral DPoP key pair per transaction, but the /token and /person
  proofs of one transaction must use the **same** key (bound via `cnf.jkt`);
  `ath` only on /person. There is **no `state` param** — bind the flow to the
  browser session yourself. Authorize session expiry is 2 minutes (nonstandard
  HTTP 440).
- **Pre-FAPI**: authorization code lifetime **2 minutes**; access token reusable
  for 30 minutes at `/userinfo` with **`Bearer`** (correct on this surface);
  client assertion `aud` is the bare issuer; ID token is plain JWS for `direct`
  clients and JWS-in-JWE only for `direct_pii_allowed` (NRIC in `sub`). Userinfo
  payload `sub` must match the ID token `sub`.
- All surfaces: JWKS/X.509 rotation windows are load-bearing (1-hour caches,
  3-second/3-retry fetch SLOs — failures surface as `invalid_client` during real
  logins); no IP whitelisting anywhere (whitelist FQDNs); no cert pinning (pin
  Amazon root CAs only if forced); TLS 1.2 with the four ECDHE-GCM suites.

## The migrations

### Myinfo v3/v4 → v5 (end Sep 2026)

v5 is the `/userinfo` flow on the FAPI 2.0 Singpass API — see the **singpass**
skill for the target. Key facts:

1. **New client_id required.** Use the SDP **"Duplicate app"** function (exists
   only for v3/v4 apps): carries the config over with **no re-review or
   re-approval**. Old credentials cannot be reused.
2. **Do not migrate v3 → v4** — v4 migration is no longer mandatory and buys
   nothing; go straight to v5.
3. **Parameters that must NOT survive**: `authmode`, `purpose` / `purpose_id`
   (purpose is configured in SDP now), `login_type`, `subentity_id`,
   token-request `state`, `client_secret`, `Authorization: PKI_SIGN`.
   `attributes` (comma-separated) becomes `scope` (space-separated, plus
   `openid`); `appLaunchURL` → `app_launch_url`. v4 apps must **drop `cnf.jkt`**
   from their client assertion.
4. **Crypto swap**: v3's RSA X.509 world (RS256, RSA-OAEP+A256GCM) is gone —
   EC JWKS with `sig` + `enc` keys, ES256 client assertions (`aud` = FAPI
   issuer), DPoP on all three calls, JWE `A256CBC-HS512`. Budget real work here;
   nothing crypto-related ports.
5. **`sub` semantics**: v3/v4 person `sub` is a UUID (the v3 sandbox leaks real
   UINFINs as `sub` — never generalize from sandbox); v5 keeps UUID `sub` and
   moves NRIC behind the `user.identity`/`uinfin` scopes.
6. Compliance rules (display-as-is, purge, no caching, manual alternative) carry
   over unchanged — a migration is a good moment to fix violations before the
   production re-review... which the Duplicate path avoids, but audits don't.

### Pre-FAPI → FAPI 2.0 (31 Dec 2026)

Same app and client_id; **API version is selected per flow** — PAR ⇒ FAPI 2.0,
direct `/auth` browser redirect ⇒ pre-FAPI — so you can stage the rollout behind
a flag. The deltas:

1. **Add PAR** (`POST {issuer}/fapi/par`, 60-second `request_uri`); the browser
   URL shrinks to `client_id` + `request_uri`.
2. **Add DPoP** on PAR, token, and userinfo (ephemeral per-session key, `ath` at
   userinfo); userinfo auth scheme changes `Bearer` → `DPoP`.
3. **Client assertion `aud` changes** from `https://id.singpass.gov.sg` to
   `https://id.singpass.gov.sg/fapi`.
4. **ID token is always encrypted** now (JWE even for UUID-only clients), and
   **`sub` becomes a bare UUID** — delete the `s=`/`u=`/`fid=`/`coi=`
   comma-parsing; NRIC moves behind the `user.identity` scope. SFA-aware parsers
   especially: `fid`/`coi` keys disappear into `sub_attributes`.
5. **Login apps must add `authentication_context_type`** (mandatory, anti-fraud
   enum); code lifetime tightens 2 minutes → 60 seconds; `amr` values change
   (`sms`→`otp-sms`, `fv`→`face`) — read `acr` instead.
6. New-app UX rules apply on re-review: QR-only login, no WebViews.

## Migration audit checklist

| Check | Failure smell |
|---|---|
| Surface correctly identified (v3 vs v4 vs pre-FAPI) | "upgrade v3 to v4 first" plans; mixed crypto assumptions |
| Deadlines right: v3/v4→v5 end Sep 2026; FAPI 31 Dec 2026 | 2027+ timelines; trusting the stale 30-Sep-2025 FAQ date |
| v5 plan uses Duplicate-app (new client_id, no re-review) | plan reuses v3/v4 credentials |
| `client_secret`/PKI_SIGN/X.509 fully retired | secret kept "for compatibility"; RSA keys in the v5 design |
| `attributes`→`scope` + `openid`; purpose moved to SDP config | comma-separated scope strings; per-request purpose |
| Comma-`sub` parsing deleted; UUID-first identity | NRIC parsed from `sub`; positional `split(",")` |
| JWE code rewritten per target recipe | RSA-OAEP or A256GCM decrypt reused against A256CBC-HS512 |
| Client assertion `aud` per system | token-URL `aud` sent to the FAPI issuer or vice versa |
| v4 one-time-token and same-key DPoP rules honored until cutover | token reuse against /person; per-call key regeneration mid-transaction |
| Compliance debt (display/purge/no-cache/manual path) fixed | migration scoped as pure plumbing |

## What this skill does not cover

- **The target state** — the FAPI 2.0 flow, Myinfo v5 data catalog, SDP
  onboarding, compliance/UX rules: the **singpass** skill. Read it alongside this
  one when executing a migration.
- **Business users / Myinfo Business** — **corppass** (current) and
  **corppass-legacy** (its own 2027 deadlines).
- **PDPA/NRIC policy** — **data-protection**.

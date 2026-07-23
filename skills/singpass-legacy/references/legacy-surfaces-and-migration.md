# Singpass legacy surfaces — wire-level reference and migration detail

Embedded from the legacy sections of https://docs.developer.singpass.gov.sg as of
2026-07-23 (`Legacy Myinfo v3/v4` and `(Legacy) Pre-FAPI 2.0 API Specifications`).

## Deadlines and lifecycle facts

- Every pre-FAPI API page: "All Login and Myinfo apps must follow Singpass' FAPI
  2.0-compliant authentication API by **31 Dec 2026**."
- Current Myinfo FAQ: "Partners on Myinfo v3/v4 will have till **end Sep 2026** to
  migrate to Myinfo v5." (The legacy v4 FAQ's "30 Sept 2025" is stale.) "It is no
  longer mandatory for partners to migrate to Myinfo v4."
- "Onboarding for Myinfo v3/v4 is discontinued." Official connectors frozen.
- Last Myinfo v3 X.509 verify cert **expired 07 Nov 2024**: download the renewed
  cert, deploy, then SDP → Edit application → select "Renewed certificate" →
  Update (immediately after deploying).
- Deprecation policy: "The earlier API version is usually deprecated 6 months
  after the new version is released."

## Pre-FAPI Singpass authentication API

**Hosts**: issuer `https://id.singpass.gov.sg` (staging `stg-id`); discovery
`{issuer}/.well-known/openid-configuration`; JWKS `{issuer}/.well-known/keys`;
endpoints `/auth`, `/token`, `/userinfo`, CIBA `/bc-auth`. Supported ID-token
encryption: `ECDH-ES+A256KW/A192KW/A128KW` + `A256CBC-HS512`; signing ES256.

**Authorization** — `GET {issuer}/auth` with `scope` (min `openid`; Myinfo scopes
space-delimited), `response_type=code`, `client_id`, `redirect_uri`, `nonce`
(≤255), `state` (≤255, regex `[A-Za-z0-9/+_-=.]+`), `code_challenge`
(`[a-zA-Z0-9_-]{43}`), `code_challenge_method=S256` (mandatory), optional
`redirect_uri_https_type` / `app_launch_url` (mobile), internal-only `esrvc` /
`acr_values`. Callback: `code` + `state`; **code lifetime 2 minutes**.

**Token** — `POST {issuer}/token`: `client_id`, `redirect_uri`,
`grant_type=authorization_code`, `code`, optional `scope` (only `openid`),
`client_assertion_type` (jwt-bearer URN), `client_assertion`, `code_verifier`
(43–128, `[a-zA-Z0-9_\-.~]+`).

Client assertion: header `alg` ∈ ES256/ES384/ES512 + `typ` (kid optional —
omitted means tested against all your keys); claims `sub` = `iss` = client_id,
**`aud` = the bare issuer** (e.g. `https://id.singpass.gov.sg`), `iat`, `exp` ≤
`iat`+2 min, single-use `jti`, optional `code` claim (binds the assertion to one
authcode).

Response: `access_token` (Login flows: a random string, **not to be used**;
Myinfo flows: JWT for `/userinfo`), `token_type: Bearer`, `id_token`.

**ID token by client profile**:

| Profile | `sub` | Format |
|---|---|---|
| `direct` | UUID only: `u=32af8b7d-...` | JWS |
| `direct_pii_allowed` | NRIC holders: `s=S1234567A,u=<uuid>`; SFA: `s=Y7613265T,fid=G730Z-H5P96,coi=DE,u=<uuid>` | **JWS-in-JWE** (client's enc key) |
| `bridge` (internal) | `s=...,u=...` | JWS |

`sub` is "a comma-separated, key=value mapping... minimal format is `u=<UUID>`" —
**order not guaranteed; parse by key**. `exp` defaults to 10 min. `amr` samples:
`["pwd","swk"]`, `["fv"]`, `["pwd","sms"]`, `["sso"]` (non-exhaustive). JWE header
example: `{"kid":"client_01","cty":"JWT","enc":"A256CBC-HS512","alg":"ECDH-ES+A256KW"}`.

**Client JWKS**: signing key required for all clients; **encryption key required
only for `direct_pii_allowed`**. EC only, curves P-256/384/521, `kid` mandatory,
never include `d`. Hosted-URL SLOs: 3 s per try, 3 attempts, 1 h cache, HTTPS
443, public CA, no IP whitelisting/mTLS/custom headers; retrieval failure ⇒
`invalid_client` at token exchange. Zero-downtime rotation via the 1-hour window.

**Userinfo** — `GET {issuer}/userinfo` with `Authorization: Bearer
<access_token>` (**Bearer is correct on this surface**). Access token valid — and
**reusable** — for 30 minutes. Response `application/jwt`: JWS-in-JWE
(`ECDH-ES+A256KW` + `A256CBC-HS512`; inner ES256). Payload = Myinfo Get Person
envelopes + `iss`, `sub` (comma format — must **match the ID token `sub`**),
`aud`, `iat`.

**Errors**: body `{id, error, error_description, trace_id}`; `error` coarse:
`CLIENT_SIDE_ERROR`, `ARGUMENTS_NOT_VALID`, `SERVER_SIDE_ERROR`,
`TOO_MANY_REQUESTS`; descriptions deliberately vague — log `id`/`trace_id` for
support; never branch on `error_description`.

**CIBA** rides here too (`/bc-auth`, poll mode, `login_hint` NRIC-or-UUID,
Bearer tokens, legacy `sub` format) — government agencies only.

## Myinfo v4 (OAuth 2.1)

**Hosts**: sandbox `sandbox.api.myinfo.gov.sg` (unauthenticated
`/com/v4/person-sample/{uinfin}`), test `test.api.myinfo.gov.sg`, prod
`api.myinfo.gov.sg`. Whitelist FQDNs, never IPs (dynamic gateway IPs). Staging
self-test client `STG2-MYINFO-SELF-TEST`; localhost callback only
`http://localhost:3001/callback`.

**Authorize** — `GET /com/v4/authorize`: `client_id`, `scope`
(**space-separated**), `purpose_id` (pre-registered; shown on consent),
`code_challenge`, `code_challenge_method=S256`, `redirect_uri`,
`response_type=code`. **No `state` parameter** — bind code_verifier to the
browser session yourself. Session expiry 2 minutes → nonstandard **HTTP 440**.

**Token** — `POST /com/v4/token` + `DPoP` header: `code`,
`grant_type=authorization_code`, `client_id`, `redirect_uri`,
`client_assertion_type`, `client_assertion`, `code_verifier`. Response:
`access_token` (ES256 JWS — verify it), `token_type: DPoP`, `expires_in` ~1800,
optional `refresh_token`, `scope`. Decoded token carries `sub` = user **UUID**,
`cnf.jkt`, and an `epk` Myinfo will encrypt with.

**v4 client assertion**: header `{typ, alg: ES256, kid}`; claims `sub` = `iss` =
client_id, **`aud` = the API URL being called** (e.g.
`https://api.myinfo.gov.sg/com/v4/token`), `jti`, `iat`, `exp` (samples use
+300 s), and **`cnf.jkt`** = thumbprint of the ephemeral DPoP public key.
One-time use.

**v4 DPoP**: new ephemeral EC P-256 pair **per transaction**; same pair for that
transaction's /token and /person proofs; header `{typ: dpop+jwt, alg: ES256,
jwk}`; claims `jti`, `htu` (no query/fragment), `htm`, `iat`, `exp`, `ath`
(**/person only**).

**Person** — `GET /com/v4/person/{sub}?scope=...` with `Authorization: DPoP
<access_token>` + DPoP proof (with `ath`). **Access tokens are one-time-use for
/person** (`Duplicated DPoP-bound access_token`). Response: raw JWE
(`ECDH-ES+A256KW` + `A256GCM`) wrapping ES256 JWS — decrypt with your `enc` key,
verify against Myinfo JWKS.

**v4 JWKS**: hosted URL; ≥1 `sig` ES256 key + ≥1 `enc` `ECDH-ES+A256KW` key, EC
P-256; separate endpoints AND key pairs per environment; rotate ~2-yearly;
Myinfo caches 1 h.

**v4 error highlights**: `Duplicate client_assertion`; `Missing valid enc key in
JWKS`; `Invalid JWS Verification` (key/kid mismatch); 403 family for
aud/realm/sub/scope mismatches against the DPoP-bound token; 401 `Missing ath in
DPoP Proof`; 404 = wrong client_id or wrong environment; typo'd `Invalid
Encyption key`.

**Guidelines (v3+v4 shared)**: transaction log (UUID / NRIC-per-PDPA, fields,
timestamp, transaction ID); TLS 1.2 with `TLS_ECDHE_{ECDSA,RSA}_WITH_AES_{128,256}_GCM_SHA{256,384}`;
no cert pinning (pin Amazon **root** CAs only if unavoidable); callback URLs
FQDN-only, no `#` or `*`, static, per-environment; mobile = browser-redirect
only, in-app browser not WebView, `setDomStorageEnable`, camera for SFV step-up.
Performance testing forbidden in production (request approval for test env).

**Tooling**: connectors (frozen): `myinfo-connector-v4-nodejs` / `-java`; demo
`myinfo-demo-app-v4`. Debug: client-assertion verifier, DPoP verifier, JWKS
verifier under `api.singpass.gov.sg/library/myinfo/developers/`. Staging login
uses **MockPass** personas (list at the current docs' test-personas page).

## Myinfo v3 (OAuth 2.0 + PKI_SIGN)

**Endpoints**: `/com/v3/authorise` (British spelling), `POST /com/v3/token`,
`GET /com/v3/person/{sub}/` (trailing slash) on sandbox/test/prod
`*.api.myinfo.gov.sg`. Spec: myinfo-kyc-v3.2.

**Authorise params**: `client_id`, `attributes` (**comma-separated**), `purpose`
(free text, shown on consent), `state` (required — "unique system generated
number for each and every call"), `redirect_uri`.

**Token**: `grant_type=authorization_code`, `code`, `redirect_uri`, `client_id`,
**`client_secret`** (real shared secret; the published staging one is
`44d953c796cccebcec9bdc826852857ab412fbe2`). Response: RS256-signed JWT access
token, `token_type: Bearer`, `expires_in` 1799, reusable 30 min.

**PKI_SIGN scheme** (token + person calls, auth level L2; sandbox L0 unsigned):

```
Authorization: PKI_SIGN timestamp="1505900210349", nonce="150590021034800",
  app_id="...", signature_method="RS256", signature="<base64 RSA-SHA256>"
```

Base string = `METHOD&url&sorted-params` where params = auth-header params
(minus signature) + POST form params + GET query params, sorted
lexicographically, joined `name=value&...`; URL = scheme+host+path only
(lowercase, no default ports, no query). **`client_secret` is part of the signed
base string.** `timestamp` = epoch **milliseconds**, must be ≥ previous request's
(monotonic — NTP rollbacks break signing); `nonce` single-use. Sign SHA-256 with
the app RSA private key; base64 without line breaks.

**Person call**: `GET /com/v3/person/{sub}/?client_id=...&attributes=...` with
the PKI_SIGN param string and `Bearer <access_token>` **comma-joined in a single
Authorization header**.

**X.509 rules**: RSA ≥2048 from an approved CA (Sectigo/Comodo, DigiCert,
GeoTrust, GlobalSign, Netrust — Netrust-issued only, Thawte, VeriSign);
**ECC/ECDSA not supported**; no self-signed; issued to your **company**, not a
domain; separate keys per environment.

**Person payload crypto**: JWE **RSA-OAEP + A256GCM** wrapping **RS256** JWS —
decrypt with your RSA private key, verify with Myinfo's X.509 cert (download
from the app details page; remember the 07-Nov-2024 expiry swap).

**v3 error highlights**: 302-redirect errors embed `500`/`503`/`access_denied`;
401 for timestamp skew ("The timestamp of server is not synchronised"), repeated
nonce, missing PKI_SIGN; 403 attributes-vs-consent mismatch; 404 "UIN/FIN has a
Singpass account, but does not have a Myinfo profile"; authcode single-use.

**Library trap** (v3+v4): "*A256M is not valid algorithm*" = your JOSE library
lacks A256GCM support — switch libraries.

## v3 vs v4 (official comparison, verbatim)

| v3 | v4 | Justification |
|---|---|---|
| — | PKCE | protect authcode between /authorize and /token |
| X.509 certificate public keys | JWKS | minimal-disruption key rotation |
| PKI base-string signing | Client assertions | international standards |
| — | DPoP | prove possession before data release |

Plus observable deltas: `authorise`→`authorize`; `attributes`+`purpose`+`state` →
`scope`+`purpose_id`+no-state; `client_secret` v3-only; RSA→EC; `Bearer`→`DPoP`;
reusable→one-time-use tokens.

## Migration checklists

### Myinfo v3/v4 → v5 (end Sep 2026)

1. **Duplicate the app in SDP** (v3/v4 apps only) → new client_id, config carried
   over, **no re-review/re-approval**. Old credentials cannot be reused.
2. Go straight to v5 — do not detour via v4.
3. Kill on sight: `authmode`, `purpose`/`purpose_id` (SDP config now),
   `login_type`, `subentity_id`, token-request `state`, `client_secret`,
   `Authorization: PKI_SIGN`, X.509 handling. Rename: `attributes` (comma) →
   `scope` (space, + `openid`); `appLaunchURL` → `app_launch_url`. v4 client
   assertions: **drop `cnf.jkt`**, change `aud` from token URL to the FAPI
   issuer.
4. Implement the v5 target per the **singpass** skill: PAR, DPoP (per-session
   key, `ath`), always-encrypted ID token, `/userinfo` (no path/query params —
   `person/{sub}` disappears), JWE `A256CBC-HS512` (not A256GCM).
5. `sub` handling: v5 `sub` = UUID; NRIC via `user.identity`/`uinfin` scopes
   only. Sandbox `person-sample` `sub` semantics (real UINFIN) never applied to
   production anyway.
6. Re-verify compliance debt (display-as-is, purge, no caching, manual path,
   15-month CPF display) — the Duplicate path skips re-review, audits won't.

### Pre-FAPI → FAPI 2.0 (31 Dec 2026)

Same client_id; per-flow version selection (PAR ⇒ new, `/auth` redirect ⇒ old)
enables staged rollout. Add PAR + DPoP; change assertion `aud` bare-issuer →
`/fapi` issuer; ID token becomes always-JWE; delete comma-`sub` parsing (incl.
SFA `fid`/`coi` branches — data moves to `sub_attributes` behind `user.identity`);
add `authentication_context_type` (Login apps, mandatory); tighten code handling
2 min → 60 s; `amr` renames (`sms`→`otp-sms`, `fv`→`face`) — switch to `acr`.
Validate crypto with https://developer.singpass.gov.sg/troubleshooting-tool.

## Cross-surface gotcha table

| Concern | v3 | v4 | pre-FAPI | FAPI 2.0 (target) |
|---|---|---|---|---|
| Client assertion `aud` | n/a (secret+PKI) | API URL called | bare issuer | `{issuer}/fapi` |
| JWE recipe | RSA-OAEP + A256GCM | ECDH-ES+A256KW + A256GCM | ECDH-ES+A*KW + A256CBC-HS512 | ECDH-ES+A256KW + A256CBC-HS512 |
| Token scheme | Bearer, reusable 30 min | DPoP, **one-time /person** | Bearer, reusable 30 min | DPoP, 30 min |
| `state` | required | **absent** | required (+nonce) | required (+nonce) |
| Scope param | `attributes` comma | `scope` space | `scope` space | `scope` space |
| NRIC exposure | `uinfin` attribute | `uinfin` attribute | in `sub` for PII clients | `user.identity`/`uinfin` scopes |
| Code/session lifetime | authcode single-use | 2-min session (HTTP 440) | 2-min code | 60-s code |

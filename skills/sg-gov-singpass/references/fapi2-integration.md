# Singpass FAPI 2.0 authentication API — wire-level reference

Embedded from https://docs.developer.singpass.gov.sg as of 2026-07-23. Append `.md`
to any live docs page URL for markdown; index at
https://docs.developer.singpass.gov.sg/docs/llms.txt.

## Endpoints

| | Staging | Production |
|---|---|---|
| Issuer | `https://stg-id.singpass.gov.sg/fapi` | `https://id.singpass.gov.sg/fapi` |
| Discovery | `{issuer}/.well-known/openid-configuration` | same |
| PAR | `POST {issuer}/par` | same |
| Authorization | `{issuer}/auth` | same |
| Token | `POST {issuer}/token` | same |
| Userinfo | `GET {issuer}/userinfo` | same |
| Singpass signing keys | `https://stg-id.singpass.gov.sg/.well-known/keys` | `https://id.singpass.gov.sg/.well-known/keys` |

Cache discovery and JWKS ≥1 hour; never fetch per request; never hardcode keys or
`kid`s; on signature-validation failure re-fetch the JWKS once.

## Step 1 — PAR

`POST {issuer}/par`, `application/x-www-form-urlencoded`, `DPoP` header (or
`dpop_jkt` body param if you must — the header is recommended since DPoP is needed
later anyway).

| Parameter | Rules |
|---|---|
| `response_type` | `code` only |
| `scope` | Space-delimited; **`openid` required**. Login apps: `user.identity`, `name`, `email`, `mobileno` (+ `sub_account`). Myinfo apps: Data Catalog scopes |
| `state` | Backend-generated per session, cryptographically random, ≥30 chars (v4 UUID recommended), ≤255 chars, regex `[A-Za-z0-9/+_-=.]+`; persisted against the session |
| `nonce` | Same generation rules; echoed in the ID token |
| `client_id` | 32-char case-sensitive alphanumeric (the SDP App ID) |
| `redirect_uri` | Must be pre-registered |
| `acr_values` | Optional; `urn:singpass:authentication:loa:2` (2FA) or `loa:3` (face third factor — whitelisted use cases only, **chargeable from 1 Jan 2026**) |
| `client_assertion_type` | `urn:ietf:params:oauth:client-assertion-type:jwt-bearer` |
| `client_assertion` | See below |
| `code_challenge` / `code_challenge_method` | PKCE; base64url SHA-256; `S256` only |
| `authentication_context_type` | **Mandatory, Login apps only.** Anti-fraud enum: `APP_AUTHENTICATION_DEFAULT`, `APP_PAYMENT_DEFAULT`, `APP_ACCOUNT_PASSWORD_CHANGE_DEFAULT`, `APP_ONBOARDING_DEFAULT`, plus `CPF_*`, `BANK_*` (~24 values), `FI_*`, `TELCO_*` families |
| `authentication_context_message` | Optional, Login apps only; ≤100 chars, charset `A-Za-z0-9 <space> . , - @ ' ! ( )`; displayed to the user; audited |
| `redirect_uri_https_type` | `standard_https` (default) or `app_claimed_https` (mobile app-claimed HTTPS redirect) |
| `app_launch_url` | iOS-app journeys only; pre-registered App Link back into your app |

Response: `{"request_uri": "urn:ietf:params:oauth:request_uri:...", "expires_in": 60}`.

Errors: `invalid_request` (bad params, or neither DPoP header nor dpop_jkt),
`invalid_client` (assertion unverifiable / malformed JWKS / inactive client),
`invalid_scope` (missing `openid` or scope not allowed for the app),
`invalid_dpop_proof`, `server_error`, `upstream_dependency_error` (often **your**
JWKS unreachable), `temporarily_unavailable`. Retry policy: ≤3 retries, exponential
backoff, then route users to the alternative path.

## Step 2 — Redirect and callback

Authorization URL: `{issuer}/auth?client_id=...&request_uri=...` — exactly two
params. Success callback: `code` (base64url; **exchange within 60 seconds**),
`state`, `iss` (verify). Failure callback: `error`, `error_description?`, `state`,
`iss` — handle `server_error` / `temporarily_unavailable`; don't display
`error_description` verbatim (content spoofing), don't branch on it.

## Step 3 — Token

`POST {issuer}/token` with `DPoP` header (same key as PAR). Body: `redirect_uri`,
`grant_type=authorization_code`, `code`, `client_assertion_type`, fresh
`client_assertion`, `code_verifier` (43–128 chars, alphanumeric/dash/underscore).

Success: `access_token` (JWT, **30-minute lifetime**, `aud` = userinfo endpoint,
DPoP-bound via `cnf.jkt`; Login apps ignore it), `id_token` (JWE), `token_type:
"DPoP"`.

Errors: `invalid_request` (incl. missing DPoP header), `unsupported_grant_type`,
`invalid_grant` (code older than 60 s, or `redirect_uri` mismatch with PAR),
`invalid_client` (bad client assertion), `invalid_dpop_proof`, `server_error`,
`upstream_dependency_error` (your JWKS must be public and fast),
`temporarily_unavailable`.

## Step 4 — ID token

Always encrypted under FAPI 2.0: JWE (`alg: ECDH-ES+A256KW`, `enc: A256CBC-HS512`,
`cty: JWT`, `kid` = your `enc` key) wrapping a JWS (`alg: ES256`, `kid` = Singpass
signing key). Decrypt with your key (select by `kid`), verify against Singpass JWKS,
then validate: `iss` = discovery issuer; `aud` = client_id; now < `exp`; `nonce` =
your PAR nonce.

Claims:

| Claim | Content |
|---|---|
| `sub` | **User's UUID only** — never NRIC. (Legacy `s=S8829314B,u=<uuid>` parsing must be deleted) |
| `sub_type` | `"user"` |
| `sub_attributes` | Only if `user.identity`/`name`/`email`/`mobileno` requested — see below |
| `act` | Delegation actor (currently unused): `sub` UUID + optional `sub_attributes` |
| `amr` | All form factors used: `face`, `pwd`, `otp-sms`, `face-alt`, `swk`, `hwk` — non-exhaustive, don't build on it |
| `acr` | `urn:singpass:authentication:loa:1` (staging only) / `loa:2` (2FA) / `loa:3` (3FA + face) — read this for assurance |
| `aud`, `iss`, `iat`, `exp`, `nonce` | Standard; sample lifetime 600 s |

`sub_attributes`:

| Property | Content | Scope |
|---|---|---|
| `account_type` | `"standard"` (SC/PR/FIN) or `"foreign"` (SFA) | `user.identity` |
| `identity_number` | NRIC (SC/PR), FIN, or foreign ID (SFA) | `user.identity` |
| `identity_coi` | 2-letter country of issuance; `"SG"` for SC/PR/FIN | `user.identity` |
| `name` | Principal name | `name` |
| `email` | If registered | `email` |
| `mobileno` | SG number, no country code; **always absent for SFA** | `mobileno` |

`amr` deltas vs legacy: `sms`→`otp-sms`, `fv`→`face`, `fv-alt`→`face-alt`; all
factors now listed (legacy returned just `["fv"]` for face-as-third-factor).

## Step 5 — Userinfo (Myinfo v5 apps only)

`GET {issuer}/userinfo`, no query params. Headers:
`Authorization: DPoP <access_token>` (**DPoP scheme, not Bearer**) and
`DPoP: <proof>` where the proof includes `ath` = base64url(SHA-256(access token)).

Response: JWE-wrapped JWS (same scheme as the ID token). Decoded payload:
`person_info` (Myinfo Get Person shape), `iss`, `iat`, `sub` (same UUID as the ID
token), `aud`. Each attribute keeps the Myinfo envelope:

```json
"uinfin": { "lastupdated": "2024-09-26", "source": "1", "classification": "C", "value": "S9000001B" }
```

- `source`: `1` government-verified, `2` user-provided, `3` not applicable,
  `4` verified by Singpass. `classification` is `"C"` (Confidential) — handle
  accordingly.
- `unavailable: true` appears when the source has no record — then no other value
  fields are present.
- The integration-guide page embeds the full OpenAPI 3.1 spec of `person_info`
  (types, max lengths, enums) — fetch it when you need field-level detail.

Errors: `invalid_token` (expired/invalid access token), `invalid_dpop_proof`,
`invalid_request` (your JWKS broken, **or the user is a Singpass Foreign Account
holder — SFA users have no Myinfo**), `server_error`, `upstream_dependency_error`
(also returned as HTTP 502 during scheduled CPFB/IRAS/MOM maintenance),
`temporarily_unavailable`. Some errors are echoed in the `WWW-Authenticate` header.

## Client-side crypto

**JWKS** (registered in SDP as object or URL): ≥1 signing key + ≥1 encryption key;
never include `d`; unique never-reused `kid`s; `kty: EC`; `crv` ∈ P-256/P-384/P-521.
Signing: `use: "sig"`. Encryption: `use: "enc"`, `alg` ∈ ECDH-ES+A128KW/A192KW/
A256KW. Hosted URL: publicly accessible, worst-case **3-second** response, HTTPS
443, public CA, no IP whitelisting/mTLS/custom headers. Rotation ≥ once a year:
add-new → wait 1 h (Singpass cache) → switch → remove; encryption keys need
dual-decrypt capability during the window (select by JWE `kid`).

**Client assertion** (`private_key_jwt`; PAR + token): header `alg` ∈
ES256/ES384/ES512, `typ: JWT`, `kid` optional (omitted → tested against all your
sig keys). Claims: `iss` = `sub` = client_id; `aud` = **the FAPI issuer** (e.g.
`https://id.singpass.gov.sg/fapi`); `iat`; `exp` ≤ `iat` + 2 min; single-use `jti`.

**DPoP** (PAR, token, userinfo): **same ephemeral EC key pair across all three
calls of one session; new pair per session; never reuse across sessions.** Header
`typ: dpop+jwt`, `alg` ES256-family, `jwk` = public key. Payload: `htm`, `htu`,
`iat`, optional `exp` (≤2 min), single-use `jti`, and `ath` (userinfo only).

**PKCE**: verifier 43–128 chars, high-entropy, per-request, stored server-side;
challenge = base64url(SHA-256(verifier)); `S256` only.

Validator for all of the above:
`https://developer.singpass.gov.sg/troubleshooting-tool`.

## Debugging map

| Symptom | Likely cause |
|---|---|
| `invalid_client` at PAR/token | client assertion malformed/expired (>2 min), wrong `aud`, JWKS unreachable or malformed |
| `upstream_dependency_error` | **your** JWKS endpoint down/slow (3 s budget) — user-facing login failures |
| `invalid_grant` at token | code older than 60 s, or `redirect_uri` ≠ PAR value |
| `invalid_dpop_proof` | missing DPoP header, stale `iat`, different key than PAR, missing `ath` at userinfo |
| `invalid_scope` | `openid` missing, or scope not enabled for the app in SDP |
| `invalid_request` at userinfo | JWKS broken, or the user is SFA (no Myinfo) |
| `invalid_token` at userinfo | access token past 30 min |
| 502 + `upstream_dependency_error` on financial scopes | scheduled CPFB/IRAS/MOM downtime — show friendly message + manual path |
| Decryption failures after key change | rotation done without the 1-hour dual-key window / `kid` selection |
| Works in staging, fails in prod | separate JWKS/keys per environment; staging-only `loa:1`; prod app not approved or scope not approved |

---
name: singpass
description: >-
  Integrate Singpass — citizen/resident login and Myinfo (v5) government-verified
  person data — into a Singapore government digital service using the current
  FAPI 2.0 Singpass authentication API. Use this whenever a service authenticates
  individual members of the public or pre-fills their personal data: "log in with
  Singpass", Singpass Login, Myinfo, NRIC/UUID identity, PAR, DPoP, userinfo,
  the Singpass Developer Portal (SDP), consent pages, Myinfo scopes (uinfin,
  name, CPF, NOA, HDB), test personas, or debugging invalid_client /
  invalid_dpop_proof / upstream_dependency_error. Covers the 5-step flow, the
  UUID-first identity model, Myinfo data compliance, onboarding, and app-review
  UX rules. For Myinfo v3/v4 or pre-FAPI integrations and their migration
  deadlines use singpass-legacy; for business users acting for companies use
  corppass.
---

# Singpass: citizen login and Myinfo (v5) on FAPI 2.0

Singpass is Singapore's national digital identity — an OpenID Connect provider,
authorization-code flow only, relying parties must be confidential clients. Two
products ride on one API and one onboarding portal:

- **Singpass Login** — authentication only. The flow ends at the ID token.
- **Singpass Myinfo (v5)** — Login plus consented retrieval of government-verified
  person data from the `/userinfo` endpoint. Every Singpass user automatically has a
  Myinfo profile.

The current API is **fully OIDC + FAPI 2.0 compliant** (new apps are FAPI 2.0 by
default since Feb 2026; **all Singpass APIs must be FAPI 2.0-compliant by
31 Dec 2026**). Use a **certified OIDC relying-party library** (openid.net certified
list) rather than hand-rolling — Singpass says so explicitly, and the library gets
PAR, PKCE, DPoP, and claim validation right for free. If you are maintaining a
Myinfo v3/v4 integration or a pre-FAPI Login flow, read **singpass-legacy** —
different endpoints, different crypto, hard deadlines.

The single most important identity fact: **the ID token `sub` is a UUID, never the
NRIC.** NRIC/FIN arrives only if you request the justification-gated `user.identity`
scope (`sub_attributes.identity_number`) or the `uinfin` Myinfo scope. Key your user
records on the UUID; the PDPC NRIC advisory guidelines apply the moment you store
NRIC instead.

## Source and currency

Embedded from https://docs.developer.singpass.gov.sg as of **2026-07-23**. The docs
iterate — verify compliance-critical details live: append `.md` to any docs page URL
for markdown; index at https://docs.developer.singpass.gov.sg/docs/llms.txt. Read
the reference files for exact wire formats:

- `references/fapi2-integration.md` — endpoints, all five steps with every
  parameter, ID-token/userinfo claims, JWKS/client-assertion/DPoP/PKCE specs,
  error tables, debugging map.
- `references/myinfo-data-and-compliance.md` — the Myinfo data catalog, envelope
  format, display rules, key principles, SDP onboarding, testing, pricing,
  scheduled downtimes, UX/brand requirements, CIBA.

## The five steps

Backend-for-frontend; all secrets and signing server-side.

1. **PAR.** `POST {issuer}/par` (issuer `https://id.singpass.gov.sg/fapi`, staging
   `stg-id`) with fresh `state` + `nonce` (backend-generated v4 UUIDs, persisted
   against the session), PKCE `code_challenge` (S256), a client assertion
   (ES256-family JWT: `iss`/`sub` = client_id, `aud` = the FAPI issuer, unique
   `jti`, **`exp` − `iat` ≤ 2 minutes**), and a `DPoP` header signed with an
   **ephemeral EC key generated for this session**. Login apps must also send
   `authentication_context_type` (anti-fraud enum, e.g.
   `APP_AUTHENTICATION_DEFAULT`) — it is mandatory for Login apps and not for
   Myinfo apps. Response: `request_uri`, valid **60 seconds**.
2. **Redirect** to `{issuer}/auth?client_id=...&request_uri=...` — nothing else in
   the URL. On callback validate `state` (reject mismatch — CSRF) and `iss`; handle
   error callbacks (`server_error`, `temporarily_unavailable`) and never render
   `error_description` verbatim (content spoofing).
3. **Token exchange within 60 seconds of code issuance**: fresh client assertion,
   same DPoP key as PAR, `code_verifier`. Returns `token_type: DPoP`, an access
   token (**30 minutes**; Login apps ignore it) and an **always-encrypted** ID
   token.
4. **Decrypt and validate the ID token**: JWE (ECDH-ES+A256KW / A256CBC-HS512,
   decrypt with your `enc` key selected by JWE `kid`) wrapping a JWS (ES256, verify
   against `https://id.singpass.gov.sg/.well-known/keys` by `kid`). Then check
   `iss`, `aud`, `exp`, and `nonce`. Login integrations stop here.
5. **Userinfo (Myinfo apps only).** `GET {issuer}/userinfo` with
   `Authorization: DPoP <access_token>` (not `Bearer`) and a DPoP proof carrying
   `ath` (base64url SHA-256 of the access token). The response is the same
   JWE-wrapped-JWS scheme; person data sits under `person_info` in the classic
   Myinfo envelope (`value`/`code`+`desc` with `classification`, `source`,
   `lastupdated`).

## Identity: what comes back

| You requested | You get |
|---|---|
| `openid` only | `sub` (UUID), `sub_type: "user"`, `amr`, `acr`, `nonce` |
| + `user.identity` | `sub_attributes`: `account_type` (`standard`/`foreign`), `identity_number` (NRIC/FIN/foreign ID), `identity_coi` |
| + `name` / `email` / `mobileno` | those `sub_attributes` (email/mobileno only if registered; `mobileno` always absent for foreign-account users) |
| Myinfo scopes (`uinfin`, `dob`, `cpfbalances.oa`, ...) | attributes in `person_info` at userinfo |

Read `acr` for assurance level (`urn:singpass:authentication:loa:2` = 2FA default;
`loa:3` adds face verification — whitelisted use cases only and **chargeable since
1 Jan 2026**; `loa:1` appears only in staging). Don't build logic on `amr` values —
the list is non-exhaustive and changes.

**Singpass Foreign Account (SFA) users** can log in (`account_type: "foreign"`) but
**have no Myinfo** — userinfo returns `invalid_request` for them. Design the manual
path.

## Compliance and UX rules that fail app review

The production app review enforces the Key Principles. Bake these in from the start:

- **A non-Singpass alternative is mandatory** — Singpass cannot be the only
  authentication or form-filling option.
- **Display all retrieved Myinfo data** on the form before submission — no silent
  backend-only retrieval. Government-verified fields (`source: "1"`) are
  **non-editable**; user-provided fields (`email`, `mobileno`, and the
  MSF-sourced marital fields) **must stay editable**.
- **Purge unsubmitted data**; purge save-as-draft data periodically; **never reuse
  session/cookie-cached Myinfo data** — every retrieval is a fresh fetch.
- **Request only what you need** — one purpose per app, every scope justified, each
  request reviewed. The consent page cannot offer per-field selection.
- Display rules for specific data: all 15 months of CPF contribution history shown
  even if you need 3; NOA (Detailed) must show year, type (+ "Clearance" when tax
  clearance = Y), assessable income and breakdown; Principal Name shown
  non-editable even when you also capture split name fields.
- **New Login/Myinfo apps support QR login only** (national scam prevention — no
  password/SMS-OTP flows) and **WebView embedded browsers are unsupported** — use
  in-app browser patterns (see the official iOS/Android demo repos).
- Singpass button: white or red fill only, "Log in" as two words, aria-label so
  screen readers say "Sing pass". App logo: square PNG, transparent, 256–512 px,
  ≤200 KB, no padding.

## Onboarding (Singpass Developer Portal)

SDP at https://developer.singpass.gov.sg — access is **authorised via Corppass** by
your entity's Corppass Admin. Singapore-registered entities only. Staging first:
create the app, register redirect URLs (https; no IP-address URLs; custom schemes
unsupported — mobile uses app-claimed HTTPS universal links), configure JWKS
(endpoint or object), pick scopes, create **staging test accounts (max 5 per
entity)**. Myinfo test personas (password `Userinfo@2024`) are for Myinfo testing
only — not Login. Production needs the Singpass Services Agreement, billing
contacts, and a **User Journey document**; approval takes **up to two weeks**;
config changes re-enter review and propagate in 5–10 minutes after approval.

Pricing: government agencies get the WOG-intranet pricing plan (not public). For
others, Login is pay-per-transaction; Myinfo bills **Standard vs Plus** tiers — any
single Plus (financial) scope in a transaction bills the whole transaction at Plus.
Requesting `cpfbalances.*` casually is a billing decision, not just a scope choice.

Validate your crypto with the official tool:
https://developer.singpass.gov.sg/troubleshooting-tool (JWKS, client assertions,
DPoP, PKCE). Demo app: https://github.com/singpass/demo-app.

## Operational hard rules

- **60-second fuses**: `request_uri` and authorization code both expire in 60 s;
  client assertion and DPoP `exp` ≤ 2 min after `iat`; access token 30 min.
- **Your JWKS endpoint is on the user-facing critical path**: ≥1 `sig` + ≥1 `enc`
  EC key (P-256/384/521), public HTTPS, **3-second response budget**, never expose
  `d`, never reuse retired `kid`s. Failures surface as `invalid_client` /
  `upstream_dependency_error` during real user logins. Rotate at least yearly with
  the 1-hour-cache choreography.
- Retry policy is normative: at most 3 retries with exponential backoff on
  `server_error` / `upstream_dependency_error` / `temporarily_unavailable`, then
  guide users to the alternative path.
- Never pin Singpass TLS certs; never hardcode Singpass keys or `kid`s — select by
  `kid` from a ≥1-hour-cached JWKS, re-fetch once on validation failure.
- Plan for **scheduled upstream downtimes** (CPFB/IRAS/MOM maintenance windows —
  see reference): Myinfo financial scopes return 502 `upstream_dependency_error`
  during them; map to a friendly message and the manual path.
- **CIBA** (backchannel push-notification step-up auth) exists for high-risk
  transactions — government agencies only, case-by-case whitelisting, poll mode,
  and it runs on the pre-FAPI endpoint family. See the reference before designing
  for it.

## Audit checklist

| Check | Failure smell |
|---|---|
| Certified RP library; PAR + PKCE + DPoP present | hand-rolled `/auth` URL with scopes in the browser |
| `sub` treated as UUID; NRIC only via `user.identity`/`uinfin` | NRIC parsed out of `sub`, NRIC as DB key |
| Client assertion ≤2 min, `aud` = FAPI issuer, fresh `jti` | hour-long assertions, `aud` = bare host |
| Ephemeral DPoP key per session, `ath` at userinfo | static DPoP key, `Bearer` on userinfo |
| `state`/`nonce`/`iss` validated; errors handled on callback | callback trusts `code` alone |
| JWKS: `sig` + `enc`, 3 s, yearly rotation plan | sig-only JWKS, no rotation, `d` exposed |
| Myinfo data displayed, correct editability, purged, re-fetched | cached profiles, editable NRIC field |
| Manual/non-Singpass path exists incl. SFA users | Singpass-only service |
| QR-only login assumed; no WebViews | password-login UX, embedded WebView |
| Plus-tier scopes consciously chosen | `cpfbalances.*` requested "just in case" |

## What this skill does not cover

- **Business users acting for companies** (UEN, entity roles, Myinfo Business) —
  the **corppass** skill. If the user represents an organisation, it's Corppass.
- **Myinfo v3/v4 and pre-FAPI integrations** — the **singpass-legacy** skill:
  different endpoints (`api.myinfo.gov.sg/com/v3|v4`), different crypto
  (client_secret + PKI_SIGN, X.509), the comma-separated legacy `sub`, and the
  migration deadlines.
- **Sign with Singpass** (Secure Electronic Signatures) and **Verify** — separate
  products with separate docs (docs.sign.singpass.gov.sg); this skill only routes
  you there.
- **PDPA, NRIC retention, data classification policy** — **data-protection**.
- **The catalog controls mandating Singpass** — AC-7 and friends in
  **access-control**; TX-6 pre-fill and service-shell duties in
  **sg-service-shell**.

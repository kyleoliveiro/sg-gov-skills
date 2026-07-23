---
name: corppass
description: >-
  Integrate Corppass — business-user login and Myinfo Business corporate data —
  into a Singapore government digital service using the Corppass Authorization
  API (FAPI 2.0). Use this whenever a service lets companies or other entities
  transact with an agency: "log in with Corppass", business user login, UEN,
  entity roles and e-service authorisation, third-party service providers
  (tax agents, corp secretaries), Myinfo Business pre-fill of ACRA/IRAS/CPF
  corporate data, Corppass Developer Portal onboarding, auth_info, PAR, DPoP,
  or debugging "user can't log in" on a B2G portal. Covers the FAPI 2.0 flow
  end-to-end, the entity-vs-user identity model, role provisioning, and
  Myinfo Business compliance. For legacy (pre-FAPI 2.0) integrations and the
  2027 migration deadlines, use corppass-legacy; for citizen-facing login use
  singpass.
---

# Corppass: business-user login and Myinfo Business (FAPI 2.0)

Corppass is the Singapore Government's corporate **authorisation** system. It is not a
login credential anymore: **authentication is Singpass** (the user logs in with the
Singpass app as a "Business User"); Corppass supplies the entity and role context —
which company the user acts for, and what they are allowed to do. Get this mental model
right first, because the two most expensive integration mistakes flow from it:

1. Treating the ID token `sub` as the person. In FAPI 2.0 **`sub` is always the
   entity** (UEN, or Corppass Entity ID for non-UEN entities). The acting user lives in
   `act.sub` as a UUID.
2. Treating "user can't log in" as a code bug. Most of the time the user authenticated
   fine but their entity's **Corppass Admin never assigned them to your e-service** —
   a provisioning problem no code change fixes.

Two products ride on one API, onboarded on **different portals**:

| Product | What it gives you | Onboard via |
|---|---|---|
| **Corppass Login** | Entity + user identity, e-service roles (`auth_info`), third-party authorisations (`tp_auth_info`) | **Corppass Developer Portal (CDP)** — https://developer.corppass.gov.sg |
| **Myinfo Business (v3)** | Government-verified corporate data (ACRA profile, appointments, shareholders, financials, licences) + applicant person data | **Singpass Developer Portal (SDP)** — https://developer.singpass.gov.sg |

Both integrate against the **Corppass Authorization API (FAPI 2.0)** (launched
23 Feb 2026; Myinfo Business v3 on it since 18 May 2026). New services must use
FAPI 2.0. If you are maintaining an integration built before 23 Mar 2026, or planning
its migration (deadline **31 Mar 2027**; Myinfo Business v1/v2 by **31 May 2027**),
read the **corppass-legacy** skill.

## Source and currency

Everything here is embedded from https://docs.corppass.gov.sg as of **2026-07-23**.
The docs iterate; verify compliance-critical details against the live pages — append
`.md` to any docs.corppass.gov.sg page URL for a markdown version, index at
https://docs.corppass.gov.sg/llms.txt. Read the reference files for exact wire formats:

- `references/fapi2-authorization-api.md` — endpoints, every PAR/token/userinfo
  parameter, ID token and userinfo claim structures, scopes, JWKS/client-assertion/
  DPoP/PKCE requirements, error tables, and a symptom→cause debugging map.
- `references/onboarding-operations-mib.md` — CDP onboarding and its one-way doors,
  the Corppass admin/provisioning model, Myinfo Business compliance and UX rules,
  test personas, key rotation, TLS.

## The integration, step by step

Architecture first: FAPI 2.0 requires a **confidential client (backend-for-frontend)**.
All keys, client assertions, DPoP proofs, and token exchanges live on the backend.
Use a certified OIDC relying-party library (openid.net certified list) — Corppass is
standards-compliant OIDC + FAPI 2.0, and a certified library gets PAR, PKCE, DPoP, and
claim validation right for free.

1. **Discovery.** `GET https://id.corppass.gov.sg/.well-known/openid-configuration`
   (staging `stg-id.corppass.gov.sg`). Never hardcode endpoint paths — derive them from
   discovery. Cache ≥1 hour. Validate `iss` on callbacks against the discovery `issuer`.
2. **Publish your client JWKS** (endpoint or CDP-hosted object) with **both** an EC
   signing key (`use: "sig"`, e.g. ES256/P-256) and an EC encryption key (`use: "enc"`,
   e.g. ECDH-ES+A256KW). Your JWKS endpoint is on *Corppass's* critical path: HTTPS on
   443, publicly trusted cert, responds within 3 seconds, no redirects, never contains
   the private `d` component. A missing `enc` key fails token issuance; an unreachable
   JWKS fails your users' logins.
3. **Pushed Authorization Request.** `POST /request` with a fresh `state`, `nonce`,
   PKCE `code_challenge` (S256), a client assertion (ES256-signed JWT, `iss`/`sub` =
   client ID, `aud` = discovery issuer, unique `jti`, **`exp` − `iat` ≤ 2 minutes**),
   and a `DPoP` header signed with an **ephemeral EC key generated for this session**.
   Corppass Login apps must also send `authentication_context_type`
   (`APP_AUTHENTICATION_DEFAULT`); Myinfo Business apps must **not** — the request is
   rejected if they do. Response: a `request_uri` valid **60 seconds**.
4. **Redirect** the browser to the authorization endpoint with exactly `client_id` +
   `request_uri`. On callback, validate `state` (reject on mismatch — CSRF) and `iss`.
5. **Token exchange** within **60 seconds** of the code being issued (single-use code):
   fresh client assertion, same DPoP key as PAR, `code_verifier`. You get a DPoP-bound
   access token (**10 minutes**, `token_type: DPoP`, treat as an opaque string — never
   parse it) and a JWE-encrypted ID token. **There are no refresh tokens** — expiry
   means a fresh flow.
6. **Decrypt, verify, validate the ID token.** Decrypt the JWE with your `enc` private
   key (select by JWE header `kid`), verify the inner JWS against Corppass's JWKS,
   then validate `iss`, `aud`, `exp`, `nonce`, and `at_hash`.
7. **Userinfo (roles and Myinfo Business data).** `GET /userinfo` with
   `Authorization: DPoP <access_token>` (not `Bearer` — that gets a bare 401 with an
   empty body) plus a DPoP proof that includes the `ath` claim. The response is again
   JWE-wrapping-JWS. Note the userinfo `sub` is your own client ID — identity comes
   from the ID token, not here.

## The identity model — read the right claim

```json
"sub": "T09LL0001B",              // THE ENTITY (UEN; Corppass Entity ID for NON-UEN)
"sub_type": "entity",
"sub_attributes": { "entity_type": "UEN", "entity_name": "...", ... },
"act": {
  "sub": "1c0cee38-...",          // THE USER — a stable UUID
  "sub_attributes": { "identity_number": "S1234567P", "name": "...", ... }
}
```

- Key your user records on **`act.sub` (the UUID)**, not NRIC. Corppass's own key
  principles recommend UUID over NRIC/FIN — it is stable, and it keeps sensitive
  identifiers out of your database (PDPC NRIC advisory guidelines apply if you don't).
- NRIC/name arrive only if you request the `user.identity` / `user.name` scopes;
  entity name and UEN status need `entity.basic_profile.name` / `.uen_status`.
- For **NON-UEN** (foreign) entities, `sub` is the Corppass Entity ID and
  `sub_attributes.entity_reg_number` is the foreign registration number — two
  different identifiers. Foreign users' names are typed in by their Corppass Admin,
  not government-verified.
- One user ↔ many entities: users authorised for several companies pick one at login.
  Scope every session and record to the (entity, user) pair, never the user alone.

## Roles and provisioning — `auth_info`

If your service gates actions by role, request the `authinfo` scope and read
`auth_info` from userinfo. Each row is an assignment made by the entity's Corppass
Admin: `CPRole`, optional Sub-UEN (`CPEntID_SUB`), validity window
(`StartDate`/`EndDate`, `9999-12-31` = no expiry), and custom `Parameter` values.
Enforce the window and role server-side on every request, not just at login.

- `ESrvc_Row_Count: 0` = **authenticated but not provisioned**. Show a message that
  names the fix: "ask your company's Corppass Admin to assign you to [service name]"
  — do not present it as a login failure.
- `"ERROR_MISSING_VALUE"` inside a field = the admin skipped a mandatory
  Sub-UEN/parameter during assignment.
- Third-party service providers (tax agents, corporate secretaries) acting for client
  entities come through `tp_auth_info` (scope `tpauthinfo`), one block per client
  entity — only if your service enabled third-party functionality at onboarding.
- **Design roles/Sub-UEN/parameters carefully before publishing**: once a CDP service
  is published, entity types, statuses, Sub-UEN format, roles, and parameters are
  one-way doors — roles can be added but never modified or removed, and new mandatory
  parameters cannot be added.

## Hard rules that break integrations

- **60-second fuses**: PAR `request_uri` 60 s; authorization code 60 s, single-use;
  client assertion lifetime ≤2 min; DPoP `iat` recency-checked. Clock skew and slow
  redirects are real failure modes.
- **Callback and JWKS URLs must not contain the words "singpass", "corppass", or
  "myinfo"** (anti-scam rule). `https://portal.agency.gov.sg/corppass/callback` will
  be rejected — pick `/auth/callback`.
- Redirect URIs: **https only**, exact match, no wildcards, no custom app schemes
  (use universal links for mobile).
- TLS: your client must negotiate TLS 1.3 or one of four TLS 1.2 ECDHE-GCM suites
  (wrong suite → `invalid_request`). **Never pin Corppass certificates** (AWS-issued,
  rotated without notice); allow-list egress by domain, not IP (CloudFront).
- Key rotation both directions: handle Corppass signing-key rotation by `kid` with a
  1-hour JWKS cache + lazy refresh; when rotating your own encryption key, keep
  decrypting with the old key for ≥1 hour (select by JWE `kid`).

## Myinfo Business compliance (what app review rejects)

- Request only scopes you can justify — one business purpose per request; every scope
  needs a written justification and a User Journey document at production onboarding
  (approval up to 2 weeks; config changes propagate in 5–10 minutes).
- **All retrieved data must be displayed to the user before submission** — no silent
  backend-only retrieval. Government-originated fields are non-editable; purge data if
  the form is never submitted; never cache Myinfo Business data in sessions/cookies
  for later repopulation — re-fetch every time.
- Provide a manual-entry alternative (opt-outs, outages, and Singpass Foreign Account
  holders — **SFA users cannot use Myinfo Business at all**).
- Eligibility text, Singpass-branded button with approved labels only, and the
  prerequisite notice ("ensure you have a Corppass account and are assigned to
  [E-Service Name]...") are prescribed — see the reference file.
- Myinfo Business is currently **free of charge**; Corppass Login pricing for agencies
  is on the WOG intranet (GSIB), not public.
- Testing: Myinfo Business test personas (password `Userinfo@2024`) are for Myinfo
  Business only; Corppass Login staging accounts come from the Partner Support Portal.
  Handle the `unavailable: true` attribute pattern and don't hardcode persona data.

## Audit checklist

When reviewing an existing Corppass integration, walk this list:

| Check | Failure smell |
|---|---|
| `sub` read as entity, `act.sub` as user | user records keyed on `sub` or on NRIC |
| Certified OIDC RP library, PAR + PKCE + DPoP | hand-rolled flow, no PAR, `Bearer` tokens |
| Client assertion ≤2 min, unique `jti`, `aud` = issuer | 1-hour assertions, reused `jti` |
| Same DPoP key PAR→token→userinfo, fresh per session | static DPoP key, or none on userinfo |
| `state`, `iss`, `nonce`, `at_hash` all validated | callback trusts `code` alone |
| Access token opaque, 10-min, re-auth on expiry | token parsed for claims, refresh logic |
| JWKS has `sig` + `enc` keys, 3 s response, no `d` | one key, private key leaked, slow origin |
| Callback/JWKS URLs free of banned words, https, exact | `/corppass/callback`, custom schemes |
| Role + validity window enforced server-side | role checked only at login |
| `ESrvc_Row_Count: 0` handled as provisioning | generic "login failed" error |
| No cert pinning; TLS 1.3/approved 1.2 suites | pinned AWS leaf certs, IP allow-lists |
| MIB data displayed, uneditable, purged, re-fetched | silent retrieval, cached profiles |

## What this skill does not cover

- **Citizen/individual-facing login and Myinfo person data** — the **singpass** skill.
  If your users act as themselves rather than for an entity, that is Singpass Login.
- **Legacy Corppass Authorization API and Myinfo Business v1/v2** (pre-FAPI 2.0
  integrations, `entityInfo`/`userInfo` claims, `/authorization-info`, and the
  2027 migration deadlines) — the **corppass-legacy** skill.
- **PDPA obligations, NRIC storage and retention policy** — the **data-protection**
  skill. This skill tells you to prefer the UUID; that one tells you what the law
  expects if you must hold NRIC or corporate personal data.
- **The catalog controls that mandate all this** — AC-7 (Corppass for public users),
  AC-12 (SSO), and friends live in the **access-control** skill; session hardening and
  per-request authorization are **secure-coding-as**.

---
name: corppass-legacy
description: >-
  Maintain, debug, or migrate a LEGACY Corppass integration — the pre-FAPI 2.0
  Corppass Authorization API (entityInfo/userInfo ID-token claims, the
  comma-separated sub format, /authorization-info, Bearer access tokens,
  esrvcID) or Myinfo Business v1/v2 (/entity-person, PKI_SIGN, client_secret).
  Use this whenever an existing Corppass integration predates March 2026, when
  code or API responses reference CPEntID, CPAccType, ISSPHOLDER, TPAuthInfo,
  ESrvc_Row_Count, or authmode — even inside an otherwise-new FAPI 2.0
  integration — or when planning the mandatory migration: legacy API by 31 March 2027, Myinfo
  Business v1/v2 to v3 by 31 May 2027. Covers the legacy wire formats, the
  legacy-to-FAPI 2.0 claim mapping, and the migration checklist. For new
  integrations use the corppass skill instead — new services cannot onboard to
  the legacy API.
---

# Corppass legacy: maintain and migrate pre-FAPI 2.0 integrations

Every Corppass integration onboarded before 23 March 2026 runs on the legacy
Corppass Authorization API. It still works, but it is on a countdown:

| What you have | Deadline | After that |
|---|---|---|
| Legacy Corppass Authorization API | **migrate by 31 March 2027** | legacy security profile deprecated **1 April 2027** |
| Myinfo Business v1/v2 | **migrate to v3 by 31 May 2027** | v1/v2 deprecated |

Submit your migration plan (current progress + target date) at
https://go.gov.sg/cp-fapi-migration-plan. New services cannot choose legacy — for
anything greenfield, use the **corppass** skill. This skill exists for two jobs:
keeping an existing legacy integration healthy until it migrates, and executing the
migration correctly.

## Source and currency

Embedded from https://docs.corppass.gov.sg as of **2026-07-23** (legacy API spec +
migration guides). Append `.md` to any live docs page URL for markdown; index at
https://docs.corppass.gov.sg/llms.txt. Read
`references/legacy-api-and-migration.md` for the full legacy wire formats, the
verbatim claim-mapping table, and both migration checklists.

## The legacy shape (what you are maintaining)

Same hosts as FAPI 2.0 (`stg-id.corppass.gov.sg` / `id.corppass.gov.sg`), different
mechanics:

- **Front-channel authorization**: `GET /mga/sps/oauth/oauth20/authorize` with
  `scope`, `response_type=code`, `client_id`, `redirect_uri`, `state`, `nonce`,
  PKCE challenge, and (deprecated) `esrvcID` — all in the browser URL. Redirects
  during Singpass login use **HTTP 303** (since v2.0).
- **Scopes**: only `openid`, `authinfo`, `tpauthinfo`.
- **Token endpoint** returns `token_type: "Bearer"` (not DPoP), a JWE ID token, and
  a Bearer-used JWS access token (10 minutes).
- **Legacy ID token** is flat, and its `sub` is the **user**, as a comma-separated
  string: `"s=S1234567P,uuid=0f14a2fc-...,u=CP192,c=SG"` — key order **not
  guaranteed** since v2.1; parse by key, never by position. Entity data sits in the
  `entityInfo` claim (`CPEntID`, `CPEnt_TYPE`, `CPEnt_Status`, `CPNonUEN_*`), user
  metadata in `userInfo` (`CPAccType` — Administrator/Sub-Administrator/User/Enquiry
  User, `CPUID_FullName`, `ISSPHOLDER`).
- **Authorization data** comes from `GET /authorization-info` with
  `Authorization: Bearer <token>` — a **JWS (signed, not encrypted)** whose payload
  carries PascalCase `AuthInfo` / `TPAuthInfo` (same `Result_Set` row shapes as the
  FAPI `auth_info`).
- Crypto: `private_key_jwt` client assertions (ES256-family), PKCE S256, JWE
  ID tokens (`ECDH-ES+A128KW/A192KW/A256KW` + `A256CBC-HS512`). No PAR, no DPoP.
- Legacy JWKS responses include `x5c`/`x5t`/`x5t#S256` — deprecated; do not build
  on them. SSO support was removed in v2.0 (May 2024). The `email`/`email_verified`
  ID-token claims were a restricted beta and are deprecated — do not adopt them.
- Myinfo Business v1/v2 is a different API family entirely:
  `https://api.myinfo.gov.sg/biz/[v1|v2]` with `/authorise`, `/token`
  (**client_secret!**), and `/entity-person/{uen}/{uuid}` — the uen/uuid taken from
  the decoded access token, which v3 forbids.

Debugging tips that differ from FAPI 2.0: the authorization code lives **10
minutes** (not 60 s); `Bearer` on `/authorization-info` is correct here; the
response needs signature verification but no decryption.

## The migration, in essence

The migration is not an endpoint swap — the identity model flips underneath you:

1. **`sub` changes meaning.** Legacy `sub` = the user (comma-separated string).
   FAPI 2.0 `sub` = **the entity** (UEN / Corppass Entity ID); the user moves to
   `act.sub` as a bare UUID. Any code that treats `sub` as a person silently
   mis-identifies entities after migration. Map: `entityInfo.CPEntID` → `sub` /
   `sub_attributes.entity_reg_number`; `CPEnt_TYPE` → `sub_attributes.entity_type`;
   `CPEnt_Status` → `sub_attributes.entity_uen_status`; legacy `sub`'s `uuid=` →
   `act.sub`; `userInfo.CPUID_FullName` → `act.sub_attributes.name`.
   **No FAPI equivalent exists for `CPAccType` or `ISSPHOLDER`** — if your logic
   branches on them, redesign it (role logic belongs on `auth_info` rows).
2. **Front-channel → PAR.** Sensitive params move to a back-channel
   `POST /request`; the browser carries only `client_id` + `request_uri` (60 s).
   Corppass Login apps must add `authentication_context_type`
   (`APP_AUTHENTICATION_DEFAULT` is auto-backfilled for existing clients).
3. **Bearer → DPoP.** DPoP proofs on PAR, token, and userinfo; ephemeral EC key per
   session; `ath` claim at userinfo; `Authorization: DPoP`.
4. **`/authorization-info` → `/userinfo`.** JWS → **JWE** (you now need an `enc` key
   in your JWKS and decrypt-then-verify); PascalCase `AuthInfo`/`TPAuthInfo` →
   snake_case `auth_info`/`tp_auth_info`; row shapes unchanged.
5. **TTLs tighten.** Auth code 10 min → **60 seconds**; client assertion lifetime
   capped at **2 minutes** with mandatory unique `jti`; `request_uri` 60 s.
6. **Config prerequisites.** At least one **https** redirect URL registered (or PAR
   initialization is refused); custom app schemes banned; review the auto-backfilled
   finer-grained scopes and drop what you don't need; same discovery URL — re-fetch
   it to pick up `pushed_authorization_request_endpoint` and `userinfo_endpoint`.
7. **Same client_id for the API migration** — but **Myinfo Business v1/v2 → v3
   requires a NEW app on the Singpass Developer Portal**; old App IDs/Client IDs are
   not interchangeable. v3 also renames/drops fields (`uen` →
   `registration_number`, `entity-status` → `uen-status`, `gov-contracts.*` dropped,
   several CPF person scopes dropped) — audit every consumed attribute against the
   v3 scope list before cutover.
8. **Parallel run is possible**: the API version is selected per-flow (PAR ⇒ FAPI
   2.0, browser-redirect authorization ⇒ legacy), so you can stage the rollout
   behind a flag and cut over gradually.

Full step-by-step checklists (API migration and MIB v1/v2 → v3) with the verbatim
mapping tables are in `references/legacy-api-and-migration.md`.

## Migration audit checklist

When reviewing a migration plan or a half-migrated codebase:

| Check | Failure smell |
|---|---|
| `sub` parsing rewritten for the entity model | code still splits `sub` on commas, or reads it as a person |
| `sub` key-order-independent parsing (if still on legacy) | `sub.split(",")[0]` positional parsing |
| `CPAccType`/`ISSSPHOLDER` logic redesigned | branches on claims that no longer exist |
| `enc` key added to JWKS before cutover | JWKS still sig-only; userinfo decrypt fails |
| DPoP + PAR + 2-min assertions implemented | Bearer tokens, front-channel auth params |
| Token-exchange latency budget re-tested | 10-min-code assumptions; retries past 60 s |
| `/authorization-info` consumers moved to `/userinfo` | PascalCase `AuthInfo` parsing against snake_case payloads |
| MIB: new v3 app created on SDP; scope diff audited | reusing v1/v2 client IDs; consuming dropped fields |
| Migration plan submitted; deadline tracked | no owner for the 31 Mar / 31 May 2027 dates |
| https redirect URL registered pre-cutover | custom-scheme or http redirect still configured |

## What this skill does not cover

- **The target state.** The full FAPI 2.0 wire spec, JWKS/DPoP/assertion details,
  CDP onboarding, and Myinfo Business v3 compliance live in the **corppass** skill —
  read it alongside this one when executing a migration.
- **Individual-facing login** — the **singpass** skill (and **singpass-legacy** for
  Myinfo v3/v4-era person-data integrations, which have their own deadlines).
- **PDPA/NRIC handling** — **data-protection**.

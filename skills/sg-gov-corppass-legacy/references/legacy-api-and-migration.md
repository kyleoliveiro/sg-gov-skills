# Legacy Corppass Authorization API + migration to FAPI 2.0 — reference

Embedded from https://docs.corppass.gov.sg as of 2026-07-23 (legacy API spec,
migration guides, changelogs). Append `.md` to live docs URLs for markdown.

## Deadlines (verbatim)

- "New services must use FAPI 2.0. Existing services onboarded before **23 March
  2026** must migrate by **31 March 2027**, as the legacy security profile will be
  deprecated on **1 April 2027**."
- Myinfo Business: "All existing applications (v1/v2) must migrate to Myinfo
  Business v3 by **31 May 2027**, as legacy versions will be deprecated after this
  date."
- Migration plan submission: https://go.gov.sg/cp-fapi-migration-plan

## Legacy endpoints

| Endpoint | Staging | Production |
|---|---|---|
| OpenID Discovery | `https://stg-id.corppass.gov.sg/.well-known/openid-configuration` | `https://id.corppass.gov.sg/.well-known/openid-configuration` |
| JWKS | `https://stg-id.corppass.gov.sg/.well-known/keys` | `https://id.corppass.gov.sg/.well-known/keys` |
| Authorization | `.../mga/sps/oauth/oauth20/authorize` | same path |
| Token | `.../mga/sps/oauth/oauth20/token` | same path |
| Authorization Info | `https://stg-id.corppass.gov.sg/authorization-info` | `https://id.corppass.gov.sg/authorization-info` |

Discovery notes: `token_endpoint_auth_methods_supported: ["private_key_jwt"]`;
signing algs ES256/ES256K/ES384/ES512; `id_token_encryption_alg_values_supported:
["ECDH-ES+A128KW","ECDH-ES+A192KW","ECDH-ES+A256KW"]`; enc `A256CBC-HS512`; custom
field `"authorization-info_endpoint"`. Legacy JWKS includes `x5c`/`x5t`/`x5t#S256` —
**deprecated**, do not rely on them.

## Legacy authorization request (front-channel)

`GET /mga/sps/oauth/oauth20/authorize` with query params: `scope` (only `openid`,
`authinfo`, `tpauthinfo`), `response_type=code`, `client_id`, `redirect_uri`,
`state`, `nonce`, `code_challenge`, `code_challenge_method=S256`, and `esrvcID`
(optional and **deprecated** since v2.2). Redirects during Singpass login return
**HTTP 303** (changed from 302 in v2.0). Authorization code lifetime: **10 minutes**
(cut to 60 seconds in FAPI 2.0).

## Legacy token endpoint

`POST /mga/sps/oauth/oauth20/token` with `redirect_uri`,
`grant_type=authorization_code`, `code`,
`client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer`,
`client_assertion`, `client_id`, `code_verifier`. Response: `token_type: "Bearer"`,
`expires_in: 599`, JWE `id_token`, JWS `access_token` (Bearer, 10 min, opaque to
you). Client assertion `jti` was introduced in v2.3 and is mandatory going forward.

## Legacy ID token (user-centric)

```json
{
  "iat": 1623162109, "exp": 1623165709,
  "iss": "https://stg-id.corppass.gov.sg",
  "aud": "vOIljWVrGyBMK6f31QYq",
  "at_hash": "6J4VlBBQpbAyy1NL4NBW-Q",
  "amr": ["pwd", "sms"],
  "nonce": "ZEF+97...",
  "sub": "s=S1234567P,uuid=0f14a2fc-09c2-4780-95f0-8c28347f2780,u=CP192,c=SG",
  "userInfo": {
    "CPAccType": "User",
    "CPUID_FullName": "John Grisham",
    "ISSPHOLDER": "YES"
  },
  "entityInfo": {
    "CPEntID": "82532759L",
    "CPEnt_TYPE": "UEN",
    "CPEnt_Status": "Registered",
    "CPNonUEN_Country": "", "CPNonUEN_RegNo": "", "CPNonUEN_Name": ""
  }
}
```

- `sub` is a comma-separated list of `key=value` pairs: `s` = identity ID
  (NRIC/FIN/foreign ID), `uuid` = the user's globally unique identifier, `u` =
  system-defined ID (e.g. `CP192`), `c` = ISO 3166-1 alpha-2 country. **Order is
  not guaranteed** (v2.1) — parse by key.
- `userInfo.CPAccType` ∈ Corppass Administrator / Sub-Administrator / User /
  Enquiry User. `ISSPHOLDER` = has the user activated their Corppass ID using
  Singpass.
- `entityInfo`: `CPEntID` (UEN or Corppass Entity ID), `CPEnt_TYPE`
  (`UEN`/`NON-UEN`/`GSTN`), `CPEnt_Status` (`Registered`/`De-Registered`/
  `Withdrawn`/blank for Non-UEN), `CPNonUEN_*` for foreign entities.
- `email`/`email_verified` (v2.1) were restricted-access beta and are **deprecated**.
- AMR trivia: legacy uses `sms` (FAPI: `otp-sms`); face verification was corrected
  from `"fb"` to `"fv"` in v1.4 (FAPI: `face`/`face-alt`).

## Legacy authorization-info endpoint

`GET /authorization-info` (POST before v2.1) with `Authorization: Bearer
<access_token>`. Returns a **JWS** (signed by Corppass — verify, no decryption)
whose payload has `iat`, `exp` (10 min), `aud`, `iss`, `sub` (your client ID), and
PascalCase `AuthInfo` / `TPAuthInfo` with the same internal shapes as FAPI 2.0's
`auth_info`/`tp_auth_info` (`Result_Set` → `ESrvc_Result[]` → `Auth_Result_Set` →
`Row[]` with `CPEntID_SUB`, `CPRole`, `StartDate`, `EndDate`, `Parameter[]`;
`ERROR_MISSING_VALUE` sentinel; `9999-12-31` = no expiry).

## Legacy changelog (dates that explain code you inherit)

- **v2.3 (8 Feb 2025)**: PAR documented for legacy; client-assertion `jti`
  introduced; `esrvcID` marked for deprecation.
- **v2.2 (15 Jan 2025)**: official `esrvcID` deprecation notice.
- **v2.1 (26 Nov 2024)**: ES256K/ES384/ES512 signing; A128KW/A192KW encryption
  added; `email`/`email_verified` added (beta); 302→303; access token gains
  `client_id`+`jti`; `sub` key order "not guaranteed"; authorization-info POST→GET.
- **v2.0 (16 May 2024)**: **SSO support removed**; standardized errors.
- **v1.4 (1 Jun 2023)**: face AMR `fb` → `fv`.
- AA (Agency Admin) portal sunset **30 June 2025**; CDP replaces it.

## Migration guide: legacy → FAPI 2.0

### Claim mapping (verbatim from the migration guide)

| Legacy | FAPI 2.0 |
|---|---|
| `entityInfo.CPEntID` | `sub` and `sub_attributes.entity_reg_number` |
| `entityInfo.CPEnt_TYPE` | `sub_attributes.entity_type` |
| `entityInfo.CPEnt_Status` | `sub_attributes.entity_uen_status` |
| legacy `sub` → `uuid=` component | `act.sub` |
| legacy `sub` → `s=` component | `act.sub_attributes.identity_number` (scope `user.identity`) |
| `userInfo.CPUID_FullName` | `act.sub_attributes.name` (scope `user.name`) |
| `userInfo.CPAccType` | **no equivalent — redesign** |
| `userInfo.ISSPHOLDER` | **no equivalent — redesign** |
| `email` / `email_verified` | deprecated (MIB apps: `corppass.email` scope) |
| `AuthInfo` / `TPAuthInfo` (JWS, Bearer, `/authorization-info`) | `auth_info` / `tp_auth_info` (JWE, DPoP, `/userinfo`) |

### Step-by-step

1. **CDP config review**: confirm `authentication_context_type` allow-listing
   (`APP_AUTHENTICATION_DEFAULT` auto-backfilled); audit the auto-backfilled
   finer-grained scopes (`authinfo`, `tpauthinfo`, `entity.identity`,
   `entity.basic_profile.name`, `entity.basic_profile.uen_status`, `user.identity`,
   `user.name`) and remove unneeded ones; ensure **≥1 https redirect URL** ("you
   must provide a redirect URL with https scheme, or else you will not be allowed
   to initialise authorization on FAPI 2.0"); remember callback/JWKS URLs cannot
   contain "singpass"/"corppass"/"myinfo".
2. **Re-fetch discovery** (same URL) — pick up
   `pushed_authorization_request_endpoint` and `userinfo_endpoint`.
3. **JWKS**: add an EC `enc` key alongside your `sig` key (ID tokens and userinfo
   become JWEs encrypted to it); meet the hosting SLOs (HTTPS 443, ≤3 s, no
   redirects).
4. **Implement PAR** (back-channel POST, 60 s `request_uri`), keep PKCE, add
   `authentication_context_type` (Login apps).
5. **Token exchange**: client assertion `exp − iat ≤ 2 min`, unique `jti`, DPoP
   header (ephemeral per-session EC key, same key as PAR); handle the 60-second
   single-use code; **no refresh tokens**; `token_type` becomes `DPoP`.
6. **ID token**: decrypt (your `enc` key, by JWE `kid`) → verify (Corppass key) →
   validate `iss`/`aud`/`exp`/`nonce`/`at_hash` → remap claims per the table.
7. **Userinfo**: swap `/authorization-info` → `/userinfo`; `Bearer` → `Authorization:
   DPoP` + DPoP proof with `ath`; PascalCase → snake_case; JWS-verify-only →
   JWE-decrypt-then-verify.
8. **Error handling**: standardized OAuth `error`/`error_description`/`state`;
   handle callback errors (`login_required`, `access_denied`, `server_error`,
   `temporarily_unavailable`); never render `error_description` verbatim.
9. **Parallel rollout**: version selection is per-flow (PAR ⇒ FAPI 2.0,
   browser-redirect ⇒ legacy) on the same client_id — stage behind a feature flag.

### Common breakages after cutover

- `sub` treated as a person → entities mis-identified (the #1 silent bug).
- JWKS without `enc` key → token endpoint `invalid_request` ("The JWKS object is
  empty or the encryption key is not available").
- 10-minute-code assumptions → `invalid_grant` under real-world latency (60 s now).
- 1-hour client assertions → `invalid_client` (2-minute cap).
- `Bearer` on `/userinfo` → bare 401, empty body.
- `CPAccType`-based admin checks silently always-false after remap.

## Migration guide: Myinfo Business v1/v2 → v3

Legacy MIB is a separate API family: test `https://test.api.myinfo.gov.sg/biz/[v1|v2]`,
prod `https://api.myinfo.gov.sg/biz/[v1|v2]`; endpoints `/authorise`, `/token`
(with **client_secret** + `state`), `/entity-person/{uen}/{uuid}` (uen/uuid read from
the decoded access token `sub` "uen_uuid"). Legacy authorize params included
`authmode`, `purpose`, `attributes`.

v3 changes:

- Runs on the Corppass FAPI 2.0 endpoints (`stg-id.corppass.gov.sg` /
  `id.corppass.gov.sg`); client_secret is gone — client assertion + PKCE + DPoP +
  PAR; access token opaque; data via `/userinfo` (no uen/uuid path params).
- **New app required on the Singpass Developer Portal (SDP)** — "Existing Client
  ID / App ID cannot be used in the new version as they are not interchangeable."
- Do NOT send `authentication_context_type`/`authentication_context_message`
  (MIB apps are rejected if present).
- Payload restructuring: `entity`/`person` → `entity_info`/`person_info`/
  `corppass_info`.
- Scope/field diff (audit every consumed attribute):
  - Renamed: `uen` → `registration_number` (basic profile, appointments,
    shareholders); `entity-status` → `uen-status`.
  - Dropped: `ownership`, user-described activities, `corppass-email`/
    `corppass-mobileno` on appointments/shareholders, the entire `gov-contracts.*`
    category, and CPF person items (`cpfhomeprotectionscheme`,
    `cpfdependantprotectionscheme`, `cpfmedishieldlife`,
    `cpfrstucurrentyeartaxrelief`, `cpfrstuselftopupamount`, `cpflife`,
    `cpfmonthlypayouts`).
  - Added: `id_type` on individual appointments/shareholders;
    `entity_info.appointments.designation`.
  - Changed: `contractors.workhead_financial_grade` from code+desc to value only.
  - Missing a person scope you need? Request it via
    partnersupport.singpass.gov.sg — v3's person list is curated for business use
    cases.
- Deadline: **31 May 2027**.

## Reading legacy code: identification cheatsheet

You are looking at a legacy integration if you see any of: `esrvcID`; `sub` split on
commas or `s=`/`uuid=` parsing; `entityInfo`/`userInfo`/`CPEntID`/`CPAccType`/
`ISSPHOLDER`; `/authorization-info` or PascalCase `AuthInfo`/`TPAuthInfo`;
`token_type: "Bearer"` from Corppass; `authmode`/`purpose`/`attributes` params or
`client_secret` (MIB v1/v2); `x5c` handling on Corppass JWKS. Each of these has a
mapped replacement above — none survives past the deadlines.

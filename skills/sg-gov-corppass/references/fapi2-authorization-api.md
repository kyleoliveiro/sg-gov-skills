# Corppass Authorization API (FAPI 2.0) — wire-level reference

Embedded from https://docs.corppass.gov.sg as of 2026-07-23. Append `.md` to any live
docs page URL for a markdown version; index at https://docs.corppass.gov.sg/llms.txt.

## Environments and endpoints

| | Staging | Production |
|---|---|---|
| Base | `https://stg-id.corppass.gov.sg` | `https://id.corppass.gov.sg` |
| Discovery | `/.well-known/openid-configuration` | same |
| Corppass JWKS | `/.well-known/keys` | same |
| PAR | `/request` | same |
| Authorization | `/mga/sps/oauth/oauth20/authorize` | same |
| Token | `/mga/sps/oauth/oauth20/token` | same |
| Userinfo | `/userinfo` | same |

Do not hardcode paths — derive from discovery (`issuer` = base URL). Discovery notes:
`authorization_response_iss_parameter_supported: true` (validate `iss` on callbacks);
`request_parameter_supported: false`; `request_uri_parameter_supported: false`.
Cache discovery and JWKS ≥1 hour; on unknown `kid`, force-refresh JWKS once, retry,
then reject ("lazy refresh").

## Step 1 — Pushed Authorization Request (PAR)

`POST /request`, `Content-Type: application/x-www-form-urlencoded`, plus a `DPoP`
header (mandatory unless `dpop_jkt` is in the body; if both, they must match — docs
recommend the header since you need DPoP later anyway).

| Parameter | Required | Rules |
|---|---|---|
| `client_id` | Yes | Assigned at onboarding |
| `client_assertion` | Yes | Fresh per session, unique `jti`, signed with your JWKS-registered private key |
| `client_assertion_type` | Yes | `urn:ietf:params:oauth:client-assertion-type:jwt-bearer` |
| `response_type` | Yes | `code` only |
| `redirect_uri` | Yes | **https only** (custom schemes banned — use universal links on mobile); exact match against registered URIs, no wildcards |
| `scope` | Yes | Space-delimited; must include `openid`; only scopes authorized for your client ID |
| `state` | Yes | Unique, non-guessable, cryptographically random, fresh per session; validate on callback (CSRF) |
| `nonce` | Yes | Same rules; must match ID token `nonce` |
| `code_challenge` | Yes | base64url(SHA-256(code_verifier)) |
| `code_challenge_method` | Yes | `S256` |
| `acr_values` | No | Space-delimited, descending preference. Supported: `urn:singpass:authentication:loa:2` (2FA). Omitted → client's configured default |
| `authentication_context_type` | **Yes for Corppass Login apps; REJECTED for Myinfo Business apps** | Anti-fraud enum, allow-listed per client. Currently only `APP_AUTHENTICATION_DEFAULT` |
| `authentication_context_message` | No (Login apps only) | Alphanumeric + spaces, ≤100 chars; future: displayed to user |
| `dpop_jkt` | Only if no `DPoP` header | base64url SHA-256 thumbprint of your DPoP public JWK |

Success: `{"request_uri": "urn:ietf:params:oauth:request_uri:...", "expires_in": 60}` —
**you have 60 seconds** to redirect.

Errors (JSON `error`, `error_description`, `state`): `invalid_request` (missing/
malformed params, Login-only params sent by a Myinfo Business app, **your JWKS
unreachable**, **non-FAPI TLS cipher suite**), `invalid_client` (bad/expired/oversized
client assertion, JWKS missing `sig` key), `invalid_scope`, `invalid_dpop_proof`,
`server_error`, `temporarily_unavailable`.

## Step 2 — Authorization endpoint

Browser redirect: `GET /mga/sps/oauth/oauth20/authorize?client_id=...&request_uri=...`
— exactly those two query params, values matching the PAR.

Success callback: `302` to your `redirect_uri` with `code` (valid **60 seconds,
single-use**), `state` (strict-match against session or reject — CSRF), and `iss`
(verify against expected issuer; present on success and failure).

Error callback adds `error`/`error_description`: `login_required` (no active/expired
session), `access_denied`, `server_error` (**"can potentially be due to the RP's JWK
endpoint being unreachable or returning a malformed JWK"**), `temporarily_unavailable`.
Handle these — don't leave users on a blank callback page, and don't render
`error_description` verbatim (content spoofing).

## Step 3 — Token endpoint

`POST /mga/sps/oauth/oauth20/token` with `DPoP` header — **signed with the exact same
private key as the PAR DPoP proof**.

Body: `code`, `redirect_uri` (strict match with PAR), `grant_type=authorization_code`
(the only grant — **no refresh tokens**), `client_assertion_type`, `client_assertion`
(fresh, unique `jti`), `code_verifier`, optional `client_id` (must match assertion
`sub` if sent).

Success:

```json
{
  "token_type": "DPoP",
  "access_token": "eyJ...",   // JWS but OPAQUE to you — never parse; 10 min (expires_in ~599)
  "id_token": "eyJ...",       // JWE wrapping JWS
  "scope": "openid authinfo ...",  // granted scopes, may be a subset
  "expires_in": 599
}
```

Access-token rules (verbatim intent): treat as an **opaque string**; do not decode or
rely on internal claims; sender-constrained via DPoP (`cnf.jkt`); on expiry re-run the
whole flow.

Errors: `invalid_request` (incl. **"The JWKS object is empty or the encryption key is
not available"** — your JWKS lacks an `enc` key), `invalid_client`, `invalid_grant`
(code >60 s old, reused, or client mismatch), `invalid_dpop_proof` (sample: `"DPoP
proof iat is not recent enough"`), `unsupported_grant_type`, `server_error`,
`temporarily_unavailable`.

## The ID token

JWE (outer, encrypted to **your** `enc` public key — select decryption key by JWE
header `kid` against your own JWKS) wrapping a JWS (inner, signed by Corppass —
verify against `/.well-known/keys` by `kid`). Then validate: `iss` = discovery
issuer, `aud` = your client ID, `exp` in future, `nonce` = PAR nonce, `at_hash` =
hash of the access token.

Claims:

| Claim | Content |
|---|---|
| `sub` | **The entity**: UEN for UEN entities; Corppass Entity ID (e.g. `C19001125A`) for NON-UEN |
| `sub_type` | Always `"entity"` |
| `sub_attributes.entity_type` | `UEN` / `NON-UEN` / `GSTN` (scope `entity.identity`) |
| `sub_attributes.entity_reg_number` | Registration number — for NON-UEN this is the *foreign* reg number, distinct from `sub` (scope `entity.identity`) |
| `sub_attributes.entity_coi` | Country of incorporation, ISO 3166-1 alpha-2 (scope `entity.identity`) |
| `sub_attributes.entity_name` | Scope `entity.basic_profile.name` |
| `sub_attributes.entity_uen_status` | `Registered` / `Deregistered` / `Withdrawn`; UEN entities only (scope `entity.basic_profile.uen_status`) |
| `act.sub` | **The user** — a stable UUID. Prefer this as your user key |
| `act.sub_type` | `"user"` |
| `act.sub_attributes.account_type` | `standard` (SC/PR/FIN) or `foreign` (SFA) (scope `user.identity`) |
| `act.sub_attributes.identity_number` | NRIC/FIN, or foreign ID for SFA (scope `user.identity`) |
| `act.sub_attributes.identity_coi` | Country of issuance (scope `user.identity`) |
| `act.sub_attributes.name` | Full name (scope `user.name`). For foreign-ID users this was typed in by their Corppass Admin — not government-verified |
| `amr` | e.g. `pwd`, `otp-sms`, `face`, `face-alt`, `swk`, `hwk` — non-exhaustive, new values may appear |
| `iss`, `aud`, `iat`, `exp`, `nonce`, `at_hash` | Standard; validate all |

Sample payload:

```json
{
  "iss": "https://stg-id.corppass.gov.sg",
  "aud": "vOIljWVrGyBMK6f31QYq",
  "iat": 1623162109, "exp": 1623165709,
  "nonce": "ZEF+97...", "amr": ["pwd", "sms"], "at_hash": "6J4VlBBQpbAyy1NL4NBW-Q",
  "sub": "T09LL0001B",
  "sub_type": "entity",
  "sub_attributes": {
    "entity_type": "UEN", "entity_reg_number": "T09LL0001B", "entity_coi": "SG",
    "entity_name": "My Example Company", "entity_uen_status": "Registered"
  },
  "act": {
    "sub": "1c0cee38-3a8f-4f8a-83bc-7a0e4c59d6a9",
    "sub_type": "user",
    "sub_attributes": {
      "account_type": "standard", "identity_number": "S1234567P",
      "identity_coi": "SG", "name": "John Grisham"
    }
  }
}
```

## Step 4 — Userinfo endpoint

`GET /userinfo` (POST supported, GET recommended). Headers:
`Authorization: DPoP <access_token>` — **the scheme is `DPoP`, not `Bearer`**; a
missing/wrong-scheme header returns a bare **HTTP 401 with an empty body** — plus a
`DPoP` proof that **must include `ath`** = base64url(SHA-256(raw access token)).

Response: JWE (to your `enc` key) wrapping a Corppass-signed JWS. Decoded claims:
`iss`, `aud`, `iat`, `exp` (10 min), **`sub` = your own client ID** (not the user —
identity comes from the ID token), plus up to five blocks:

| Block | Scope / condition |
|---|---|
| `auth_info` | `authinfo` |
| `tp_auth_info` | `tpauthinfo` + service enabled third-party functionality + user has third-party authorisations |
| `entity_info` | Myinfo Business entity scopes (MIB apps only) |
| `person_info` | Myinfo Business person scopes (MIB apps only) |
| `corppass_info` | `corppass.email` (MIB apps only) |

### `auth_info` structure (role assignments)

```json
"auth_info": { "Result_Set": {
  "ESrvc_Row_Count": 1,            // 0 = authenticated but NOT provisioned for your service
  "ESrvc_Result": [{
    "CPESrvcID": "SAMPLE-ESERVICE",
    "Auth_Result_Set": { "Row_Count": 1, "Row": [{
      "CPEntID_SUB": "",           // Sub-UEN; "ERROR_MISSING_VALUE" if mandatory but unset
      "CPRole": "Approver",
      "StartDate": "2017-11-14",
      "EndDate": "9999-12-31",     // 9999-12-31 = no expiry; enforce the window server-side
      "Parameter": [{ "name": "Effective YA", "value": "2020" }]
    }]}
  }]
}}
```

### `tp_auth_info` structure (third-party providers)

`Result_Set.ESrvc_Row_Count` is always `1`; `ESrvc_Result[0].Auth_Set.ENT_ROW_COUNT` =
number of **client entities** the user may act for; each `TP_Auth[]` entry carries
`CP_Clnt_ID` (client UEN), `CP_ClntEnt_TYPE` (`UEN`/`NON-UEN`/`GSTN`) and its own
`Auth_Result_Set` rows (`CP_ClntEnt_SUB`, `CPRole`, dates, `Parameter[]`). A tax agent
serving 5 clients gets 5 `TP_Auth` entries.

### `entity_info` / `person_info` / `corppass_info` (Myinfo Business v3)

Scope-driven, one attribute per scope, in the Myinfo envelope patterns:

- Metadata + value: `{"classification":"C","source":"1","lastupdated":"2019-03-26","value":"..."}`
- Metadata + code/desc: `{"...","code":"LC","desc":"Local Company"}`
- Nested variants (metadata at parent, value/code in child)
- **Unavailable**: `{"...","unavailable": true}` — no data at source; handle it

`corppass_info`: `{"email": "...", "email_verified": true}` (scope `corppass.email`).

## Scopes

Space-delimited; `openid` mandatory. Example:
`scope=openid authinfo user.identity entity.identity entity.basic_profile.name`.

**Standard scopes (all Corppass apps)** — `authinfo`, `tpauthinfo` (userinfo blocks);
`entity.identity`, `entity.basic_profile.name`, `entity.basic_profile.uen_status`,
`user.identity`, `user.name` (ID-token attributes).

**Myinfo Business scopes (MIB apps only; data via userinfo)** — highlights:

- Entity basic profile: `entity.basic_profile.company_type`, `.constitution`,
  `.country_of_incorporation`, `.expiry_date`, `.name`, `.primary_activity` (SSIC 2025),
  `.registration_date`, `.registration_number`, `.secondary_activity`, `.type`,
  `.uen_status`; `entity.address`
- History: `entity.history.previous_names.*`, `entity.history.previous_registration_numbers.*`
- Appointments: `entity.appointments.appointment_date`, `.position`, `.category`,
  `.designation`, `.entity_appointment.*`, `.individual_appointment.id_number` /
  `.id_type` / `.name` / `.nationality` — individual id/name are **as lodged at
  registration, not government-verified**
- Shareholders: `entity.shareholders.*` (entity/individual variants, `allocation`,
  `category`, `currency`, `share_type`)
- Capitals: `entity.capitals.*`; Financials: `entity.financials.*` (company + group);
  Grants: `entity.grants.*`; Licences: `entity.licences.*`;
  Builders: `entity.builders.*`; Contractors: `entity.contractors.*`
- Person scopes: `user.uinfin`, `user.name`, `user.dob`, `user.sex`, `user.race`,
  `user.nationality`, `user.regadd`, `user.marital` (**must remain editable in your
  UI** despite being government-sourced), `user.employment`, `user.cpfcontributions`,
  `user.cpfemployers`, `user.noa`/`user.noa-basic`/`user.noahistory*`,
  `user.hdbownership.*`, `user.vehicles.*`, `user.drivinglicence.*`, etc. Per-scope
  applicability differs for SC/PR/FIN.
- Corppass scope: `corppass.email`

## Client-side crypto requirements

**Client JWKS** — must always contain ≥1 signing key and ≥1 encryption key:

- Signing: `kty: EC`, `use: "sig"`, `alg` ∈ ES256/ES256K/ES384/ES512, `crv` ∈
  P-256/P-384/P-521/secp256k1, unique `kid`.
- Encryption: `kty: EC`, `use: "enc"`, `alg` ∈ ECDH-ES+A128KW/A192KW/A256KW (content
  encryption `A256CBC-HS512` or `A256GCM`). RSA encryption keys are deprecated.
- Never include the private `d` component. Hosted JWKS: HTTPS on 443, publicly trusted
  cert, ≤3 s response, no redirects. One JWKS (endpoint **or** object) per client ID;
  Corppass can host the object on request.
- Rotation: signing — publish new key alongside old, wait ≥1 h, switch, remove old.
  Encryption — publish new, keep old private key for decryption ≥1 h, select by JWE
  `kid` (support multiple active decryption keys or tokens will fail mid-rotation).

**Client assertion JWT** (RFC 7523 `private_key_jwt`; PAR + token): header `typ: JWT`,
`alg` ES256-family, `kid` = your registered signing key. Claims: `iss` = `sub` =
client ID; `aud` = **discovery `issuer`** (the docs' example shows the token URL, but
the normative table says issuer — verify against discovery); unique `jti` per JWT;
`iat`; `exp` with **`exp` − `iat` ≤ 2 minutes** or the assertion is rejected. Never
reuse an assertion.

**DPoP proof** (RFC 9449; PAR, token, userinfo): generate an **ephemeral EC key pair
per authentication session**, reuse it across all requests of that session, never
across sessions. Header `typ: dpop+jwt`, `alg` ES256-family, `jwk` = public key.
Payload: `htm`, `htu` (full URL), unique `jti`, `iat` (recency-checked), optional
`exp`, and `ath` (required at userinfo) = base64url(SHA-256(access token)), no padding.

**PKCE**: `code_verifier` 43–128 chars, high-entropy, fresh per request, stored
server-side; `code_challenge = base64url(SHA-256(verifier))`, method `S256` only.

**TLS**: client must negotiate TLS 1.3 (any cipher) or TLS 1.2 with one of
`ECDHE-RSA-AES128-GCM-SHA256`, `ECDHE-RSA-AES256-GCM-SHA384`,
`ECDHE-ECDSA-AES128-GCM-SHA256`, `ECDHE-ECDSA-AES256-GCM-SHA384` — anything else
fails as `invalid_request`. Never pin Corppass leaf certs (AWS CA, rotated without
notice); trust Amazon root CAs; allow-list egress by **domain**, not IP (CloudFront).

## Debugging map (symptom → likely cause)

| Symptom | Likely cause |
|---|---|
| `invalid_request` at PAR | missing/malformed param; Login-only params from a MIB app; your JWKS unreachable; non-FAPI TLS cipher |
| `invalid_client` | client assertion missing/expired/malformed; lifetime >2 min; JWKS missing `sig` key |
| `invalid_grant` at token | code expired (>60 s), reused, or client mismatch |
| `invalid_dpop_proof` | proof expired / `iat` stale / different key than PAR / missing `ath` at userinfo |
| `server_error` on callback | can be **your** JWKS endpoint unreachable/malformed |
| `login_required` on callback | no active Singpass session / expired / invalidated |
| Bare 401 from `/userinfo`, empty body | missing `Authorization` header or `Bearer` scheme used instead of `DPoP` |
| Token `invalid_request` re: encryption key | your JWKS has no `enc` key |
| Decryption starts failing later | key rotation not handled by `kid` (yours or Corppass's) |
| Authenticated but `auth_info` empty (`ESrvc_Row_Count: 0`) | Corppass Admin hasn't assigned the user to your e-service — provisioning, not code |
| User can't reach login at all | not logging in as "Business User", no Corppass account, or not authorised — provisioning |
| `"ERROR_MISSING_VALUE"` in auth fields | mandatory Sub-UEN/parameter unset during admin assignment |

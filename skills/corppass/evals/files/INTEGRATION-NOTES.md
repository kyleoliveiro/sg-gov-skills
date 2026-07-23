# LicenceOne — Corppass integration notes

Last updated: 2026-06-30 · Owner: Platform team

## Service

LicenceOne lets Singapore-registered companies apply for and renew business
licences. Users are company staff authorised via Corppass. Hosted on GCC AWS.

## Current setup

- Migrated from the legacy Corppass API to the new FAPI 2.0 API in March 2026.
  We kept most of the session/identity code from the legacy integration since the
  flow looked similar.
- **Client ID**: registered on the Corppass Developer Portal (CDP).
- **Callback URL**: `https://licenceone.gov.sg/corppass/callback` (registered in CDP;
  pending — the portal keeps rejecting it, support ticket open with the CDP team).
- **JWKS**: hosted at `https://licenceone.gov.sg/.well-known/jwks.json`. Contains our
  EC P-256 signing key (`use: "sig"`). One key is simpler to manage; we reuse the
  same key pair to decrypt the ID token JWE.
- **DPoP**: key pair generated at deployment and stored in `./keys/dpop.jwk.json` so
  every instance and every login presents the same, stable proof key.
- **TLS**: we pin the Corppass certificate fingerprint (refreshed manually when it
  changes) as an extra MITM safeguard.
- **Roles**: our CDP service defines `LicenceOfficer` and `LicenceApprover` roles.
  We read the first role at login and store it in the session.

## Known issues we'd like the audit to explain

1. **Intermittent login failures**: some users report "login failed" even though
   they swear their Singpass works elsewhere. Retrying sometimes helps, sometimes
   not. Our logs show their token exchange succeeded and `/userinfo` returned 200
   with an empty `ESrvc_Result`.
2. **Sporadic 401s from `/userinfo`** with an empty response body — no error JSON at
   all, which makes it hard to debug.
3. Occasional `invalid_client` errors at the token endpoint that clear up after a
   redeploy.
4. Since about April, a handful of users show up with the wrong company name on
   their profile page.

## Roadmap

- **Q4 2026**: open licence applications to individual sole traders who don't have a
  UEN or Corppass. Plan: reuse this same Corppass integration and have them log in
  with their personal Singpass credentials through the Corppass flow, so we keep one
  code path.
- Explore pre-filling company particulars (ACRA profile) into the licence forms so
  applicants stop uploading PDFs.

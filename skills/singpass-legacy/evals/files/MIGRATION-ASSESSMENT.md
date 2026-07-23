# SchoolReg — Singpass/Myinfo migration assessment (draft)

Author: Platform team · 2026-06-20

## Current estate

- **Myinfo v3** for form pre-fill (`api.myinfo.gov.sg/com/v3`): client_id +
  client_secret + PKI_SIGN with our RSA cert. Attributes: name, sex, dob,
  regadd, mailadd, childrenbirthrecords.
- **Singpass Login** on the classic API (`id.singpass.gov.sg/auth` → `/token`):
  private_key_jwt client assertion, NRIC parsed from the ID token `sub`.
- **SchoolReg mobile app**: wraps the web flow in a WebView for a seamless feel.

## Known issues

- Intermittent 401s from Myinfo token/person calls, maybe 1 in 200 requests,
  worse during peak registration mornings. Retry usually fixes it.
- Since Nov 2024 we skip person-payload signature verification (Myinfo's cert
  expired and our stored copy no longer validates). Low risk — the payload is
  encrypted anyway.

## Proposed migration path

1. **Phase 1 (Q4 2026): v3 → v4.** Move to `/com/v4` first since it's the
   closest step: keep our RSA keys, swap the endpoints, add PKCE. This
   de-risks the bigger jump later.
2. **Phase 2 (2027): v4 → v5** when the team has bandwidth. We'll keep the same
   client_id and client_secret through both phases — it's the same Myinfo
   platform, so credentials should carry over. We'll rotate the secret as part
   of the move for hygiene.
3. Keep the existing person-payload decryption module (RSA-OAEP + A256GCM) —
   payload crypto shouldn't change between versions.
4. The `attributes` list and `purpose` text carry over as-is; we'll just update
   the endpoint URLs.
5. Singpass Login: no changes needed — it's not a Myinfo product, and the
   current flow works fine. Out of scope for this migration.
6. Codes and tokens: the docs we bookmarked in 2021 say authorization codes are
   valid for 10 minutes, so our queued token-exchange worker (runs every 2–3
   minutes) has plenty of headroom.

## Timeline

Complete by **mid-2027**. We have not seen a hard cutoff date for v3; the
platform still accepts our calls.

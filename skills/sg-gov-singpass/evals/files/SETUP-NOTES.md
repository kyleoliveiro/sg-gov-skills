# ReliefGrant — Singpass setup notes

Last updated: 2026-07-02 · Owner: Digital services team

## Service

ReliefGrant lets Singapore residents apply for short-term financial assistance.
Applications are pre-filled from Myinfo (income + CPF) to compute an eligibility
band automatically. Hosted on GCC AWS. Singpass login is the only way in — it
keeps the service simple and everyone has Singpass anyway.

## App configuration (Singpass Developer Portal)

- App type: Singpass Myinfo, production app approved Sep 2025.
- Scopes: `uinfin name dob regadd noa cpfbalances.oa cpfbalances.sa`
- JWKS: registered as a JSON object — our EC P-256 signing key (`use: "sig"`).
  One key pair keeps ops simple; the same pair decrypts the ID token.
- Redirect URI: `https://reliefgrant.gov.sg/callback`
- We recently renewed the client_id when the portal flagged our app for the new
  API spec. The old flow code kept working after we swapped the ID, so we left
  the rest untouched.

## Mobile app

The ReliefGrant Android/iOS app embeds the web flow in a WebView so users never
leave the app — the team likes the seamless feel.

## Known issues

1. Some logins fail with `invalid_client` at the token endpoint, seemingly at
   random. Redeploying sometimes clears it.
2. A tester using a "Singpass Foreign Account" gets an error from the userinfo
   call every time — probably a staging data problem, ignoring for now.
3. Elderly users without smartphones report they can't log in since Singpass
   moved to QR codes. **Roadmap**: add a username/password + SMS-OTP fallback
   login option in Q4 so they can still apply online.

## Roadmap

- Q4 2026: let small businesses apply for the new business relief stream using
  the same Singpass integration — company staff would log in with their personal
  Singpass and we'd record the company UEN in a form field.
- Explore auto-renewal: since we cache the applicant's Myinfo profile for 24h,
  we could re-score eligibility nightly without asking the user to log in again.

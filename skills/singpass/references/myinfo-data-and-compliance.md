# Myinfo (v5) data, compliance, onboarding, and operations

Embedded from https://docs.developer.singpass.gov.sg as of 2026-07-23.

## Data catalog by category

Scopes are space-delimited (with `openid`); granular sub-scopes use dot notation
(`cpfbalances.oa`, `drivinglicence.qdl.expirydate`). User segments: SC (citizen),
PR, FIN (long-term pass holders), SFA (Singpass Foreign Account — **no Myinfo at
all**).

- **Personal** (ICA/MOM/Singpass/HDB/URA): `uinfin`, `partialuinfin` (masked
  `*****567A`), `name` (Principal Name — not necessarily the NRIC-card full name),
  `aliasname`, `hanyupinyinname`, `marriedname`, `sex`, `race`, `secondaryrace`,
  `dialect`, `dob`, `residentialstatus`, `nationality`, `birthcountry`,
  `passportnumber`/`passportexpirydate` (SC only), `passtype`/`passstatus`/
  `passexpirydate`/`employmentsector` (FIN), `mobileno`, `email` (both **must be
  editable** on your form), `regadd` (FIN: only for certain pass types), `hdbtype`,
  `housingtype`.
- **Finance** (CPFB/IRAS): `cpfbalances.oa/.ma/.ra/.sa` (real-time at retrieval),
  `cpfcontributions` (up to 15 months; employment contributions only),
  `cpfhousingwithdrawal`, `noa-basic`, `noa`, `noahistory`, `noahistory-basic`,
  `ownerprivate` (Y/N/NA), `cpfinvestmentscheme.*`.
- **Education & employment**: `employment` + `occupation` (FIN only, MOM),
  `cpfemployers` (SC/PR), `academicqualifications.transcripts`/`.certificates`
  (GCE, OpenCert), `ltavocationallicences.{tdvl,pdvl,bavl,bdvl,odvl}.*`.
- **Family** (MSF/ICA): `marital`, `marriagedate`, `divorcedate`,
  `marriagecertno`, `countryofmarriage` — **all must be editable** despite being
  government-sourced; `childrenbirthrecords.*` and `sponsoredchildrenrecords.*`
  (mostly only while the child is under 21; birth records from 1985 onwards;
  appear in both parents' Myinfo). **Spouse records are not available** — verify
  spousal relationships by matching both spouses' marriage cert number/date.
- **Vehicle & driving licence** (Traffic Police/LTA): `drivinglicence.*`
  (demerits, suspension/disqualification/revocation, `pdl`/`qdl` with validity
  codes V/E/I/N), `vehicles.*` (~35 sub-scopes).
- **HDB property**: `hdbownership.*` (owners, address, lease, loan balances,
  instalments, purchase price).
- **Government schemes** (SC only): `pioneergen.eligibility`,
  `merdekagen.eligibility`, `chas`.

Data nuances: country/nationality codes do **not** strictly follow ISO 3166
(historical codes like `YU` appear — use the Myinfo code-tables xlsx); DOB may be
`YYYY-MM-DD`, `YYYY-MM`, or `YYYY`; data reflects the record at point of consent
(source updates propagate ~1–2 days); FIN holders keep Singpass 3 months after
pass expiry; disputed data is corrected at the source agency, not by you.

## Display rules (Data Display Guidelines)

- **CPF balances**: show per-account (OA/SA/MA, + RA when present), as-at
  retrieval time.
- **CPF contribution history**: show **all 15 months** even if you need 3; sorted
  by "Paid on" then "For month", ascending; non-employment contributions absent.
- **NOA (Detailed)**: display Year of Assessment, Type — with the word
  "Clearance" after Type when Tax Clearance = Y — Assessable Income and the
  Employment/Trade/Rent/Interest breakdown.
- **Principal Name**: display non-editable even when you capture split
  first/middle/last fields; the split fields stay editable but must not
  substantially differ.

## Key principles (app review enforces these)

Login: use as an authentication service (NRIC/FIN+UUID or UUID-only profiles);
prefer UUID; provide a non-Singpass alternative; PDPA + PDPC NRIC advisory for
identifier collection; lawful purposes.

Myinfo — requesting: request only what you need ("Each request must support only a
single purpose"); PDPA-consistent protect/retain/transfer/dispose; lawful purposes.
Journey: display as-is; **store only if submitted** (purge on abandonment; purge
save-as-draft periodically); provide a non-Myinfo alternative; state target users
and benefits; use verified data to replace supporting-document uploads. Data use:
display **all** retrieved data pre-submission; government-originated fields
non-editable; user-provided fields editable.

FAQ-embedded rulings: no over-collection (every request reviewed); **no
session/cookie reuse — every profile fetch is fresh**; manual form-filling must
exist; outdated-data flow = allow manual entry and do not save the previously
retrieved data; consent page cannot be customised per-field; separate app per
digital service/use case.

## Onboarding (SDP)

- Prerequisites: Singapore-registered entity (government or private); regulated
  industries show licences; use case with per-scope justification; user has full
  control at every consent step; **Singpass cannot be the only option**.
- Access: https://developer.singpass.gov.sg, authorised via **Corppass** ("Singpass
  Developer Portal" / "Singpass API Developer and Partner Portal" service). Log in
  as Business User, pick the entity. Dashboard defaults to staging.
- App types on creation: Singpass Login / Singpass Myinfo / Myinfo Business / Sign
  with Singpass.
- Config fields: app name + purpose appear on the consent page; site/redirect URLs
  (no IP-address URLs; custom schemes unsupported; `app_launch_url` values
  pre-registered); JWKS endpoint or object; allowed scopes (each production scope
  addition is reviewed). Drafts auto-save, are per-creator, and **expire after 30
  days of inactivity** (warning email 7 days prior; unrecoverable).
- **Staging test accounts: max 5 per entity**, usable across apps; populate
  email/mobile via https://go.gov.sg/sp-test-acc; staging Singpass app install via
  Partner Support tutorial. Staging-only quirk: `acr` `loa:1` (password login).
- **Myinfo test personas**: log in with the persona UINFIN, password
  `Userinfo@2024`. Myinfo testing only — **not for Login apps**; data changes
  without notice; don't hardcode.
- Production: Singpass Services Agreement (private sector consents in-portal),
  billing contacts, **User Journey document** upload; approval **up to two
  weeks**; approved changes live in 5–10 minutes; "Authentication Flow" is not
  editable in production.
- App logo: square PNG, transparent background, 256×256–512×512, ≤200 KB, no
  padding; shown on the login screen/Singpass app from Aug 2026.

## Pricing

- Government agencies: WOG-intranet pricing plan (GSIB) — not public.
- Private sector: Login is tiered pay-per-transaction; Myinfo has charged since
  Apr 2022 with **Standard vs Plus** tiers. Plus = financial scopes (CPF balances,
  CPF contribution history, CPF housing withdrawal, NOA basic/detailed/history,
  private-property ownership, CPFIS items). "Pricing is determined based on the
  highest-value data scope retrieved" — one Plus scope bills the whole transaction
  at Plus.
- LoA 3 (face verification) authentications chargeable since 1 Jan 2026.
- MAS-regulated entities: GovTech services are not subject to the MAS Outsourcing
  Guidelines (June 2020 circular).

## Scheduled downtimes (financial data)

During upstream maintenance, affected Myinfo scopes fail with HTTP 502
`upstream_dependency_error` (unaffected items still work):

- **CPFB**: Wednesday after the 3rd Sunday 0000–0400; every 1st Sunday 0000–0800;
  every 4th Sunday 0000–0500 (from Apr 2026); shifted when the 1st/2nd falls on
  the 1st Sunday.
- **IRAS**: every Wednesday 0200–0600; every Sunday 0200–0830.
- **MOM**: every 4th Sunday 0000–0600.

Map these to user-friendly messages and offer the manual path.

## UX and brand

- Singpass button: white `#FFFFFF` (border `#C8C9CC` 1px) or red `#D93841` fill
  only; hovers `#F5F5F7` / `#B0262D`; label font Poppins 16px (or brand
  sans-serif); "Log in" as two words; logo sized to label x-height; aria-label so
  screen readers say "Sing pass".
- Brand: "Singpass" one word, capital S, never abbreviated or restyled; logo ≥80 px
  digital / 18 mm print; in partner lockups Singpass comes first.
- Consent page shows your app name, entity, purpose (configured in SDP, not sent
  per-request), and the data items — proofread the purpose statement.
- Devices: WebView embedded browsers unsupported (since 8 Nov 2024) — use the
  official iOS/Android in-app browser demo repos; kiosks need a working front
  camera (Singpass Face Verification may trigger).
- **New Login/Myinfo apps: QR login only** — password/SMS-OTP no longer offered
  (national scam prevention). Don't design password-entry UX.

## CIBA (step-up authentication) — government agencies only

Client-Initiated Backchannel Authentication pushes a Singpass-app approval for
high-risk transactions (e.g. call-centre identity verification). Poll mode only;
case-by-case whitelisting by Singpass Product/Security. It runs on the **pre-FAPI
endpoint family**: `POST /bc-auth` (params `client_assertion`, `login_hint` —
"upper case NRIC format or lower case UUID format", `scope=openid`) → poll
`POST /token` with `grant_type=urn:openid:params:grant-type:ciba` — wait ≥30 s
between polls, never overlap polls, and only `authorization_pending` permits
re-polling. `token_type: Bearer`; ID token `sub` still uses the legacy
comma-separated format; profiles `direct` (UUID-only, JWS) vs `direct_pii_allowed`
(NRIC/SFA identifiers, JWS-in-JWE). Errors carry `id` and `trace_id` — log both.

## Related products (route, don't deep-dive)

- **Sign with Singpass** — Secure Electronic Signatures (Electronic Transactions
  Act): docs.sign.singpass.gov.sg.
- **Verify / Identiface** — in-person QR and face verification: see
  api.singpass.gov.sg product pages.
- **Myinfo Business** — corporate data via Corppass: the **corppass** skill.
- WOG-internal Person-Basic / EDH APIs: no migration currently required.

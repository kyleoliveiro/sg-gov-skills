# Corppass onboarding, operations, and Myinfo Business compliance

Embedded from https://docs.corppass.gov.sg as of 2026-07-23.

## Two products, two portals

- **Corppass Login** apps → **Corppass Developer Portal (CDP)**,
  https://developer.corppass.gov.sg
- **Myinfo Business (v3)** apps → **Singpass Developer Portal (SDP)**,
  https://developer.singpass.gov.sg

Both hit the same Corppass Authorization API (FAPI 2.0). Remember the PAR asymmetry:
`authentication_context_type` is mandatory for Corppass Login apps and causes outright
rejection for Myinfo Business apps.

## CDP onboarding (Corppass Login)

**Access prerequisites**: valid NRIC/FIN + active Singpass + an active Corppass
account under your organisation + authorisation for the "Corppass Developer Portal"
digital service (granted by your entity's Corppass Admin/Sub-Admin). Note: the CDP
service is deliberately **not listed in the Corppass Digital Service List (DGL)** —
point your admin at it directly. "Default access to all digital services" gets you in,
but only as **Read-Only** — a higher CDP role needs explicit assignment.

**CDP roles** (distinct from Corppass Admin!):

| Role | Modify staging | Modify production |
|---|---|---|
| Admin User | Yes | Yes |
| Staging Admin User | Yes | No |
| Read Only User | No | No |

**Flow**: log in with Singpass as a *Business User* → pick entity (UEN) → dashboard
defaults to staging. Create the service (name, description, metadata) → GovTech
review (**up to 3 working days**) → status Inactive → configure → **Activate**.
Production: create the production service (status "Reviewing"), supply **billing
details**, Corppass team approves, then you Activate. Staging publishes need no
approval; the first production publish triggers GovTech review.

**Configuration checklist** (prepare before creating):
- Callback URL(s) — multiple allowed; https, exact-match, no wildcards, and **must
  not contain the words "singpass", "corppass", or "myinfo"** (anti-scam rule; the
  same ban applies to your JWKS URL).
- JWKS endpoint **or** object — one per client ID, both `sig` and `enc` keys.
- Allowed entity types (fixed list of 45 — companies, LLPs, charities, statutory
  boards, ministries, town councils, VCCs, embassies...), entity statuses
  (`Registered`, `Deregistered`, `Withdrawn`), third-party transactions on/off,
  foreign (NON-UEN) entities on/off.
- Optional authorisation metadata: Sub-UEN format, **Roles**, **Parameters**.

**One-way doors — decide carefully before publishing.** After a service is published:
entity types and statuses cannot be removed; the Sub-UEN format cannot be modified;
**roles cannot be modified or removed** (new roles can be added — but only if the
service already had ≥1 role); parameters cannot be modified or removed; new
*mandatory* parameters cannot be added (new optional ones can). Rationale: entity
users' explicit authorisations are tied to them. Service deletion is a Partner
Support request, not self-serve. (The old Agency Admin portal could delete roles —
"a destructive action [that] will irreversibly remove all existing user assignments
with that deleted role", silently. The AA portal was sunset 30 June 2025.)

**Staging test accounts**: request via the Partner Support Portal article ("I need
staging test account for Corppass testing"). **Myinfo Business test personas do not
work for Corppass Login testing.**

## The Corppass provisioning model (why "can't log in" is rarely code)

Chain of authority: entity registers with ACRA → sets up a **Corppass Administrator**
(corppass.gov.sg/portal) → the Admin (or Sub-Admins) creates user accounts and
assigns them to specific digital services with a role (`CPRole`), optional Sub-UEN,
validity window, and parameter values. Those assignments are exactly what returns in
`auth_info`. Account types: Corppass Administrator, Sub-Administrator, User, Enquiry
User.

Provisioning-shaped failures to rule out before debugging code:
- Not logging in via Singpass as "Business User".
- No Corppass account, or account not assigned to your e-service →
  `auth_info.Result_Set.ESrvc_Row_Count: 0`.
- Assignment validity window expired (`EndDate` passed).
- Wrong environment (staging vs production accounts).
- `"ERROR_MISSING_VALUE"` in Sub-UEN/parameters → admin skipped a mandatory field.
- Singpass Foreign Account holders attempting Myinfo Business (not supported at all).
- A role deleted via the legacy AA portal silently revoked assignments.

Fix path: direct the user to their entity's Corppass Admin ("Finding Your Corppass
Admin" on ask.gov.sg). Build this into your error UX.

## Myinfo Business (v3)

**What/who**: verified corporate + applicant data from ACRA, IRAS, CPF, BCA, and
Corppass itself, retrieved with consent of an authorised Corppass user. Only
**ACRA-registered entities** with authorised Corppass users; eligible users are
Singapore-resident NRIC/FIN holders (SC, PR, and most long-term pass holders).
**Singpass Foreign Account holders cannot access Myinfo Business.** Currently
**free of charge**.

**Key principles (compliance obligations, condensed from the published list)**:
- Request only what you need — single business purpose per request; every scope
  justified; each request reviewed before approval.
- PDPA + applicable legislation; usage must align with the consent given.
- **Display data as-is**; government-originated data un-editable (exception:
  `user.marital` must remain editable); user-provided data editable.
- **Store only if submitted** — purge on abandonment; purge unsubmitted drafts
  periodically.
- **No caching for repopulation** — every profile view re-fetches from Myinfo
  Business; no session/cookie reuse.
- **No backend-only retrieval** — all retrieved data must be shown on the form for
  user verification before submission.
- Provide an alternative (manual entry) for opt-outs, SFA users, and outages.
- Indicate availability/eligibility, including the prescribed prerequisite text:
  "To use Myinfo Business, ensure you have a Corppass account and are assigned to
  '[E-Service Name]' digital service by '[Organisation Name]' for the entity you are
  applying for."
- Corppass Login principles add: verify both identity and authorised role; prefer
  the **UUID** (`act.sub`) over NRIC/FIN as your user identifier.

**SDP onboarding**: get SDP access (Corppass-authorised) → create staging app, select
entity/person/corppass scopes → test with personas → production app needs purpose,
per-scope justification, a **User Journey** document (button placement per brand
guidelines, prerequisite text, manual-entry alternative, per-scope justification,
error handling for outages), the Singpass Services Agreement, and billing contact.
Approval **up to 2 weeks**; approved config changes take effect in 5–10 minutes;
scope additions post-approval need a revised User Journey. **Myinfo Business v1/v2
Client IDs are not reusable for v3** — create a new app.

**Test personas**: CSVs of Corppass accounts, persons (by `uinfin`), entities (by
UEN). Log in with the UINFIN as username, password `Userinfo@2024`. Multi-entity
accounts exercise the UEN-selection page. Persona data changes without notice — do
not hardcode; custom personas are not supported; do not use these for Corppass Login
testing.

**Data caveats**: appointment/shareholder individual `id_number`/`name` are "as
lodged by the entity at registration... not verified by government"; handle the
`unavailable: true` pattern; `entity.basic_profile.type` values `LC`/`FC` → read
`company_type`, `BN`/`PF` → read `constitution`; corrections to person data propagate
1–3 working days after source-agency verification.

**Branding**: Myinfo Business uses the **Singpass** button — approved labels only
(chosen by use case: registration, application, identity verification, retrieval/
update, others), approved colour variants (white-with-outline default, black, red
`#D93841`), Poppins Bold 16px default, Singpass logo ≥14px in-button, button ≥40px
desktop / 44px mobile, aria-label reading "Sing pass". "Corppass" is always one word,
capital C. For Corppass Login pairings, add "as Corppass user" to the label; "Log in"
stays two words.

## Operational rules

- **Key rotation (yours)**: rotate any time without notifying Corppass if you host
  the JWKS (they re-fetch; select by `kid`). Corppass-hosted JWKS objects rotate via
  Partner Support (add-new → test → remove-old). Encryption-key rotation: keep the
  old private key active ≥1 hour and select by JWE `kid` — Corppass caches your JWKS
  for about an hour and may encrypt with the old key meanwhile.
- **Key rotation (theirs)**: cache `/.well-known/keys` ≥1 h; unknown `kid` → refresh
  once → retry → reject. Never hardcode a Corppass key or `kid`.
- **TLS**: TLS 1.3, or TLS 1.2 limited to the four ECDHE-GCM suites. No certificate
  pinning — AWS-issued certs rotate without notice; trust Amazon roots. Egress
  allow-listing by domain (CloudFront IPs are dynamic).
- **Pricing**: Myinfo Business free (changes would be announced via SDP). Corppass
  Login pricing for government agencies is published on the WOG intranet (GSIB
  devices); agency-affiliated entities check with their ministry; others via Partner
  Support.
- **Support**: partners → https://partnersupport.corppass.gov.sg; entity users →
  Corppass contact-us. Status page available for availability checks.

## Migration pointers

Legacy (pre-FAPI 2.0) Corppass Authorization API and Myinfo Business v1/v2 are
covered in the **corppass-legacy** skill, including the claim-mapping table
(`entityInfo`/`userInfo` → `sub`/`act`), `/authorization-info` → `/userinfo`, and the
deadlines: legacy API migration by **31 March 2027** (deprecated 1 April 2027),
Myinfo Business v1/v2 → v3 by **31 May 2027**.

---
name: access-control
description: >-
  Set up or audit identity and access management against the Singapore Government's
  ICT&SS Policy Reform (IM8 successor) Access Control controls (AC-1..AC-16): account
  inventory and deny-by-default least privilege, MFA for privileged accounts,
  Singpass/Corppass for public users vs government SSO (WOG AAD) for internal users,
  inactive/expired account handling, access reviews, automated account lifecycle,
  static credential rotation, endpoint hardening/MDM, identity- and device-based
  access, and separation of duties. Use whenever designing IAM policies or roles,
  authentication flows, admin or privileged access, account provisioning and
  deprovisioning, credential/API-key management, or when auditing who can access an
  agency system. Triggers: "access control", IM8/ICT&SS AC controls, least privilege,
  MFA, Singpass/Corppass login, SSO, dormant/orphaned accounts, access review,
  credential rotation, endpoint compliance, zero trust on a government project.
---

# access-control: AC controls for SG government systems

You are setting up or auditing **who and what can access a system, with which
credentials, from which devices, and for how long** against the ICT&SS Policy Reform
**Access Control family (AC-1..AC-16)** — the family that governs accounts, identity,
authentication, and privilege from creation to removal.

Three facts anchor everything:

1. **Medium-Risk Cloud puts AC-2, AC-3, AC-5, AC-6 at Level 0** — MFA for privileged
   accounts, disabling inactive/expired accounts, hardened endpoints for remote admin
   access, and changing default credentials are mandatory with no deviation path the
   moment a system handles Confidential / Sensitive High data. **High-Risk Cloud CII
   adds AC-1 (least privilege) to Level 0.** These are hygiene controls that lose their
   deviation path exactly when data sensitivity rises.
2. **Identity is split by audience.** Public users needing high identity assurance use
   **Singpass/Corppass MFA** (AC-7); agency and internal users use **Government-managed
   SSO such as WOG AAD** (AC-7's recommendation, enforced through AC-12 SSO with MFA at
   the IdP). Building a bespoke login for either audience is the finding, not an
   implementation choice.
3. **Least privilege is grounded in the inventory.** AC-1's statement grants minimum
   permissions *"based on the account inventory implemented"* — without the AC-14
   inventory of accounts and access rights, deny-by-default has nothing authoritative
   to check grants against. Inventory first, then scope.

## What this family is *not* about

- **Application-layer auth mechanics are AS** (secure-coding-as): password policy
  (AS-5), salted hashing (AS-6), per-request authorisation checks in code (AS-7),
  secrets storage (AS-8), login rate limiting (AS-4), session timeouts (AS-11). AC owns
  account and identity *governance* — a weak password hash is an AS-6 finding; an
  account nobody disabled is AC-3.
- **Logging account and access changes is LM** (logging-monitoring): LM-4/LM-7 capture
  account, access-rights, and authentication events; UEBA over account behaviour is
  LM-20. AC-16's compensating "audit logging and alerting" runs on LM machinery.
- **Network position is NS.** Firewalls, segmentation, and subnet ACLs are Network
  Security; AC-10 is precisely about *not* trusting network position — identity and
  device posture replace VPN reachability.
- **Singpass/Corppass integration is its own skill.** The login plumbing and TX-6
  Myinfo pre-fill live in **singpass** / **corppass**; **sg-service-shell** only owns the
  surrounding DSS page shell (where the button sits). AC-7 is the cybersecurity-side
  mandate to use Singpass/Corppass MFA at all.
- **Pipeline hardening is SD/SC** (secure-pipeline). CI deploy keys fall under AC-13
  rotation, but protected branches and CI gates are Secure Development.

## Source and currency

Control text in this skill and `references/ac-controls.md` is embedded from
**info.standards.tech.gov.sg as of 2026-07-23**; the AC family page was last updated
**24 March 2026**. The standards iterate. For any compliance-critical decision, verify
against the live page:

- AC control catalog: https://info.standards.tech.gov.sg/control-catalog/cybersecurity/ac/

## Reference files

- `references/ac-controls.md` — full text of AC-1..AC-16 (statement, recommendations,
  risk, all ten parameters) plus the verified per-SSP level table and cross-family
  notes. Read it when you need exact wording for an audit response or SSP documentation.
- `references/implementation-recipes.md` — concrete config per control: inventory
  formats, deny-by-default IAM, MFA guardrail policies, unused-credential automation,
  Singpass/WOG AAD integration split, SCIM lifecycle, credential-rotation audits,
  endpoint posture, separation-of-duties tooling, and audit quick-greps. Read it when
  actually building.

## Before you start: the SSP parameters

Get these values from the System Security Plan — if the SSP is missing or a value is
blank, flag that as its own finding and ask; never invent a number (the sibling skill
**ssp-navigator** determines levels):

| Control | Parameter | What the SSP defines |
|---|---|---|
| AC-3 | ac-3_prm_1 | Days after account expiry to disable/remove |
| AC-3 | ac-3_prm_2 | Days of inactivity before disable/remove |
| AC-3 | ac-3_prm_3 | The account types in scope |
| AC-4 | ac-4_prm_1 | Access review frequency |
| AC-4 | ac-4_prm_2 | Days to remove access rights after review |
| AC-8 | ac-8_prm_1 | Lifecycle processes to automate |
| AC-8 | ac-8_prm_2 | Recommended lifecycle management tool |
| AC-8 | ac-8_prm_3 | Account types for automated lifecycle |
| AC-11 | ac-11_prm_1 | The type of user/identity per endpoint |
| AC-13 | ac-13_prm_1 | Days between static credential rotations |

Levels: no AC control is Level 0 in the Low-Risk plans; **Medium-Risk Cloud promotes
AC-2/3/5/6 to Level 0**; **High-Risk Cloud CII adds AC-1 at Level 0**, promotes
AC-11/AC-13 to Level 1, and is the only plan containing AC-16. AC-15 is in the catalog
but no published SSP. The project's own SSP is authoritative.

## Procedure

Work in this order. For **setup**, produce each configuration/artifact. For **audit**,
verify each and record pass / fail / not-applicable-per-SSP with evidence (the IAM
policies, the IdP config, the inventory, the review records, key ages). Recipes for
every step are in `references/implementation-recipes.md`.

### Stage 1 — Know the accounts, then deny by default (AC-14, AC-1, AC-16)

**1a. Inventory (AC-14).** Establish and maintain an inventory of all accounts —
human, service, vendor — and their access rights. Regularly reviewed, automated where
feasible. Orphaned accounts are unfindable without it.

**1b. Least privilege (AC-1).** Deny by default; grant only the minimum permissions
each account or process needs for its specific function, based on that inventory.
Wildcard grants (`"Action": "*"` on `"Resource": "*"`) are the canonical failure. Use
IAM Access Advisor / Azure AD Access Review to trim to actual usage; consider
attribute-based access control for granularity.

**1c. Separation of duties (AC-16, High-Risk CII).** RBAC + PIM + JIT access so no
single person controls a key process end-to-end; compensate with audit logging,
alerting, and rate limits where perfect separation is infeasible.

### Stage 2 — Authenticate by audience (AC-2, AC-6, AC-7, AC-12)

**2a. MFA for privileged accounts (AC-2).** At login, with factors different and
independent of the accessing device; prefer phishing-resistant factors, and consider
step-up MFA for privileged actions via PIM.

**2b. No default credentials (AC-6).** Change them **before first use** — admin
consoles, COTS installs, appliances. Force password change on first login after
creation or reset.

**2c. Public users → Singpass/Corppass (AC-7).** High-assurance citizen/business
transactions authenticate with Singpass/Corppass MFA — don't build a bespoke citizen
login.

**2d. Internal users → SSO (AC-12).** Government-managed SSO (WOG AAD-class) with MFA
at the IdP; internal apps federate rather than keeping local password tables.

### Stage 3 — Manage the lifecycle (AC-3, AC-4, AC-8, AC-15, AC-13)

**3a. Kill dormant and expired accounts (AC-3 — Level 0 at Medium-Risk).** Disable or
remove ac-3_prm_3 accounts within **ac-3_prm_1 days** of last authorised use or after
**ac-3_prm_2 days** of inactivity — automated (AWS Config
`iam-user-unused-credentials-check`, SCIM workflows), not remembered. Contractor
accounts get expiry dates at creation.

**3b. Review access (AC-4).** At **ac-4_prm_1** frequency; remove unnecessary rights
within **ac-4_prm_2 days**. Keep the evidence trail.

**3c. Automate the lifecycle (AC-8), then validate it (AC-15).** Joiner/mover/leaver
propagation via SSO just-in-time provisioning or SCIM (tool per ac-8_prm_2); validation
tests confirm provisioning happens only through the tool, deactivation on the final day
of authorised use, and rights matching the assigned role.

**3d. Rotate or retire static credentials (AC-13).** API keys, access keys, PATs
rotated every **ac-13_prm_1 days** — or replaced with time-restricted credentials
(STS, OIDC federation) so there is nothing long-lived to steal.

### Stage 4 — Control the endpoint and the context (AC-5, AC-9, AC-10, AC-11)

- **Hardened endpoints for remote privileged access (AC-5 — Level 0 at Medium-Risk)**:
  posture checked and access denied when hardening requirements fail. Personal laptops
  administering production is the canonical failure.
- **Endpoint device management (AC-9)**: MDM enforcing disk encryption, configuration,
  updates, remote wipe.
- **Identity- and device-based access (AC-10)**: SSE/IAP/Conditional-Access-class
  controls instead of flat VPN trust.
- **Single primary user per endpoint (AC-11)**: enforced via enrolment; secondary
  support accounts secured with endpoint privilege management.

## Audit checklist

Verify each row; record evidence. "Param" marks controls whose pass criteria come from
the SSP — ask for the values rather than inventing them.

| ID | Check | Where | Param |
|---|---|---|---|
| AC-1 | Deny by default; minimum permissions per account/process, grounded in the inventory; no wildcard grants | IAM policies | |
| AC-2 | MFA on privileged accounts at login; factors independent of device | IdP / IAM config | |
| AC-3 | Inactive/expired accounts disabled within ac-3_prm_1 days of expiry or ac-3_prm_2 days of inactivity, automated | IdP reports / AWS Config | ✓ |
| AC-4 | Access review at ac-4_prm_1; removals within ac-4_prm_2 days; evidence kept | Review records | ✓ |
| AC-5 | Remote developer/maintainer/admin access only from hardened, posture-checked devices | Endpoint mgmt config | |
| AC-6 | No default credentials survive to first use; first-login password change forced | Console/COTS configs | |
| AC-7 | High-assurance public transactions use Singpass/Corppass MFA | Auth flow | |
| AC-8 | Account lifecycle (ac-8_prm_1) automated for ac-8_prm_3 via ac-8_prm_2-class tooling | IdP/SCIM config | ✓ |
| AC-9 | Endpoint device management (MDM) implemented and maintained | MDM config | |
| AC-10 | Identity + device posture govern access to private resources, not network position alone | SSE/IAP config | |
| AC-11 | One designated primary ac-11_prm_1 per endpoint, enforced | Device enrolment | ✓ |
| AC-12 | Internal services behind SSO with MFA at the IdP; no local password tables | IdP federation | |
| AC-13 | Static credentials rotated every ac-13_prm_1 days or time-restricted alternatives used | Key ages | ✓ |
| AC-14 | Inventory of all accounts and access rights, current and reviewed | Inventory artifact | |
| AC-15 | Lifecycle-tool integration validation-tested (provisioning path, final-day deactivation, role match) | Test records | |
| AC-16 | Separation of duties via RBAC/PIM/JIT or compensating controls (High-Risk CII) | Role design | |

Report per control ID with pass / fail / not-applicable-per-SSP, the evidence found,
and — for failures — the fix from `references/implementation-recipes.md`. Attribute
password-hashing and session findings to AS, account-event logging gaps to LM, and
network segmentation to NS, not AC; and treat "everyone uses the shared admin login"
as the multi-control failure it is (AC-1, AC-2 accountability, AC-14).

## Related skills in this repo

- **ssp-navigator** — which SSP applies and at which level each AC control sits
  (AC-2/3/5/6 are Level 0 at Medium-Risk Cloud; High-Risk CII adds AC-1).
- **secure-coding-as** — AS password/session/secrets mechanics alongside AC account
  governance.
- **logging-monitoring** — LM-4/LM-7 capture the account and access-rights changes AC
  governs; LM-20 UEBA watches account behaviour.
- **singpass** — the AC-7 public-user login itself: Singpass FAPI 2.0 flow, Myinfo,
  the UUID-first identity model (**corppass** for business users acting for an entity).
  These own the public-user login and TX-6 pre-fill integration.
- **sg-service-shell** — the surrounding DSS page shell (where the Singpass/Corppass
  button sits), not the integration itself.
- **secure-pipeline** — SD/SC pipeline controls; CI credentials fall under AC-13.
- **data-protection** — DP classification decides when Medium-Risk promotion (and the
  AC-2/3/5/6 Level-0 set) applies at all.

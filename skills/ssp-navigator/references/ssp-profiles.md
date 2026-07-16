# SSP profiles — per-plan reference

Detail for the 8 System Security Plans published under the ICT&SS Policy
Reform. Embedded from info.standards.tech.gov.sg as of 2026-07-16 (SSP pages
last updated 24–26 March 2026; Gen-AI page content 24 March 2026). Control
counts are as published on each SSP page on that date; the site iterates, so
verify counts and Level 0 membership on the live page before quoting them in
compliance documents.

Family abbreviations: AC Access Control, AS Application Security, BR Backup
& Recovery, CK Cryptography/Key Management, CS Container Security, DC
Datacentre, DP Data Protection, GA Generative AI, HR Human Resource, IS
Infrastructure Security, LM Logging & Monitoring, NS Network Security, PM
Security Programme Management, RS Resiliency, SC Software Supply Chain, SD
Secure Development, ST Security Testing. DSS families: BD Baseline Design,
PR Performance & Reliability, TX Transactions & Payments, TL Trust &
Legitimacy, UU Understand Users, WP/WO/WU/WR WCAG Perceivable / Operable /
Understandable / Robust.

---

## Low-Risk Cloud

- **Qualifying criteria**: "A generic system hosted on the cloud through a
  third-party Cloud Service Provider."
- **Sensitivity ceiling**: up to Restricted / Sensitive Normal.
- **Domains**: 13 — AS, SC, ST, NS, BR, DP, LM, AC, CS, PM, IS, SD, CK.
  Includes Container Security; no Datacentre family (physical security is
  the CSP's problem).
- **Control count**: 117 across all levels.
- **Level 0 (7 controls)**: PM-3 (SSP development), PM-4 (residual risk
  approval), PM-5 (central SSP submission), DP-1 (Singapore data residency),
  LM-12 (central security log management), IS-11 (GovTech as sole registrar
  for .gov.sg/.edu.sg), IS-14 (SMS Sender ID Registry).
- **Default baseline**: Level 0 + Level 1. This is the reference plan the
  other cybersecurity SSPs vary from.
- **Special obligations**: GCC (Government Commercial Cloud) tenants get
  integrated logging to the Government Cyber Security Operations Centre,
  which discharges much of LM-12 by construction.

## Low-Risk On-Premises

- **Qualifying criteria**: "A generic system hosted on-premises."
- **Sensitivity ceiling**: up to Restricted / Sensitive Normal.
- **Domains**: 13 — AS, SC, ST, NS, BR, DP, LM, AC, PM, IS, SD, DC, CK.
  Swaps Container Security for **Datacentre (DC)**: DC-1/DC-2 mandate
  physical separation of government resources and datacentre access
  restrictions — the physical-security burden the cloud SSPs delegate to
  the CSP.
- **Control count**: 103 across all levels.
- **Level 0 (7 controls)**: same spine as Low-Risk Cloud — PM-3, PM-4, PM-5,
  DP-1, LM-12, IS-11, IS-14.
- **Notes**: patching and hardening obligations fall fully on the agency
  (no shared-responsibility line with a CSP).

## Medium-Risk Cloud

- **Qualifying criteria**: a generic system hosted on the cloud through a
  third-party Cloud Service Provider, with security sensitivity level up to
  Confidential / Sensitive High.
- **Sensitivity ceiling**: up to Confidential / Sensitive High.
- **Domains**: 13 — same as Low-Risk Cloud (AS, SC, ST, NS, BR, DP, LM, AC,
  CS, PM, IS, SD, CK).
- **Control count**: 117 across all levels — the identical control set to
  Low-Risk Cloud.
- **Level 0 (26 controls)**: the 7-control spine plus 19 controls promoted
  from Level 1, concentrated where sensitive data leaks or is tampered
  with — application security, access control, logging, security testing:
  - AS-1 (input validation), AS-3 (output sanitisation), AS-7 (per-request
    access checks), AS-8 (secrets management)
  - AC-2, AC-3, AC-5, AC-6 (access control hardening, incl. MFA)
  - ST-1 (vulnerability assessment scans), ST-3 (public vulnerability
    disclosure channel), ST-4 (penetration testing / VAPT programme)
  - NS-1, NS-5 (network security)
  - BR-1 (backup)
  - LM-3, LM-4, LM-6, LM-9 (audit/access logging and monitoring)
  - SD-8 (production/non-production segregation across applications,
    services, data, secrets, roles, networks)
- **Why it matters**: the control *set* is identical to Low-Risk Cloud; the
  difference is which controls lose their deviation path. Moving
  a system from Sensitive Normal to Confidential data is mostly a promotion
  of hygiene controls to mandatory.

## High-Risk Cloud CII

- **Qualifying criteria**: high-risk cloud CII (Critical Information
  Infrastructure) systems hosted through third-party Cloud Service
  Providers.
- **Sensitivity ceiling**: up to Confidential / Sensitive High.
- **Domains**: 15 — the 13 cloud domains plus **HR (Human Resource)** and
  **RS (Resiliency)**.
- **Control count**: 137 across all levels — 20 more than medium-risk: the
  full BR (6) and CK (4) families, HR (3) and RS (3), plus additional
  AC/LM/NS/PM/SD controls.
- **Level 0**: the largest mandatory set of any SSP (~50 controls). Beyond
  the medium-risk Level 0 set, notable promotions include:
  - **BR-1 through BR-6 — the entire Backup & Recovery family** at Level 0.
  - **PM at Level 0 including PM-1, PM-2, PM-6, PM-9, PM-10** — risk
    assessment and programme governance are mandatory, not just the
    SSP-paperwork trio.
  - Most of AS (adds AS-4 auth rate-limiting, AS-5 password policy, AS-6
    salted hashing, AS-11 session timeouts, AS-12 upload malware scanning).
  - All of ST (ST-1–ST-5, adding CSPM and severity-based remediation
    timeframes), LM-1 through LM-9 plus LM-12/LM-13, SC-3 (peer review
    before merge), SD-2/SD-3 (protected branches, CI gates), and IS/NS
    hardening controls.
  - Verify the exact Level 0 membership on the live page — this SSP has the
    most controls whose level differs from the other templates.
- **Special obligations**:
  - **CSA notification**: "CII Owners are reminded to inform Cybersecurity
    Agency Singapore (CSA) prior to the migration to Cloud and the creation
    of an High-Risk Cloud CII SSP." Sequence this before architecture
    commitments.
  - PM-2 risk assessment reviews and PM-4 residual-risk re-approvals recur
    at agency-defined intervals (parameters pm-2_prm_4 and pm-4_prm_2 —
    the template prescribes no fixed day counts; the agency sets them, and
    for CII expect the approving authority to set short cycles).

## Generative AI (overlay)

- **Qualifying criteria**: "a generic system that utilises generative AI
  models."
- **Sensitivity ceiling**: up to Confidential / Sensitive High (subject to
  the per-control hosting rules below).
- **Nature**: an **overlay**, not a standalone plan — 9 controls across 2
  families (GA + DP) that stack on top of the base cybersecurity SSP. The
  hosting environment must still satisfy the relevant base SSP.
- **Control count**: 9 — GA-1 to GA-8 plus DP-8.
- **Level 0 (4 controls)**:
  - **GA-1**: overseas-hosted GenAI API services may process data up to
    **RESTRICTED / SENSITIVE NORMAL** only.
  - **GA-2**: Singapore-hosted GenAI API services may process data up to
    **CONFIDENTIAL / SENSITIVE HIGH**.
  - **GA-3**: a legally-binding provider commitment to no logging, storage,
    retention, or training on input/output data. Exemption: prompt caching
    with TTL ≤ 24 hours. **Safe harbor: GCC 2.0 GenAI API services satisfy
    GA-3** — using them removes the need to negotiate bespoke provider
    agreements.
  - **GA-4**: self-hosted models must run in environments authorised for
    the highest classification of data they process.
- **Level 1 (5 controls)**:
  - **GA-5**: approved model formats and loaders only (safetensors-style
    allowlist; formats/loaders are parameters) — blocks model-deserialization
    code execution.
  - **GA-6**: upload safeguards — DLP tooling, no bulk/batch uploads,
    per-file classification confirmation prompts.
  - **GA-7**: documented evaluation of accuracy, safety and output quality
    with defined metrics, scenarios and pass criteria; re-run after model
    updates.
  - **GA-8**: users must explicitly acknowledge hallucination risk before
    being granted access.
  - **DP-8**: data classification disclosure in internal officer-facing
    applications.
- **Selection consequence**: the GA-1/GA-2 pair means data classification
  chooses your model hosting. Confidential / Sensitive High data with an
  overseas-hosted model API is a Level 0 violation — no deviation path.

## DSS (Others)

- **Qualifying criteria**: digital services with "less than 1 million visits
  per year (note: this will be determined based on WOGAA statistics)."
- **Applies to**: public-facing digital services; stacked on the base
  cybersecurity SSP. Sensitivity ceiling: n/a (usability/accessibility
  standard, not a data-protection one).
- **Domains**: 9 — UU (2), BD (9), TX (15), PR (7), TL (6), and the WCAG
  families WP (19), WO (18), WU (14), WR (2). The 53 WCAG controls track
  WCAG 2.2 A/AA, including 2.2-only criteria (24×24px pointer targets,
  focus-not-obscured, redundant entry, accessible authentication,
  consistent help).
- **Control count**: 92 (all DSS catalog controls; the two DSS profiles
  differ only in leveling, not control set).
- **Level 0 (3 controls)**:
  - **PR-2**: register the service and implement **WOGAA** (tracking code +
    Sentiments; registration-only for SaaS/COTS). WOGAA is also what
    measures the 1M-visit threshold — an unregistered service cannot even
    prove its tier.
  - **TL-3**: **Official Government Banner** ("A Singapore Government Agency
    Website" masthead) topmost on every .gov.sg page — the SGDS component is
    prescribed. Exception: uncustomisable SaaS/COTS.
  - **TL-5**: agency IP ownership of mobile apps; distribution only via
    Apple App Store, Google Play, Huawei AppGallery.
- **Key Level 1 controls**: BD-1 responsive design; BD-2 site search
  (SearchSG recommended; exempt for apps, transactional services, or where
  search is the service); BD-6 consistent UI (SGDS recommended, not
  mandated); BD-7 mandatory-field indication (exempt on login-only pages);
  TL-1 .gov.sg domain via the WOG DNS portal; TL-2 agency logo top-left
  linked home; TL-4 official footer with prescribed link order (Contact Us,
  Feedback, FAQ, Sitemap, Report Vulnerability, Privacy Statement, Terms of
  Use; "© [YYYY], Government of Singapore"; exempt on transactional pages);
  PR-6 browser compatibility (parameter; recommended latest 2 versions of
  Chrome/Firefox/Safari/Edge); PR-7 page load time ≤ parameter seconds;
  TX-2 show prerequisites before a transaction starts; TX-6 pre-fill via
  **MyInfo** (Singpass) / **Enterprise Data Hub** (Corppass); TX-9/10/11
  outcome messaging and receipts; TX-13/14 acknowledgment and status
  notifications; WP-13 contrast 4.5:1 text / 3:1 large text (tools: WebAIM,
  **Oobee**); WO-18 pointer targets ≥ 24×24 CSS px; WU-14 accessible
  authentication (Singpass QR login, OTP).
- **Always Level 2 in both DSS profiles**: BD-3/4/5 (multi-language, plain
  content, SEO), TX-3/4/5/15.

## DSS (High Impact)

- **Qualifying criteria**: digital services with "at least 1 million visits
  per year (note: this will be determined based on WOGAA statistics)."
- **Domains**: same 9 families as DSS (Others).
- **Control count**: 92 (same control set as DSS (Others)).
- **Level 0 (3 controls)**: identical to DSS (Others) — PR-2, TL-3, TL-5.
- **Difference from DSS (Others)**: 9 accessibility controls are promoted
  from Level 2 to Level 1 — WP-4 (live captions), WP-5 (audio description
  for prerecorded video), WP-9 (display orientation), WP-15 (images of
  text), WO-3 (character key shortcuts), WO-11 (multiple ways), WO-14
  (simple pointer alternatives), WO-15 (pointer cancellation), WU-3
  (unusual words). At 1M+ visits the population using assistive tech is
  large enough that these stop being optional.
- **Lifecycle note**: WOGAA traffic determines the tier, so a growing
  service can cross into High Impact after launch — re-check annually and
  re-baseline when it does.

## Sandbox

- **Qualifying criteria**: "A generic pilot sandbox system" — for pilots and
  experiments, not production.
- **Sensitivity ceiling**: up to Restricted / Sensitive Normal. Confidential
  / Sensitive High data is out of scope for sandboxing under this plan.
- **Domains**: 13 — the same domain set as Low-Risk Cloud (includes
  Container Security, no Datacentre).
- **Control count**: 117 across all levels — the identical control set to
  Low-Risk Cloud.
- **Level 0 (3 controls only)**: PM-3, PM-4, PM-5 — even a sandbox must
  have an SSP, an approved residual-risk position, and a central submission.
  Everything else (114 controls) sits at **Level 2**; there are no Level 1
  controls in this profile.
- **Why it exists**: pilots get governance without hygiene drag — the
  Government still knows the system exists and someone has signed off on its
  risks, but teams are not blocked on 100+ hygiene controls to run an
  experiment.
- **Watch out**: the published page states no time limit or expiry
  conditions, but a "pilot" that quietly becomes production no longer meets
  the qualifying criteria — re-run SSP selection and adopt a production
  template before scaling up or raising the data classification.

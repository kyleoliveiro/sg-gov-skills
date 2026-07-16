# Research notes: ICT&SS Policy Reform (info.standards.tech.gov.sg)

> Compiled 2026-07-16 from a full crawl of info.standards.tech.gov.sg (all ~45 pages) and
> github.com/GovtechSG/tech-standards. Source pages last updated Mar–May 2026.
> These notes feed skill authoring in this repo. Verify against the live site before
> publishing a skill — the standards are actively iterating.

## What it is

The **ICT&SS Policy Reform** ("ICT&SS" = infocomm technology and smart systems) is the
Singapore Government's transformation of its ICT policy controls to be "lean, relevant and
effective" — the successor to IM8 (the site itself never says "IM8" except in the OSCAL
repo, which calls its catalog "Instruction Manual 8 Reform"). Its defining move: controls
are published **openly, identically for agencies and industry partners**, so vendors see
the same requirements agencies do. Feedback channel: https://go.gov.sg/ictpolicy.

Two control catalogs sit under the reform:

- **Cybersecurity Control Catalog** — 152 controls on the site (137 in the lagging OSCAL
  release) across 17 families
- **Digital Service Standards (DSS)** — 92 controls across 9 families covering usability
  and accessibility (WCAG 2.2 A/AA in all but name)

## Core concepts

- **SSP (System Security Plan)**: the implementable control set for a system. Agencies
  pick one of 8 SSP templates by system characteristics, tailor it, get residual risk
  approved, and submit it centrally (whole-of-government repository).
- **Profile Levels**: Level 0 = cardinal/mandatory ("must-haves", no deviation).
  Level 1 = basic hygiene ("should-haves"; deviations need agency IDSC/CIO/CISO approval
  documented in a custom SSP). Level 2 = best practices ("good-to-haves").
- **Parameters**: ~30 controls carry agency-definable parameters (`xx-N_prm_M`), e.g.
  password min length, session timeout, log retention days, vuln remediation timeframes by
  severity. The catalog sets no values — tailoring happens in each SSP.
- **Hygiene requirement vs guideline**: classification is NOT printed on catalog pages; it
  exists only as profile membership (which level of which SSP includes the control).
- **Risk determination**: no published scoring methodology. Drivers: hosting model
  (cloud/on-prem), data Security Sensitivity Level (Restricted / Sensitive Normal vs
  Confidential / Sensitive High), CII status, and — for DSS — annual traffic per WOGAA
  (<1M vs ≥1M visits/year).
- **Service classification** (glossary): Digital Service, Transactional Service (exchange
  of info/goods/services/money or changes to Government Data; login and consent don't
  count), Non-Transactional Service. Determines DSS applicability.

## The 8 SSPs

Control counts below were verified 2026-07-16 by counting the control
headings on each live SSP page (two independent extraction methods agreed):

| SSP | Sensitivity ceiling | Domains | Controls | Distinctive |
|---|---|---|---|---|
| Low-Risk Cloud | Restricted / Sensitive Normal | 13 (incl. Container Security) | 117 | Default baseline = L0+L1 |
| Low-Risk On-Premises | Restricted / Sensitive Normal | 13 (Datacentre, no CS) | 103 | DC-1/DC-2 at L0 |
| Medium-Risk Cloud | Confidential / Sensitive High | 13 | 117 (identical set to Low-Risk Cloud) | 26 controls at L0: the 7-spine + 19 promoted L1→L0 (AS-1/3/7/8, AC-2/3/5/6, ST-1/3/4, NS-1/5, BR-1, LM-3/4/6/9, SD-8) |
| High-Risk Cloud CII | Confidential / Sensitive High + CII | 15 (adds HR, RS) | 137 | Must inform CSA before cloud migration; full BR/CK families; largest L0 set; PM-2/PM-4 review cadences are agency-set parameters |
| Generative AI | Confidential / Sensitive High | 2 (DP + GA) | 9 | **Overlay** stacked on a hosting SSP; see GA notes below |
| DSS (Others) | n/a | 9 (UX + WCAG) | 92 | <1M visits/yr per WOGAA |
| DSS (High Impact) | n/a | 9 | 92 (same set) | ≥1M visits/yr; 9 WCAG controls promoted L2→L1 (WP-4/5/9/15, WO-3/11/14/15, WU-3) |
| Sandbox | Restricted / Sensitive Normal | 13 (same set as Low-Risk Cloud) | 117 | Only PM-3/4/5 mandatory; everything else L2, no L1 tier — pilot-friendly |

**Universal Level 0 spine (cyber SSPs)**: PM-3 (SSP development), PM-4 (residual-risk
approval), PM-5 (central SSP submission), DP-1 (Singapore data residency), LM-12 (central
security log management), IS-11 (.gov.sg/.edu.sg registered via GovTech as sole
registrar), IS-14 (SMS Sender ID Registry).

**SSP workflow**: qualify (hosting + sensitivity + CII + traffic + GenAI overlay) →
tailor template & fill parameters → risk assessment (PM-2, approved before use) →
implement (L0 always, L1 default, L2 risk-based) → residual-risk acceptance (PM-4) →
central submission (PM-5) → operate/review.

## Cybersecurity catalog (17 families, 152 controls on site)

Counts: AC 16, AS 15, BR 6, CS 11, CK 4, DP 8, DC 2, GA 8, HR 3, IS 14, LM 21, NS 11,
RS 3, SD 10, PM 10, ST 5, SC 9. Each control publishes: Control Statement, Control
Recommendations, Risk Statement, Parameters.

**Developer-dense families** (natural skill targets):

- **AS — Application Security (15/15 dev)**: input validation (AS-1), parameterised
  queries (AS-2), output sanitisation (AS-3), auth rate-limiting (AS-4), password
  length/policy (AS-5, param), salted hashing with ≥32-bit crypto-random unique salts
  (AS-6), per-request access checks (AS-7), secrets management (AS-8), minimally
  permissive CSP (AS-9), HSTS max-age ≥ 31536000 (AS-10), session timeouts (AS-11,
  param), malware-scan uploads (AS-12), no internal detail leakage in errors (AS-13),
  reputable crypto libs only (AS-14), forced password change on compromise (AS-15).
- **SD — Secure Development (10/10 dev)**: push protection for secrets (SD-1), protected
  default branch (SD-2), CI gates (SD-3), SAST (SD-4), dependency scanning (SD-5, param),
  secret detection with remediation SLA (SD-6, param), masked CI env-var secrets (SD-7),
  prod/non-prod segregation across apps/services/data/secrets/roles/networks (SD-8),
  DAST (SD-9), SSDLC framework (SD-10).
- **SC — Software Supply Chain (9/9 dev)**: central VCS (SC-1), commit signing (SC-2),
  peer review before merge (SC-3), pinned direct+transitive deps (SC-4), reproducible
  build/release with provenance (SC-5), install only pinned versions at deploy — npm ci
  (SC-6), artifact signing — Cosign (SC-7), signature verification before deploy (SC-8),
  InnerSource (SC-9).
- **CS — Container Security (11)**: no rolling tags like :latest (CS-1), minimal base
  images (CS-2), runtime-injected secrets (CS-3), non-root default user (CS-4),
  Dockerfile linting (CS-5), read-only root FS (CS-6), image scanning (CS-7), private
  registries (CS-8), no public orchestrator API (CS-9), workload segmentation (CS-10),
  runtime security (CS-11).
- **CK — Crypto & Key Management (4)**: NIST SP 800-56/800-57-based key establishment,
  rotation (param), lifecycle, KMS/Key Vault storage.
- **GA — Generative AI (8)**: see below.
- **LM — Logging & Monitoring (dev subset)**: separate log storage (LM-1), audit/DB/access
  logging (LM-4/5/6), retention param (LM-8), structured formats (LM-15), golden signals
  (LM-16), DORA metrics (LM-17), **WOGAA required in public digital services (LM-18)**,
  log sanitisation of classified/sensitive data (LM-19).
- **ST — Security Testing**: VA scans (ST-1, params), CSPM (ST-2), public vulnerability
  disclosure channel (ST-3), pentest/VAPT programme (ST-4), severity-based remediation
  timeframes with 4 day-count params (ST-5).

**Singapore-specific controls**: AC-7 (Singpass/Corppass MFA for public digital services
needing high identity assurance), IS-11 (GovTech sole registrar for .gov.sg/.edu.sg),
IS-13 (defensive registration of .sg/.com.sg/… variants), IS-14 (SMS Sender ID Registry
for public SMS), LM-18 (WOGAA), DP-1 (data residency), DP-8 (data classification
disclosure in internal officer-facing apps), GA-1/GA-2 (GenAI hosting locality vs data
classification), PM-5 (central SSP submission).

## Generative AI SSP (overlay, 9 controls)

- **Level 0**: GA-1 overseas-hosted GenAI APIs → data up to RESTRICTED / SENSITIVE NORMAL
  only; GA-2 Singapore-hosted → up to CONFIDENTIAL / SENSITIVE HIGH; GA-3 legally-binding
  non-logging/non-training provider agreement (prompt-cache exemption if TTL ≤ 24h;
  **GCC 2.0 GenAI API services satisfy this**); GA-4 self-hosted models in environments
  cleared for highest data classification.
- **Level 1**: DP-8 classification disclosure; GA-5 approved model formats/loaders
  (safetensors-style allowlist, params); GA-6 upload safeguards (DLP, no bulk upload,
  per-file classification confirmation); GA-7 documented eval of accuracy/safety/output
  quality with defined metrics/scenarios/criteria; GA-8 users must explicitly acknowledge
  hallucination risk before access.

## DSS catalog (9 families, 92 controls)

Families: BD Baseline Design 9, PR Performance & Reliability 7, TX Transactions &
Payments 15, TL Trust & Legitimacy 6, UU Understand Users 2, and WCAG: WP Perceivable 19,
WO Operable 18, WU Understandable 14, WR Robust 2 (53 WCAG controls ≈ WCAG 2.2 A/AA —
includes 2.2-only criteria: 24×24px targets, focus-not-obscured, redundant entry,
accessible authentication, consistent help).

**Level 0 (mandatory in both DSS profiles) — only 3 controls**:
- **PR-2**: register service and implement **WOGAA** (tracking code + Sentiments; SaaS/COTS
  registration only)
- **TL-3**: **Official Government Banner** ("A Singapore Government Agency Website"
  masthead) topmost on every .gov.sg page — SGDS component prescribed
- **TL-5**: mobile app IP ownership; distribution only via Apple App Store, Google Play,
  Huawei AppGallery

**High Impact (≥1M visits/yr) promotes L2→L1**: WP-4/5/9/15, WO-3/11/14/15, WU-3.
Always-L2 in both: BD-3/4/5 (multi-language, plain content, SEO), TX-3/4/5/15.

**Key L1 controls**: BD-1 responsive design, BD-2 site search (SearchSG recommended),
BD-6 consistent UI — **SGDS recommended not mandated**, BD-7 mandatory-field indication,
BD-8 logged-in identity display; TL-1 .gov.sg domain via WOG DNS portal, TL-2 agency logo
top-left linked home, TL-4 official footer (link order: Contact Us, Feedback, FAQ,
Sitemap, Report Vulnerability, Privacy Statement, Terms of Use; "© [YYYY], Government of
Singapore"); PR-6 browser compat (param; rec latest 2 of Chrome/Firefox/Safari/Edge),
PR-7 page load ≤ param seconds; TX-2 show prerequisites before starting, TX-6 pre-fill
via **MyInfo** (Singpass) / **Enterprise Data Hub** (Corppass), TX-9/10/11 outcome
messaging and receipts, TX-13/14 acknowledgment + status notifications; WU-14 accessible
authentication (Singpass QR login, OTP); WP-13 contrast 4.5:1 / 3:1 (tools: WebAIM,
**Oobee**); WO-18 pointer targets ≥ 24×24 CSS px.

Applicability exceptions: BD-2 (not apps/transactional/search-is-the-service), TL-3 (not
uncustomisable SaaS/COTS), TL-4 (not transactional pages), BD-7 (not login-only pages).

## Machine-readable: github.com/GovtechSG/tech-standards

- MIT-licensed, OSCAL 1.1.2 JSON only. `catalogs/im8-reform.json` (137 controls, 15
  groups, version 2025.05.13) + 6 profiles: `low-risk-level-{0,1,2}` (6/86/35 control
  additions, cumulative via `include-all` imports) and `medium-risk-level-{0,1,2}`
  (26/73/25). No high-risk, gen-ai, DSS, or sandbox profiles; no SSP documents; no
  releases/tags — pin by commit SHA, watch `metadata.version`.
- Authored with IBM **compliance-trestle** (`trestle://` import hrefs — standard OSCAL
  resolvers need the scheme mapped to repo paths).
- Control shape: `parts` = statement (`<id>_smt`) + guidance (`<id>_gdn`, Markdown with
  `#uuid` back-matter links); `props` = risk-statement, published, last-modified (missing
  `ns` — fails strict oscal-cli validation, open issue #3); `params` with
  `{{ insert: param, <id> }}` moustache interpolation, no values set; `links` map to old
  IM8 chapters, MVSP, NIST SPs via 50 back-matter resources (some gov-internal URLs).
- Level classification = profile membership, not a control prop. "What does level N of
  risk R require" = resolve profile import chain, union `with-ids`, join catalog by id.
- **The GitHub repo lags the website** (2025.05.13 vs Mar-2026 pages; GA and DSS families
  absent from OSCAL). The site is authoritative.

## SG ecosystem touchpoints referenced by the standards

Singpass / Corppass (AC-7, TX-1, WU-14) · MyInfo & Enterprise Data Hub (TX-6) · WOGAA
(PR-2 L0, PR-5, PR-7, LM-18, and the 1M-visit DSS threshold) · SGDS components (TL-3
banner, TL-4 footer, BD-6) · SearchSG (BD-2) · PayNow (TX-1) · GCC 2.0 (GA-3 safe
harbor) · SMS Sender ID Registry (IS-14) · WOG DNS portal / GovTech registrar (TL-1,
IS-11) · Oobee accessibility scanner (WP-13) · CSA notification for CII cloud migration.

## Errata found on the source site (as of 2026-07-16)

Publishing errors observed while embedding control text — implement to the
control *statement* in each case:

- **WO-12** (Headings and Labels): its published Recommendations/Rationale
  duplicate WO-13's focus-indicator text.
- **WU-7** (Consistent Navigation): rationale appears copy-pasted from
  WU-5/WU-6; its statement also adds SG-specific requirements beyond WCAG
  3.2.3 (nav at top, not icon-collapsed on desktop).
- **WP-5** statement typo ("Provided an audio description").
- **SD-9** (Dynamic Analysis): its parameter description says "static"
  analysis — carried over from SD-4.
- DSS pages publish "Rationale" where the cyber catalog publishes "Risk
  Statement".
- The DSS↔WCAG mapping is not a clean A/AA cut: WU-3/WU-4 map to AAA
  criteria; WO-3/14/15 are WCAG Level A but DSS Level 2 in Others; WO-13
  merges SC 2.4.7 + 2.4.11; no dedicated control for SC 2.5.7.
- **CK-3 and CK-4** exist in the catalog but appear in neither the Low-Risk
  nor Medium-Risk Cloud SSP (those list only CK-1/CK-2).
- Naming: the standards say "Official Government Banner"; SGDS names the
  component **Masthead** (`<sgds-masthead>`). The SGDS footer component
  marks only Privacy/Terms as required — the other five TL-4 links must be
  supplied explicitly.

## Gaps and caveats

- No published risk-scoring methodology; SSP choice is criteria-based self-assessment.
- No downloadable SSP templates on the site; machine-readable = GitHub OSCAL only, and
  only for low/medium-risk cloud.
- Hygiene/guideline labels and levels are only visible on SSP pages, not catalog pages.
- This site does NOT cover: PDPA specifics, FormSG, GeBIZ procurement, Singpass/MyInfo
  API mechanics, GCC 2.0 architecture — skills on those need other authoritative sources
  (developer.gov.sg, designsystem.tech.gov.sg, PDPC, api.singpass.gov.sg).

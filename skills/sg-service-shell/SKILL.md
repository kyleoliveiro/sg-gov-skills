---
name: sg-service-shell
description: >-
  Build the mandatory "shell" every Singapore government public-facing digital
  service needs before feature work — the Official Government Banner (masthead),
  WOGAA registration and tracking, the official footer, .gov.sg domain, SGDS
  setup, and the rest of the DSS Trust & Legitimacy, Baseline Design, and
  Performance & Reliability controls (22 controls, 3 of them Level 0 mandatory).
  Use when scaffolding a new SG government website, web service, or mobile app;
  reviewing an existing agency service for DSS shell compliance; setting up a
  gov.sg site; or when someone mentions the "government banner", "masthead",
  "A Singapore Government Agency Website", "WOGAA", "official footer", "SGDS
  setup", launching an agency digital service, or asks "what does every gov.sg
  site need".
---

# SG government service shell (DSS: TL + BD + PR)

Every public-facing digital service delivered for a Singapore government agency must
implement a common "shell" before any feature work matters: proof of legitimacy (users
must be able to tell it is really the government), baseline design practices, and
performance/reliability basics. These are codified as 22 controls in three families of
the **Digital Service Standards (DSS)** under the ICT&SS Policy Reform (successor to
IM8): **TL** (Trust & Legitimacy, 6), **BD** (Baseline Design Practices, 9), **PR**
(Performance & Reliability, 7).

Three of these are **Level 0 — mandatory, no deviation permitted** — in both DSS
profiles. Do those first. Most of the rest are Level 1 (default; skipping one requires
documented agency IDSC/CIO/CISO approval in a custom System Security Plan). BD-3/4/5 are
Level 2 (best practice).

## Source and currency

Control text in this skill and in `references/tl-bd-pr-controls.md` is embedded from
info.standards.tech.gov.sg as of **2026-07-16**. The standards iterate actively — for
compliance-critical decisions, verify against the live catalog:

- https://info.standards.tech.gov.sg/control-catalog/dss/tl/
- https://info.standards.tech.gov.sg/control-catalog/dss/bd/
- https://info.standards.tech.gov.sg/control-catalog/dss/pr/
- SGDS component docs: https://designsystem.tech.gov.sg
- WOGAA onboarding: https://www.wogaa.sg

Read `references/tl-bd-pr-controls.md` for the full control statements, recommendations,
risk statements, and parameters when you need exact wording.

## Build checklist, in priority order

### 1. Level 0 — mandatory, no deviation

**TL-3 — Official Government Banner.** Display the Official Government Banner ("A
Singapore Government Agency Website") on **every page** of web-based .gov.sg services,
as the **topmost component** — above the agency logo, above navigation, above
everything. Why: it is the single strongest signal users have to distinguish real
government services from phishing clones. The control prescribes the SGDS component; in
SGDS it is named **Masthead**:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@govtechsg/sgds-web-component"></script>
<sgds-masthead></sgds-masthead>
```

(Or `npm install @govtechsg/sgds-web-component` and import it; a React wrapper exists as
`@govtechsg/sgds-web-component/react` — confirm current install instructions at
https://designsystem.tech.gov.sg/components/masthead.) Do not restyle, override, or
recreate the banner by hand, and do not omit it on internal flows, error pages, or
success screens. Exception: not required for SaaS/COTS products that do not allow
customisation.

**PR-2 — WOGAA registration and implementation.** Register the service on **WOGAA**
(Whole-of-Government Application Analytics, https://www.wogaa.sg) before launch, install
the WOGAA tracking code on every page, and enable **Sentiments** (the WOGAA feedback
widget). Why: WOGAA is the central WOG registry and analytics layer — it also determines
whether your service is classified DSS "High Impact" (≥1M visits/year) and feeds
PR-5/PR-7 tooling. Exception: for SaaS/COTS that cannot be customised, only registration
is required (no tracking code/Sentiments). Note the related cyber control LM-18 imposes
the same WOGAA requirement from the cybersecurity catalog.

**TL-5 — Mobile app IP ownership and distribution.** If the service includes a mobile
app: the agency must retain full IP ownership of the app, and it may be distributed
**only** through the Apple App Store, Google Play Store, or Huawei AppGallery. Why:
prevents unauthorised clones and gives the government legal standing to demand
takedowns. Contract IP terms accordingly with vendors; never sideload or self-host APKs.

### 2. Level 1 — Trust & Legitimacy

**TL-1 — .gov.sg domain.** Serve web services from a .gov.sg domain (.edu.sg for
education institutions). Register via the Whole-of-Government DNS portal on the ITSM
portal; GovTech is the sole registrar (cyber control IS-11). Plan this early — domain
provisioning is an agency process, not a code change.

**TL-2 — Agency logo, top-left, linked home.** Display the agency or initiative logo at
the top-left of every page, hyperlinked to the service homepage. Render it crisply (SVG
or 2x raster; no distortion or pixellation).

**TL-4 — Official Global Footer.** Adopt the official footer on every page, with links
in this exact order: **Contact Us, Feedback, FAQ, Sitemap, Report Vulnerability, Privacy
Statement, Terms of Use**, plus the copyright line **"© [YYYY], Government of
Singapore"** (statutory boards may substitute the agency name). Use the SGDS **Footer**
component (`<sgds-footer>`, with `sgds-footer-item` for grouped link sections —
https://designsystem.tech.gov.sg/components/footer) and populate all seven links; the
SGDS component marks only Privacy/Terms as required, so the other five links are on you
to supply. "Report Vulnerability" should point to the government vulnerability
disclosure programme (see cyber control ST-3). Exception: not required on transactional
service pages.

**TL-6 — App store developer name.** Publish mobile apps under a developer account named
with the **full agency name**, so store listings are self-evidently official.

### 3. Level 1 — Baseline Design Practices

**BD-1 — Responsive design.** The service must work across device sizes. If content is
genuinely unsuitable for mobile, block mobile access and explain why and how to access
it instead — silent breakage is non-compliant.

**BD-2 — Site search.** Multi-page websites need a site search; **SearchSG** is the
recommended WOG offering. Make it discoverable, and review search analytics. Not
required for mobile apps, transactional services, or sites where search *is* the service.

**BD-6 — Consistent design system.** Use a design system or style guide throughout.
**SGDS is recommended, not mandated** — but since TL-3 already pulls in SGDS, adopting
it wholesale is usually the cheapest way to comply.

**BD-7 — Mandatory/optional field indication.** Mark input fields as mandatory or
optional consistently (e.g. asterisks; label the optional ones when most are mandatory),
and make the indicators screen-reader accessible. Not required on plain
identifier+password login pages.

**BD-8 — Logged-in identity display.** After login, prominently display the logged-in
user's name or identifier (header or top of page) so users on shared devices can confirm
the account.

**BD-9 — Contact channels.** Provide at least one help channel: phone, email, contact
form, or live chat. This also feeds the footer's Contact Us/Feedback links (TL-4).

### 4. Level 1 — Performance & Reliability

**PR-1 — Periodic service review.** Ensure a process exists to review the service every
N days (parameter) for relevance and usage, and to shut it down if it no longer earns
its keep. Mostly an agency-process control; know it exists.

**PR-3 — 24/7 availability.** Design for round-the-clock availability. If the service
cannot be 24/7, communicate operational hours clearly.

**PR-4 — Scheduled downtime notice (param).** Notify users of scheduled downtime at
least N days in advance (parameter) via maintenance banners or in-app notices, including
date, time, duration, reason, and affected features where applicable.

**PR-5 — Broken links (param).** Establish detection (WOGAA's broken link scanner
covers internal and external links) and fix broken links within N days of detection
(parameter).

**PR-6 — Browser compatibility (param).** Support the latest major versions of at least
N widely used browsers (parameter); the recommendation is the latest two major versions
of Chrome, Firefox, Safari, and Edge. Automate with BrowserStack/LambdaTest if useful.

**PR-7 — Page load time (param).** Keep page load at or under N seconds (parameter).
Measure with WOGAA and Google PageSpeed Insights; wire a performance budget into CI.

### 5. Level 2 — best practices

**BD-3 — Multiple languages.** Offer content in multiple languages (Singapore's
official languages are English, Chinese, Malay, Tamil) with switching available anytime.
**BD-4 — Plain content.** Write clearly and simply; validate with user testing and
readability scores (Flesch/Flesch-Kincaid).
**BD-5 — SEO.** Complete metadata and meta tags so search results are informative. Not
required for direct-access restricted-audience services or experimental/beta services.

## Parameters: locate, don't invent

PR-1, PR-4, PR-5, PR-6, and PR-7 carry **agency-definable parameters** (review cadence,
downtime notice days, broken-link fix days, browser count, load-time seconds). The
catalog deliberately sets **no values** — each agency fixes them when tailoring its
System Security Plan (SSP). When implementing or reviewing, ask for the tailored SSP or
the agency's parameter values. Never guess or present a number as "the requirement"; if
no value exists yet, flag it as an open tailoring decision for the agency.

## Applicability exceptions (recap)

| Control | Not required for |
|---|---|
| TL-3 banner | SaaS/COTS that do not allow customisation |
| TL-4 footer | Transactional service pages |
| PR-2 WOGAA | SaaS/COTS: registration only, no tracking code/Sentiments |
| BD-2 search | Mobile apps; transactional services; search-is-the-service sites |
| BD-5 SEO | Restricted-audience direct-access services; experimental/beta |
| BD-7 field indication | Login pages requesting only identifier + password |

A "Transactional Service" in DSS terms involves an exchange of information, goods,
services, or money, or changes to Government Data — login and consent alone don't count.

## All 22 shell controls at a glance

Levels are identical in the DSS (Others) and DSS (High Impact) profiles for these
families. L0 = mandatory, L1 = default, L2 = best practice.

| ID | Control | Level |
|---|---|---|
| TL-3 | Official Government Banner (SGDS Masthead, topmost, every page) | **0** |
| TL-5 | Mobile app IP ownership; official app stores only | **0** |
| PR-2 | WOGAA registration + tracking code + Sentiments | **0** |
| TL-1 | .gov.sg domain via WOG DNS portal (GovTech registrar) | 1 |
| TL-2 | Agency logo top-left, linked to homepage | 1 |
| TL-4 | Official Global Footer, exact link order + © line | 1 |
| TL-6 | Full agency name as app-store developer account | 1 |
| BD-1 | Responsive web design | 1 |
| BD-2 | Site search (SearchSG) | 1 |
| BD-6 | Consistent UI via design system (SGDS recommended) | 1 |
| BD-7 | Mandatory/optional field indication | 1 |
| BD-8 | Logged-in identity display | 1 |
| BD-9 | At least one contact channel | 1 |
| PR-1 | Periodic service review (param: cadence days) | 1 |
| PR-3 | 24/7 availability or published hours | 1 |
| PR-4 | Scheduled downtime notice (param: days) | 1 |
| PR-5 | Broken link detection + fix (param: days; WOGAA scanner) | 1 |
| PR-6 | Browser compatibility (param: N browsers; rec. latest 2 of Chrome/Firefox/Safari/Edge) | 1 |
| PR-7 | Page load time (param: seconds; WOGAA/PageSpeed) | 1 |
| BD-3 | Multiple languages | 2 |
| BD-4 | Clear and concise content | 2 |
| BD-5 | Search engine optimisation | 2 |

## What this skill does not cover

The shell is necessary, not sufficient. Compose with the sibling skills:

- **ssp-navigator** — choosing the right SSP profile, Level 0/1/2 mechanics, tailoring
  and parameter workflow, DSS Others vs High Impact classification.
- **dss-accessibility** — the 53 WCAG 2.2 A/AA controls (WP/WO/WU/WR families),
  including the High Impact level promotions.
- **secure-coding-as** — Application Security (AS) controls: input validation, sessions,
  CSP, HSTS, secrets.
- **secure-pipeline** — Secure Development (SD) and Software Supply Chain (SC) controls
  for the CI/CD side.
- **singpass** / **corppass** — Transactions & Payments (TX): the Singpass/Myinfo
  (individuals) and Corppass/Myinfo Business (entities) login and pre-fill that plug into
  this shell. Use **singpass-legacy** / **corppass-legacy** for pre-FAPI 2.0 integrations.

Receipts, PayNow, and the cybersecurity catalog are also out of scope here.

---
name: ssp-navigator
description: >-
  Determine which Singapore Government System Security Plan(s) apply to a
  system under the ICT&SS Policy Reform (IM8's successor) and emit the
  resulting control baseline — including stacking the Generative AI overlay
  and Digital Service Standards profiles on top of a cybersecurity SSP. Use
  whenever a project touches SG government delivery: "which SSP applies",
  "IM8", "ICT&SS", "system security plan", "risk classification", "what
  controls do we need", "security baseline", "DSS", "Gen-AI controls", or
  when starting a new Singapore government project and the compliance scope
  is not yet pinned down. Run this BEFORE writing code or architecture docs —
  the SSP choice changes what is mandatory.
---

# SSP Navigator

Map a system's characteristics to the correct System Security Plan(s) from
the Singapore Government's ICT&SS Policy Reform (the successor to IM8), then
report the control baseline and the lifecycle steps the team must complete.

An SSP is the implementable control set for one system. Agencies pick one of
8 published SSP templates by system characteristics, tailor it, get residual
risk approved, and submit it to a whole-of-government repository. Getting the
SSP selection right up front matters because it determines which controls are
mandatory (Level 0), which are default hygiene (Level 1), and which are
optional best practice (Level 2) — and because several Level 0 controls
(data residency, central logging, domain registration) constrain architecture
decisions that are expensive to reverse.

## Source and currency

Content embedded from **info.standards.tech.gov.sg** as of **2026-07-16**
(source pages last updated March–May 2026). The standards are actively
iterating: when making compliance-critical decisions, verify against the
live pages before relying on embedded figures.

Source URLs:

- https://info.standards.tech.gov.sg/ssp/ (SSP summary and level semantics)
- https://info.standards.tech.gov.sg/ssp/low-risk-cloud/
- https://info.standards.tech.gov.sg/ssp/low-risk-on-premises/
- https://info.standards.tech.gov.sg/ssp/medium-risk-cloud/
- https://info.standards.tech.gov.sg/ssp/high-risk-cloud/
- https://info.standards.tech.gov.sg/ssp/gen-ai/
- https://info.standards.tech.gov.sg/ssp/dss-others/
- https://info.standards.tech.gov.sg/ssp/dss-high/
- https://info.standards.tech.gov.sg/ssp/sandbox/

Machine-readable OSCAL: https://github.com/GovtechSG/tech-standards —
MIT-licensed OSCAL 1.1.2 JSON, but it **lags the website** (catalog version
2025.05.13; no Gen-AI, DSS, high-risk, or sandbox profiles). The site is
authoritative.

## Step 1 — Gather the classification inputs

Ask for (or determine from project context) all six inputs before selecting
anything. Partial answers produce wrong baselines — e.g. missing the GenAI
usage means missing four mandatory controls.

1. **Hosting model** — cloud (via a third-party Cloud Service Provider,
   including GCC 2.0) or on-premises?
2. **Data Security Sensitivity Level** — the *highest* classification the
   system stores or processes: up to **Restricted / Sensitive Normal**, or
   up to **Confidential / Sensitive High**?
3. **CII status** — is the system designated Critical Information
   Infrastructure?
4. **Public-facing digital service?** — will members of the public or
   businesses use it? If yes: what is the expected annual traffic? The DSS
   threshold is **1 million visits per year, determined from WOGAA
   statistics** — for a new service with no WOGAA history, confirm the
   expected tier with the agency rather than guessing.
5. **Generative AI usage** — does the system call GenAI model APIs
   (commercial or GCC 2.0) or self-host GenAI models?
6. **Pilot status** — is this a time-boxed pilot/sandbox rather than a
   production system?

There is no published risk-scoring methodology: SSP selection is
criteria-based self-assessment on these inputs. If the sensitivity level
itself is undetermined, that is an agency data-classification decision —
flag it as a blocker rather than assuming.

## Step 2 — Select the SSP(s)

A system gets **exactly one base cybersecurity SSP**, plus overlays that
stack on top. Work through in order:

### 2a. Base cybersecurity SSP (pick one)

| Condition | Base SSP |
|---|---|
| Pilot/sandbox system (data up to Restricted / Sensitive Normal) | **Sandbox** |
| Cloud-hosted CII | **High-Risk Cloud CII** |
| Cloud, data up to Confidential / Sensitive High | **Medium-Risk Cloud** |
| Cloud, data up to Restricted / Sensitive Normal | **Low-Risk Cloud** |
| On-premises, data up to Restricted / Sensitive Normal | **Low-Risk On-Premises** |

Gaps to flag explicitly rather than paper over:

- **On-premises + Confidential / Sensitive High, or on-premises CII**: no
  published template exists. Escalate to the agency CISO for a custom SSP;
  do not silently apply the low-risk on-prem template.
- **Sandbox + Confidential / Sensitive High data**: out of scope for the
  Sandbox SSP (its ceiling is Restricted / Sensitive Normal).
- **CII systems**: the CII Owner must **inform CSA (Cyber Security Agency of
  Singapore) before migrating to cloud and before creating a High-Risk Cloud
  CII SSP** — this is a sequencing constraint, not paperwork after the fact.

### 2b. Generative AI overlay (stack if applicable)

If the system uses GenAI models in any form, stack the **Generative AI SSP**
(9 controls: GA-1–GA-8 + DP-8) on top of the base SSP. It is an overlay, not
a standalone plan — hosting-environment security still comes from the base
SSP. Its Level 0 controls bind data classification to model hosting:

- **GA-1**: overseas-hosted GenAI API services → data up to **Restricted /
  Sensitive Normal only**.
- **GA-2**: Singapore-hosted GenAI API services → up to **Confidential /
  Sensitive High**.
- **GA-3**: a **legally-binding provider commitment** to no logging, storage,
  retention, or training on prompts/outputs (prompt caching with TTL ≤ 24h
  exempt). **GCC 2.0 GenAI API services satisfy GA-3** — prefer them to
  avoid negotiating bespoke agreements.
- **GA-4**: self-hosted models must run in environments cleared for the
  highest data classification they process.

Check GA-1/GA-2 against input 2 early: a Confidential-level system calling
an overseas-hosted model API is a Level 0 violation with no deviation path.

### 2c. DSS profile (stack if public-facing digital service)

If the system is a public-facing digital service, stack one DSS profile:

- **DSS (Others)** — fewer than 1M visits/year per WOGAA.
- **DSS (High Impact)** — at least 1M visits/year per WOGAA.

Both profiles publish the same 92 controls; the difference is leveling — High
Impact promotes 9 WCAG controls from Level 2 to Level 1.

DSS covers usability, trust, transactions, and accessibility (its WP/WO/WU/WR
families are WCAG 2.2 A/AA in all but name). Internal-only systems skip DSS.

### 2d. Result

A production system can carry up to three plans, e.g. a public GenAI-powered
service on GCC handling Sensitive Normal data with 200k visits/year =
**Low-Risk Cloud + Generative AI overlay + DSS (Others)**.

## Step 3 — Report the control baseline

For each selected SSP, report what the team must do, using
[references/ssp-profiles.md](references/ssp-profiles.md) for the per-SSP
detail (qualifying criteria, domains, Level 0 control lists, special
obligations). Structure the report as:

1. **Selected SSP(s)** and why (echo the classification inputs).
2. **Level 0 controls** — the mandatory set, named individually.
3. **Level 1 scope** — count and the domains it spans; note the deviation
   rule below.
4. **Special obligations** — CSA notification, GCC 2.0 safe harbor,
   WOGAA registration, etc.
5. **Lifecycle next steps** (Step 4 below).
6. **Open parameters** — roughly 30 controls carry agency-definable
   parameters (password minimum length, session timeout, log retention days,
   vulnerability remediation timeframes by severity, review cadences). The
   catalog sets **no values**; every parameter is a tailoring decision the
   agency must make and record in its SSP. List the ones in scope so they
   become explicit decisions, not defaults nobody chose.

### Level semantics and deviation rules

- **Level 0 — cardinal and mandatory.** No deviation. These are the
  requirements the Government treats as non-negotiable (data residency,
  central logging, SSP governance itself).
- **Level 1 — basic hygiene**, implemented by default. Deviating from or not
  implementing a Level 1 control requires approval from the agency's
  designated authority — IDSC / CIO / CISO (the approving authority is
  itself an SSP parameter, PM-4) — documented in the agency's customised
  SSP. The point of the paper trail: risk acceptance must be a named
  decision, not an omission discovered at audit or VAPT.
- **Level 2 — best practices** to consider and adopt where the risk profile
  warrants. Skipping Level 2 needs no approval, but record the reasoning in
  the SSP so future reviews see a decision rather than a gap.

Hygiene-vs-guideline classification exists **only as profile membership** —
catalog pages do not print levels. To know a control's level for a given
system, look at the selected SSP page, not the catalog.

### The universal Level 0 spine (cybersecurity SSPs)

Low-Risk Cloud, Low-Risk On-Premises, Medium-Risk Cloud and High-Risk Cloud
CII all share these seven Level 0 controls — treat them as the floor for any
production SG government system:

| Control | Requirement |
|---|---|
| PM-3 | Develop a System Security Plan for the system |
| PM-4 | Residual risks approved by the agency's designated authority |
| PM-5 | Submit the approved SSP to the central (whole-of-government) repository |
| DP-1 | Data residency in Singapore for specified data types |
| LM-12 | Central security log management (GCC tenants get integrated logging to the Government Cyber Security Operations Centre) |
| IS-11 | .gov.sg / .edu.sg domains registered via GovTech as sole registrar |
| IS-14 | Register SMS sender IDs with the Singapore SMS Sender ID Registry |

Exceptions: the **Sandbox** SSP mandates only PM-3, PM-4, PM-5 (everything
else drops to Level 2 — that is its entire point). The **DSS** profiles have
their own three Level 0 controls: PR-2 (register the service and implement
WOGAA), TL-3 (Official Government Banner on every .gov.sg page), TL-5
(mobile app IP ownership; distribution only via Apple App Store, Google
Play, Huawei AppGallery).

## Step 4 — The SSP lifecycle workflow

Selection is the start, not the end. Walk the team through:

1. **Tailor** — customise the chosen template into a system-specific SSP (or
   adopt it as the default). Fill in every agency-defined parameter; stack
   overlay/DSS controls into the same plan.
2. **Risk assessment (PM-2)** — conduct a risk assessment and have it
   approved **before the system is used**; repeat at the agency-defined
   review cadence (a PM-2 parameter).
3. **Implement** — Level 0 always; Level 1 by default (deviations approved
   and documented per the rule above); Level 2 by risk-based judgment.
4. **Residual risk approval (PM-4)** — the agency's designated approving
   authority accepts the residual risks; re-approval recurs at an
   agency-defined interval (a PM-4 parameter).
5. **Central submission (PM-5)** — submit the approved SSP to the central
   whole-of-government repository.
6. **Operate and review** — keep the SSP current as the system, its data
   classification, or its traffic tier changes. Crossing 1M WOGAA visits or
   raising the data classification changes which SSP applies — re-run this
   skill's decision procedure when system characteristics change.

## After the baseline is known

Hand off to the sibling skills that implement the controls:

- **secure-coding-as** — when writing application code (Application
  Security family: AS-1 input validation, AS-2 parameterised queries, AS-6
  salted hashing, AS-9 CSP, AS-10 HSTS, and the rest of AS).
- **secure-pipeline** — when setting up repos, CI/CD and releases (Secure
  Development SD and Software Supply Chain SC families: push protection,
  SAST/DAST, pinned dependencies, artifact signing).
- **dss-accessibility** — when a DSS profile is in scope, for the WCAG 2.2
  controls (WP/WO/WU/WR families).
- **sg-service-shell** — for DSS trust and legitimacy (TL-3 banner, TL-4
  footer, .gov.sg domain) and WOGAA integration (PR-2, LM-18).

## References

- [references/ssp-profiles.md](references/ssp-profiles.md) — per-SSP detail:
  qualifying criteria, sensitivity ceilings, domains, control counts, Level 0
  lists, and special obligations for all 8 SSPs.

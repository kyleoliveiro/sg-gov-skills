---
name: security-testing
description: >-
  Set up or audit a security testing and vulnerability management programme against the
  Singapore Government's ICT&SS Policy Reform (IM8 successor) Security Testing controls
  (ST-1..ST-5): vulnerability assessment scans, cloud security posture management, a public
  vulnerability disclosure channel (security.txt), the penetration testing / VAPT
  programme, and severity-based remediation SLAs. Use whenever preparing a Singapore
  government system for VAPT or a security audit, standing up vulnerability scanning or a
  disclosure channel, writing a vulnerability management SOP, or reviewing how a team
  triages and remediates findings. Triggers: "VAPT", penetration test / pen test for a
  government service, ICT&SS or IM8 security testing requirements, ST controls,
  vulnerability assessment scans, CSPM / cloud security posture management, security.txt,
  vulnerability disclosure programme, bug bounty readiness, vulnerability remediation SLAs,
  risk acceptance of a vulnerability, CISA KEV prioritisation, security testing audit.
---

# security-testing: ST controls for SG government systems

You are setting up or auditing a **security testing and vulnerability management
programme** against the ICT&SS Policy Reform **Security Testing family (ST-1..ST-5)**. The
family's scope is the *testing lifecycle around a running system*: scanning hosts for
vulnerabilities, continuously checking cloud configuration, giving the public a way to
report what they find, commissioning penetration tests, and remediating what all of those
surface within committed timeframes.

The discipline everything hangs on: **this family runs on nine agency-defined
parameters** — scan type and cadence (ST-1), the disclosure channel type (ST-3), the
testing type and frequency (ST-4), and four severity-based remediation SLAs (ST-5). The
catalog leaves every one of them blank. **Get the values from the project's System
Security Plan; never invent them.** A finding of "scans are too infrequent" is only
defensible against the SSP's number.

## What this family is *not* about

ST is the *host, cloud, and programme* layer. Three things people wrongly park here:

- **CI code and dependency scanning is not ST-1.** SAST (SD-4), SCA/dependency scanning
  (SD-5), secret detection (SD-6), and pipeline DAST (SD-9) live in **Secure Development
  (secure-pipeline)**. ST-1 is *host-level* vulnerability assessment — the VM, instance,
  and network layer. A repo with Dependabot and CodeQL has zero ST-1 coverage; don't let
  "we scan continuously" pass on that basis. The findings from those CI scanners *do* feed
  the ST-5 remediation SLAs, though — one register, one clock.
- **Container image scanning is CS** (container-security), not ST-1.
- **Fixing an individual vulnerability is another family's work** — a SQL injection fix is
  AS-1 (secure-coding-as). ST-5 governs the *process*: triage, priority, the SLA clock,
  and who may sign a risk acceptance.

## Source and currency

Control text in this skill and `references/st-controls.md` is embedded from
**info.standards.tech.gov.sg as of 2026-07-22**; the ST family page was last updated **24
March 2026**. The standards iterate. For any compliance-critical decision, verify against
the live page:

- ST control catalog: https://info.standards.tech.gov.sg/control-catalog/cybersecurity/st/

## Reference files

- `references/st-controls.md` — full text of ST-1..ST-5 (statement, recommendations, risk,
  all nine parameters), the per-SSP level assignments, and cross-family notes. Read it when
  you need exact wording, e.g. for an audit response or SSP documentation.
- `references/programme-templates.md` — concrete artifacts per control: an RFC 9116
  security.txt, scan and CSPM enablement config, a VAPT plan and readiness checklist, the
  vulnerability register schema, and a risk-acceptance record template. Read it when
  actually building.

## Before you start: the SSP parameters

Ask for these nine values from the System Security Plan before writing anything. If the
SSP doesn't exist or leaves them blank, flag that as its own finding — the sibling skill
**ssp-navigator** determines which level each ST control sits at for this system.

| Control | Parameter | What the SSP defines |
|---|---|---|
| ST-1 | st-1_prm_1 | The type of vulnerability assessment scanning |
| ST-1 | st-1_prm_2 | Maximum days between vulnerability assessment scans |
| ST-3 | st-3_prm_1 | The type of public vulnerability reporting channel |
| ST-4 | st-4_prm_1 | The type of security testing programme (e.g. penetration test) |
| ST-4 | st-4_prm_2 | Maximum days between security tests |
| ST-5 | st-5_prm_1 | Days to remediate or risk-accept a **Critical** vulnerability |
| ST-5 | st-5_prm_2 | Days to remediate or risk-accept a **High** vulnerability |
| ST-5 | st-5_prm_3 | Days to remediate or risk-accept a **Medium** vulnerability |
| ST-5 | st-5_prm_4 | Days to remediate or risk-accept a **Low** vulnerability |

Level assignments vary by SSP: in the low-risk cloud/on-prem SSPs all of ST sits at Level
1; **medium-risk cloud promotes ST-1, ST-3, and ST-4 to Level 0** (mandatory, no
deviation); high-risk cloud CII puts **all five at Level 0**. Systems handling
CONFIDENTIAL data or above should assume the promoted set.

## Procedure

Work in this order. For **setup**, produce each artifact. For **audit**, verify each and
record pass / fail / not-applicable-per-SSP with evidence (the scan schedule and last
report, the CSPM console, the live security.txt, the test report and its date, the
register with its SLA clocks). Templates for every step are in
`references/programme-templates.md`.

### Stage 1 — Continuous scanning (ST-1, ST-2)

**1a. Host vulnerability assessment scans (ST-1).** Run scans of the SSP-defined type
(st-1_prm_1) for **eligible hosts** at least every **st-1_prm_2 days**. Prefer
**authenticated** (agent-based) scans — unauthenticated network scans see only the
surface. On cloud, the managed scanners fit naturally: **Amazon Inspector** or **Microsoft
Defender for Cloud**; on-premises, subscribe to a Vulnerability Management System (VMS).
For SaaS components you can't scan yourself, obtain the provider's prior vulnerability
scanning reports instead. Evidence is the scan schedule plus the latest report — a scanner
that's installed but hasn't run within the cadence is a fail.

**1b. Cloud security posture management (ST-2).** For cloud-hosted systems, enable CSPM
performing **continuous configuration scans** on cloud assets — **AWS Security Hub, Azure
Defender for Cloud, or Google Security Command Center**. This catches the
misconfiguration class (open buckets, permissive security groups, unencrypted stores)
that host scans don't. Its findings join the ST-5 register like any other source.

### Stage 2 — Public disclosure channel (ST-3)

Establish the SSP-defined public reporting channel (st-3_prm_1) for vulnerabilities in
**public-facing systems**. The catalog's recommended shapes: the **security.txt standard**
(RFC 9116 — served at `/.well-known/security.txt` over HTTPS, with `Contact` and a
non-expired `Expires` no more than a year out) or a **vulnerability reporting link on all
pages**, such as in the footer. A security.txt at the wrong path, or with an expired
`Expires`, fails the RFC and defeats the channel — researchers' tooling looks in exactly
one place.

### Stage 3 — The security testing programme (ST-4)

Conduct and **document** the SSP-defined testing type (st-4_prm_1 — typically a
penetration test / VAPT) every **st-4_prm_2 days**, by **internal teams or independent
external parties**. Refer to the **WOG Security Testing Guidelines** for scoping and
methodology; a new internet-facing service should be tested **before launch**, not on the
first anniversary. Systems seeking the **Government Bug Bounty Programme** need a passing
**Agency Readiness Scorecard** rating first. "Documented" is load-bearing: scope, rules
of engagement, findings, and the remediation retest are the audit evidence — an informal
poke-around by the dev team leaves nothing an auditor can accept, and testers need
independence from the code they're testing.

### Stage 4 — Vulnerability management (ST-5)

**Triage, prioritise, then remediate or risk-accept** every finding — from ST-1 scans,
ST-2 CSPM, ST-4 tests, the ST-3 channel, *and* the CI scanners — within the SSP timeframe
for its severity: Critical ≤ st-5_prm_1 days, High ≤ st-5_prm_2, Medium ≤ st-5_prm_3, Low
≤ st-5_prm_4. Two rules with teeth:

- **Prioritise by exploitation, not just CVSS.** A vulnerability with known active
  exploitation — check **CISA's Known Exploited Vulnerabilities Catalog** — jumps the
  queue regardless of its severity label.
- **Risk acceptance requires the approving authority's consent, documented** — with the
  rationale, compensating controls, and an expiry/review date. A dev lead waving a finding
  through is not risk acceptance; it's an unmanaged vulnerability with a signature on it.

Keep one register with the found-date and SLA due-date per finding so breaches are visible
arithmetic, not archaeology.

## Audit checklist

Verify each row; record evidence. "Param" marks controls whose pass criteria come from the
SSP — ask for the values rather than inventing them.

| ID | Check | Where | Param |
|---|---|---|---|
| ST-1 | Host VA scans of type st-1_prm_1, authenticated where possible, every ≤ st-1_prm_2 days; latest report within cadence; CI code scanning not counted as coverage | Scan schedule + latest report | ✓ |
| ST-2 | CSPM with continuous configuration scans enabled on all cloud assets (Security Hub / Defender for Cloud / SCC) | CSPM console / config | |
| ST-3 | Public reporting channel of type st-3_prm_1 live: security.txt at /.well-known/ over HTTPS with valid unexpired Expires, or a reporting link on all pages | Live URL / page footer | ✓ |
| ST-4 | Documented st-4_prm_1 every ≤ st-4_prm_2 days by internal teams or independent external parties; scope, RoE, findings, retest on record; pre-launch test for new public services | Test report + date | ✓ |
| ST-5 | All finding sources in one register; triage + prioritisation (incl. KEV/active exploitation); remediation or documented approving-authority risk acceptance within the four severity SLAs | Register + acceptance records | ✓ |

Report per control ID with pass / fail / not-applicable-per-SSP, the evidence found, and —
for failures — the fix from `references/programme-templates.md`. Where a pass depends on an
SSP parameter that isn't stated, ask for the value; don't guess a cadence or SLA.

## Related skills in this repo

- **ssp-navigator** — decides which SSP applies and at which level each ST control sits
  (all-Level-1 in low-risk plans; ST-1/ST-3/ST-4 promoted to Level 0 in medium-risk cloud;
  all five at Level 0 for high-risk CII). Use it before declaring any ST control out of
  scope.
- **secure-pipeline** — SD/SC: SAST (SD-4), dependency scanning (SD-5), secret detection
  (SD-6), and pipeline DAST (SD-9) live there, *not* under ST-1 — but their findings feed
  the ST-5 register and SLAs.
- **container-security** — CS: image scanning and registry hygiene for containerised
  workloads; pair it with ST-1 host scans rather than substituting one for the other.
- **secure-coding-as** — AS/CK: where the actual fixes for application-layer findings land
  once ST-4 or the ST-3 channel surfaces them.
- **logging-monitoring** — LM's runtime threat detection (LM-9) complements ST-2's
  continuous configuration/posture scanning; the two are complementary, not substitutes.

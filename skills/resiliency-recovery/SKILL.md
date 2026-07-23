---
name: resiliency-recovery
description: >-
  Build or audit availability and recoverability for a Singapore government system
  against the ICT&SS Policy Reform (IM8 successor) Resiliency (RS-1..RS-3) and
  Backup & Recovery (BR-1..BR-6) controls: multi-AZ deployment with health checks
  and failover, load balancing and auto-scaling, periodic load testing, backups
  stored encrypted in a separate location, immutable backup retention (S3 Object
  Lock), recovery testing against RTO/RPO, and the disaster recovery plan,
  business continuity plan, and continuity exercises. Use when deploying or
  reviewing agency infrastructure for high availability, configuring AWS
  Backup/Azure Backup, setting backup frequency or retention, planning DR
  failover, or preparing RTO/RPO commitments. Triggers: multi-AZ or availability
  zones, auto-scaling, load testing, backup policy or schedule, immutable/
  ransomware-proof backups, restore or recovery testing, RTO/RPO, disaster
  recovery plan, business continuity exercise, single point of failure, IM8
  resiliency or backup requirements.
---

# resiliency-recovery: RS + BR controls for SG government systems

You are building or auditing **whether a Singapore government system stays up and can
come back** — the ICT&SS Policy Reform **Resiliency family (RS-1..RS-3)** and **Backup
& Recovery family (BR-1..BR-6)**, treated as one concern: RS keeps the service
available through zone failures and demand spikes; BR gets data and service back when
availability fails anyway.

Two facts anchor the families:

1. **A backup that has never been restored is a hypothesis.** BR-1 backups only count
   with BR-2 recovery tests proving full restore of *data and services* within the
   RTO/RPO — and BR-3 immutability is what keeps those backups alive through the
   ransomware scenario they exist for.
2. **Six of the nine controls carry SSP parameters.** AZ count, load-test cadence,
   backup frequency, recovery-test cadence, retention days, and exercise cadence are
   agency tailoring decisions. **Locate the values; never invent them** — a report that
   asserts "backups daily" without the SSP saying so is itself a finding.

## Source and currency

Control text in this skill and `references/rs-br-controls.md` is embedded from
**info.standards.tech.gov.sg as of 2026-07-23** (both family pages last updated 24
March 2026). The standards iterate. Verify against the live pages for anything
compliance-critical:

- RS: https://info.standards.tech.gov.sg/control-catalog/cybersecurity/rs/
- BR: https://info.standards.tech.gov.sg/control-catalog/cybersecurity/br/

## Reference files

- `references/rs-br-controls.md` — full text of RS-1..RS-3 and BR-1..BR-6 (statement,
  recommendations, risk, parameters) plus cross-family notes. Read it for exact wording
  in audit responses or SSP documentation.
- `references/dr-bcp-templates.md` — skeletons and checklists for the plan-and-exercise
  controls: DR plan (BR-4), BCP (BR-5), exercise formats and evidence log (BR-2/BR-6),
  and load-test harness notes (RS-3). Read it when producing those artifacts.

## Before you start: the SSP parameters

| Control | Parameter | What the SSP defines |
|---|---|---|
| RS-1 | rs-1_prm_1 | Number of availability zones to deploy to |
| RS-3 | rs-3_prm_1 | Load-testing frequency (days) |
| BR-1 | br-1_prm_1 | Backup frequency (days) |
| BR-2 | br-2_prm_1 | Recovery-testing frequency (days) |
| BR-3 | br-3_prm_1 | Immutable backup retention (days) |
| BR-6 | br-6_prm_1 | Business continuity exercise frequency (days) |

Ask for the project's SSP (the sibling skill **ssp-navigator** determines which SSP
applies); if values are blank, flag the gap as its own finding. RTO and RPO come from
business requirements and the risk assessment (BR-4) — they are inputs you collect,
and RPO must be consistent with the backup frequency (`br-1_prm_1`): an RPO of 1 hour
with daily backups is a contradiction to surface, not paper over.

## Procedure

Work **stay-up → come-back → prove-it**. For **setup**, produce each
configuration/artifact. For **audit**, verify each and record pass / fail /
not-applicable-per-SSP with evidence (the ASG/subnet config, the backup vault policy,
the object-lock setting, the test records, the plan documents).

### Stage 1 — Stay up (RS-1, RS-2, RS-3)

**1a. Multi-AZ (RS-1).** Deploy across the SSP-defined number of AZs: subnets per AZ,
load balancer spanning them, compute spread with health checks and automated failover
(ASG/managed instance groups; topology spread + pod disruption budgets for Kubernetes),
and **data replicated across AZs** (RDS Multi-AZ, zone-redundant storage). A "multi-AZ"
app whose database lives in one AZ still has the single point of failure.

**1b. Dynamic scaling (RS-2).** Auto-scaling driven by real signals (CPU, request
count, queue depth) behind load balancing — scale out before saturation, scale in to
cut idle capacity; serverless/managed autoscaling counts. Fixed instance counts sized
for peak are a finding in both directions.

**1c. Load testing on cadence (RS-3).** Every `rs-3_prm_1` days, against a
**production replica**, with load that mimics real user traffic and the spike shapes
you actually fear. Pass criteria tie to SLOs and to whether autoscaling actually
engaged. Harness notes in `references/dr-bcp-templates.md`.

### Stage 2 — Come back (BR-1, BR-3, BR-4, BR-5)

**2a. Backups, separate and encrypted (BR-1).** All important data and systems backed
up at least every `br-1_prm_1` days via CSP-managed tooling (AWS Backup / Azure Backup
/ GCP Backup and DR), stored **separately from primary storage** (separate
account/vault at minimum) and encrypted at rest. For SaaS, confirm the provider's
restore capability in writing. Where backups live is constrained by **DP-1 residency**
(data-protection) — an overseas backup vault is a residency breach, not a BR win.

**2b. Immutable retention (BR-3).** Backups cannot be modified or deleted for
`br-3_prm_1` days (or the agency retention policy): S3 Object Lock in compliance mode,
Azure immutable blob storage, vault lock policies — plus deny-delete IAM on the vault.
This is the ransomware control; soft-delete alone is not immutability.

**2c. DR plan (BR-4).** A maintained, regularly tested plan restoring critical
functions and data within the RTO/RPO: roles, detection and declaration, per-scenario
recovery procedures, communications, validation, test log. Template in
`references/dr-bcp-templates.md`. The RTO/RPO themselves are business decisions —
collect, don't invent.

**2d. BCP (BR-5).** The business-level continuity plan (degraded-mode operations,
manual workarounds, activation and comms), built on the CSA Cybersecurity Toolkit
templates; the DR plan is its systems layer.

### Stage 3 — Prove it (BR-2, BR-6)

**3a. Recovery testing (BR-2).** Every `br-2_prm_1` days, actually restore — **data
and services, fully** — and measure against RTO/RPO. A snapshot-exists check is not a
recovery test. Record date, scenario, RTO/RPO met, gaps, and actions: the record is
the audit evidence.

**3b. Continuity exercises (BR-6).** Every `br-6_prm_1` days, exercise the BCP —
checklist walkthrough, tabletop, or simulation/game-day — with the same evidence
discipline. Feed gaps back into the plans (BR-4/BR-5 both require their plans to be
*maintained*, and exercises are what force the updates).

## Audit checklist

| ID | Check | Where | Param |
|---|---|---|---|
| RS-1 | Deployed across rs-1_prm_1 AZs; LB + health checks + automated failover; data replicated across AZs | Subnets, ASG/LB, DB config | ✓ |
| RS-2 | Auto-scaling on real signals behind load balancing; no fixed peak-sized fleet | Scaling policies | |
| RS-3 | Load tests every rs-3_prm_1 days on a prod replica with realistic traffic; results recorded | Test reports | ✓ |
| BR-1 | All important data/systems backed up every br-1_prm_1 days; separate location; encrypted | Backup plans/vaults | ✓ |
| BR-2 | Recovery tested every br-2_prm_1 days; full data+service restore proven within RTO/RPO | Test records | ✓ |
| BR-3 | Backups immutable for br-3_prm_1 days (Object Lock/vault lock); no delete path | Vault/bucket config | ✓ |
| BR-4 | DR plan exists, maintained, exercised; RTO/RPO from business requirements; roles/procedures/comms | Plan + test log | |
| BR-5 | BCP exists (CSA toolkit-based), covering degraded-mode business operations | Plan | |
| BR-6 | BC exercise every br-6_prm_1 days; records with gaps and actions | Exercise records | ✓ |

Report per control ID with pass / fail / not-applicable-per-SSP, the evidence found,
and the fix. Route findings about *where* backups reside or their encryption mechanics
to DP (data-protection), and user-facing downtime notices to the DSS PR controls
(sg-service-shell), rather than double-counting them here.

## Related skills in this repo

- **ssp-navigator** — which SSP applies, at which level each RS/BR control sits, and
  where the six parameter values live. Use it before declaring any control out of
  scope.
- **data-protection** — DP-1 residency constrains where backups and DR targets may
  live; DP-2 owns encryption-at-rest mechanics; DP-5/DP-6 own sanitisation and
  witnessed destruction when backup media retire. BR owns the backup lifecycle itself.
- **sg-service-shell** — the DSS user-facing twins: PR-3 24/7 availability (what
  RS-1/RS-2 deliver) and PR-4 scheduled-downtime notices (what users see when DR/BC
  events interrupt service).
- **container-security** — CS hardens the containers whose placement (topology spread,
  pod disruption budgets, multi-AZ node groups) implements RS-1 for containerised
  workloads.
- **logging-monitoring** — LM owns the health-check alerting, SLOs, and golden signals
  that detect the failures RS absorbs, and the monitoring evidence load tests are
  judged against.

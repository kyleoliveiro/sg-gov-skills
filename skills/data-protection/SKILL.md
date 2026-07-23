---
name: data-protection
description: >-
  Build or audit a system's data handling against the Singapore Government's ICT&SS Policy
  Reform (IM8 successor) Data Protection controls (DP-1..DP-8): Singapore data residency,
  encryption at rest and in transit, central cloud tenant management, storage sanitisation
  and witnessed destruction, data loss prevention, and classification disclosure in the
  UI. Use whenever handling government data classifications, pinning cloud regions or
  checking cross-region replication, configuring encryption, decommissioning storage,
  setting up DLP, or when PDPA questions come up on an agency project. Triggers: "data
  residency", IM8 data protection requirements, DP controls, ap-southeast-1 pinning,
  encryption at rest / in transit for government data, AWS Organizations / landing zone /
  GCC tenancy, media sanitisation or disposal, DLP, PDPA or PSGA obligations, maximum
  classification for input fields.
---

# data-protection: DP controls for SG government systems

You are building or auditing **how a system stores, moves, and disposes of government
data** against the ICT&SS Policy Reform **Data Protection family (DP-1..DP-8)**: where
data may reside, encryption at rest and in transit, the cloud tenancy it lives in,
sanitising and destroying the media it touched, preventing loss in flight, and telling
users what classification they may put in.

Two facts anchor everything:

1. **DP-1 (data residency) sits in the Level-0 spine of every published SSP** —
   mandatory, no deviation path, for cloud and on-prem alike. Residency is the one
   control you cannot trade away, and it fails quietly: a cross-region replica, an
   overseas DR target, or a managed service that processes in another region breaches it
   without any code change.
2. **The data classification determines the strength of everything else.** Confirm the
   maximum classification (and sensitivity tier) with the data owner before assessing any
   DP control — "we think it's just OPEN data" is where breaches start.

## What this family is *not* about

- **Encryption algorithms and key management are CK** (secure-coding-as). DP-2/DP-3 say
  *that* data at rest and in transit must be encrypted; the CK family owns *how* — the
  approved algorithms, key storage, and rotation. A weak cipher or a mishandled key is a
  CK finding, not a DP one.
- **GenAI input safeguards are the Gen-AI overlay** (gen-ai-security). For GenAI features,
  DLP on uploads is GA-6 and the classification disclosure at model inputs is DP-8 *as
  shipped with that overlay*. This skill owns DP-8 for ordinary internal applications and
  DP-7 for general data flows.
- **Backups are BR, access logs are LM.** DP-1 still constrains *where* backups and logs
  may reside, but their lifecycle belongs to those families.
- **The PDPA trap.** Singapore **public agencies are excluded from the PDPA**; the public
  sector regime is the **Public Sector (Governance) Act (PSGA)** plus the ICT&SS/IM8
  policies themselves — with criminal penalties for unauthorised disclosure or misuse of
  data by public officers. "The PDPA doesn't apply to us" is true and *changes nothing*
  about these obligations; vendors additionally carry them by contract. Never let a
  PDPA-exclusion claim excuse a DP control. (Context, not legal advice — route legal
  questions to the agency's counsel.)

## Source and currency

Control text in this skill and `references/dp-controls.md` is embedded from
**info.standards.tech.gov.sg as of 2026-07-23**; the DP family page was last updated **24
March 2026**. The standards iterate. For any compliance-critical decision, verify against
the live page:

- DP control catalog: https://info.standards.tech.gov.sg/control-catalog/cybersecurity/dp/

## Reference files

- `references/dp-controls.md` — full text of DP-1..DP-8 (statement, recommendations,
  risk, the four parameters), the classification background, and cross-family notes. Read
  it when you need exact wording for an audit response or SSP documentation.
- `references/implementation-recipes.md` — concrete config and artifacts per control:
  region-pinning SCPs and replication checks, at-rest/in-transit encryption verification,
  landing-zone notes, the sanitisation-and-witness SOP, DLP setup, and the DP-8 input
  disclosure. Read it when actually building.

## Before you start: classification and the SSP parameters

Confirm the **maximum data classification and sensitivity tier** with the data owner, and
get these parameter values from the System Security Plan — if the SSP is missing or the
values are blank, flag that as its own finding (the sibling skill **ssp-navigator**
determines levels):

| Control | Parameter | What the SSP defines |
|---|---|---|
| DP-1 | dp-1_prm_1 | The country the data must reside in (Singapore for government data) |
| DP-1 | dp-1_prm_2 | The type/classification of data requiring enforced residency |
| DP-4 | dp-4_prm_1 | The systems to be hosted on a central tenant |
| DP-4 | dp-4_prm_2 | The central tenant management structure |

DP-1 is Level 0 in every SSP; the rest of the family commonly sits at Level 1 — the
project's own SSP is authoritative for which level applies.

## Procedure

Work in this order. For **setup**, produce each configuration/artifact. For **audit**,
verify each and record pass / fail / not-applicable-per-SSP with evidence (the SCP and
region config, the encryption settings, the org structure, the witness records, the DLP
policy, the UI screenshot). Recipes for every step are in
`references/implementation-recipes.md`.

### Stage 1 — Pin the data down (DP-1, DP-4)

**1a. Enforce residency in code, not intention (DP-1).** All in-scope data (dp-1_prm_2)
resides in dp-1_prm_1 — Singapore. Enforcement means technical guardrails: deny non-SG
regions via SCP/policy, pin resources to `ap-southeast-1` (or the SG region of your CSP),
and then hunt the quiet leaks — **cross-region replication, overseas backup/DR targets,
managed services that process or fail over in another region, global CDN/edge caches
holding response data, and SaaS whose processing region isn't contractual**. Support
access from overseas and third-party subprocessors count as residency questions too — ask
the provider, don't assume.

**1b. Central tenant management (DP-4).** Host the in-scope systems (dp-4_prm_1) under
the central structure (dp-4_prm_2) — AWS Organizations / Azure Management Groups / GCP
Organizations with a landing zone, consistent guardrails, centralised logging, and
tagging. **GCC tenancies provide this by construction** — a standalone account outside
the agency's organisation is the finding to look for.

### Stage 2 — Encrypt everywhere (DP-2, DP-3)

**2a. At rest (DP-2).** Every store — block volumes, object storage, databases, queues,
caches, snapshots — encrypted at rest. CSPs encrypt much of this by default, but
**confirm and validate per service**; defaults vary by service and era, and a
pre-encryption-era volume or an exempted cache is a typical miss.

**2b. In transit (DP-3).** TLS on every hop, **including service-to-service traffic
inside the VPC** — network-layer encryption by the CSP does not excuse plaintext HTTP at
the application layer. Internal load balancers, queues, and database connections all
count.

For both: *which* algorithms, *where* keys live, and rotation are **CK** — pair with
secure-coding-as; here the question is coverage, not cipher choice.

### Stage 3 — Destroy what you retire (DP-5, DP-6)

Sanitise all hardware that stored data at rest; **shred or incinerate** storage meant for
retirement, using recognised standards (Gutmann, Schneier, DoD 5220.22-M). An **agency
staff member must witness** the sanitisation/destruction, under a documented SOP, with a
witness record per device — a vendor certificate alone is not a witnessed destruction. In
cloud, physical media sanitisation is the CSP's responsibility under its certifications;
the agency-witnessed process applies to media the agency controls (on-prem disks, office
equipment, USB media, devices returned at contract end). Selling or e-waste-binning an
old NAS without this fails DP-5 *and* DP-6.

### Stage 4 — Watch the flows (DP-7)

Implement DLP that **monitors data flows, detects sensitive-data transfers, and blocks
unauthorised sharing** — built-in solutions first (Microsoft Purview, Google Workspace
DLP rules), tuned to the classifications in play, with policies reviewed on a schedule.
For GenAI features, the upload-specific DLP requirement is GA-6 (gen-ai-security); DP-7
is the general mechanism across email, storage, and endpoints.

### Stage 5 — Tell users the ceiling (DP-8)

For **internal applications serving public officers**, state the highest permitted
security/sensitivity classification for input data — text, audio, uploads — **in the UI
(at or near the input field) and in the user guides**. Keep the message in sync with what
the system is actually authorised to hold; a disclosure that overstates the ceiling is
worse than none.

## Audit checklist

Verify each row; record evidence. "Param" marks controls whose pass criteria come from
the SSP — ask for the values rather than inventing them.

| ID | Check | Where | Param |
|---|---|---|---|
| DP-1 | All in-scope data pinned to Singapore; no cross-region replication/backup/DR/processing leaks; guardrail enforced (SCP/policy), not just convention | Region config + SCP + service docs | ✓ |
| DP-2 | Every store encrypted at rest, validated per service (volumes, objects, DBs, caches, snapshots) | Storage config | |
| DP-3 | TLS on every hop including internal service-to-service, LBs, queues, DB connections | Network/app config | |
| DP-4 | Systems under the central tenant structure with landing-zone guardrails; no orphan accounts | Org / tenancy structure | ✓ |
| DP-5 | Retired storage sanitised to a recognised standard; shred/incinerate for disposal | Decommissioning records | |
| DP-6 | Agency staff witnessed sanitisation/destruction under a documented SOP, per-device records | SOP + witness records | |
| DP-7 | DLP monitoring flows, detecting sensitive transfers, blocking unauthorised sharing; policies reviewed | DLP config + policy | |
| DP-8 | Internal officer-facing inputs show the max permitted classification at/near the field and in guides | UI + user guide | |

Report per control ID with pass / fail / not-applicable-per-SSP, the evidence found, and —
for failures — the fix from `references/implementation-recipes.md`. Attribute
algorithm/key findings to CK, not DP; and correct, don't accept, any "PDPA doesn't apply
so this doesn't matter" reasoning.

## Related skills in this repo

- **ssp-navigator** — which SSP applies and at which level each DP control sits (DP-1 is
  Level 0 everywhere; it also fills dp-1/dp-4 parameter values).
- **secure-coding-as** — CK: the approved algorithms, key management, and rotation behind
  DP-2/DP-3, plus application-layer secrets (AS-8).
- **gen-ai-security** — the Gen-AI overlay's GA-6 upload DLP and DP-8-at-model-inputs;
  use it for GenAI features, this skill for the general estate.
- **secure-pipeline / container-security** — where encrypted artifacts and images are
  built and stored; registries and caches are stores too and fall under DP-1/DP-2.
- **logging-monitoring** — the LM family owns access-log capture, retention, and
  lifecycle; DP-1 still constrains *where* those logs reside, but LM governs them.

---
name: gen-ai-security
description: >-
  Build or audit a Generative AI feature so it satisfies the Singapore Government's ICT&SS
  Policy Reform (IM8 successor) Gen-AI SSP overlay — the 8 GA controls (GA-1..GA-8) plus
  DP-8. Use whenever writing, reviewing, or hardening code that calls a GenAI/LLM API,
  builds a RAG or agent or chatbot feature, self-hosts open-weights models, or handles
  user prompts/uploads for a Singapore government agency project, or when preparing for a
  security audit or VAPT of a GenAI application. Triggers: "ICT&SS Gen-AI requirements",
  IM8 GenAI controls, GA controls, LLM/chatbot/RAG/agent for a government service, GenAI
  data classification limits, overseas vs Singapore-hosted GenAI API, GCC 2.0 GenAI API,
  no-log no-train agreement, safetensors / approved model loaders, open-weights model
  hosting, GenAI file upload safeguards, LLM output evaluation / safety testing, prompt
  injection testing, hallucination acknowledgement, GenAI security audit, data
  classification disclosure for AI inputs.
---

# gen-ai-security: GA controls for SG government GenAI features

You are building or auditing a **Generative AI feature** against the ICT&SS Policy Reform
**Gen-AI SSP overlay**: the **8 GA controls (GA-1..GA-8) plus DP-8** — nine controls in
total. The family's scope is *securing the use of GenAI models and applications*: where the
model runs, what data may reach it, the provenance of self-hosted weights, input
safeguards, output evaluation, and user awareness. Most of these are decisions you bake in
on day one, and exactly what an audit or VAPT of a GenAI service walks through.

The single decision everything hangs on: **the maximum data classification the feature
handles determines which model/provider you may call.** Get that boundary right first; the
rest follows.

## What this family is *not* about

The GA controls are about **data-classification governance, provider agreements, weight
provenance, input safeguards, output evaluation, and user awareness** — not primarily about
prompt-engineering defenses. Two things people wrongly expect here:

- **Prompt injection / jailbreak defense** has no separately named GA control. It is tested
  under **GA-7 (safety)** and fixed as **Application Security (secure-coding-as)**. Cover
  it — but don't cite a non-existent "GA prompt-injection control."
- **The provider API key** is an application secret (**AS-8**, secure-coding-as), not GA-3.
  GA-3 governs the provider's *contract*, not how you store the key.

## Source and currency

Control text in this skill and `references/ga-controls.md` is embedded from
**info.standards.tech.gov.sg as of 2026-07-22**; the pages were last updated **24 March
2026**. The standards iterate actively. For any compliance-critical decision, verify
against the live pages:

- GA control catalog: https://info.standards.tech.gov.sg/control-catalog/cybersecurity/ga/
- Gen-AI SSP overlay: https://info.standards.tech.gov.sg/ssp/gen-ai/

## Reference files

- `references/ga-controls.md` — full text of all 8 GA controls + DP-8 (statement,
  recommendations, risk, the two GA-5 parameters), data-classification background, and
  cross-family notes. Read it when you need exact wording, e.g. for an audit response or
  SSP documentation.
- `references/implementation-recipes.md` — concrete, framework-neutral code and config per
  control: provider-routing by classification, the GA-3 agreement checklist, safetensors /
  approved-loader loading, file-upload safeguards, DP-8 input disclosure, the GA-7 eval
  harness, and the GA-8 acknowledgment gate. Read it when actually building.

## Before you start: find the SSP and the data classification

Two inputs gate everything. Get them before writing code; if either is missing, flag it
first rather than guessing.

**1. The maximum data classification** the feature will process (confirm with the data
owner). This sets the GA-1/GA-2 routing ceiling. Don't assume "it's just a chatbot, it's
low-risk" — a public assistant that can be fed CONFIDENTIAL case data is a CONFIDENTIAL
system.

**2. The System Security Plan (SSP)** selects which controls apply at which level and sets
parameter values. GA-5 carries **two agency-defined parameters** the catalog leaves blank:

| Control | Parameter | What the SSP defines |
|---|---|---|
| GA-5 | ga-5_prm_1 | The approved model **formats** for open-weights models (e.g. safetensors) |
| GA-5 | ga-5_prm_2 | The approved model **loaders** for open-weights models |

**Ask for the SSP's values; do not invent an approved-format or approved-loader list.** If
no SSP exists yet, flag that — the sibling skill **ssp-navigator** determines whether the
Gen-AI overlay applies and at which level each GA control sits for this system. GA-5's
parameters only matter if you **self-host open-weights models**; a pure API integration can
mark GA-5 not-applicable (and should say why).

## Procedure

Work in this order. For **setup**, apply each step. For **audit**, verify each and record
pass / fail / not-applicable-per-SSP with evidence (the route config, the signed agreement,
the loader version, the eval report, the UI screenshot). Recipes for every step are in
`references/implementation-recipes.md`.

### Stage 1 — Decide where the model runs (GA-1, GA-2, GA-3, GA-4)

**1a. Route by data classification (GA-1/GA-2).** Overseas-hosted GenAI APIs may process
only up to **RESTRICTED / SENSITIVE NORMAL**; Singapore-hosted only up to **CONFIDENTIAL /
SENSITIVE HIGH**. Make this a code invariant: tag each call site with the max classification
it can carry and refuse to dispatch above the route's ceiling — don't leave it to a comment
or a wiki page. Watch the **cross-region trap**: an "SG region" endpoint that can fail over
or infer overseas counts as overseas (GA-1) for classification.

**1b. Get the no-log/no-train agreement (GA-3).** You need a **legally-binding** provider
commitment: no logging, storage, or retention of inputs/outputs, and no training on them —
covering **all endpoints, parameters, outputs, and models** you call. Prompt caching is
allowed only if **TTL ≤ 24 hours**. **GCC 2.0 GenAI API services satisfy GA-3** — prefer
them and you skip the bespoke agreement; for any other provider, the signed agreement is
the audit evidence.

**1c. Clear the environment for self-hosted models (GA-4).** If you self-host, the serving
environment must be authorized for the **highest data classification** in the system it
serves (per the relevant IM8 SSP for that classification). Self-hosting in a container
brings the **Container Security** family in for the image and cluster — pair with the
container-security skill.

### Stage 2 — Secure the weight supply chain (GA-5)

Open-weights only. The risk is **arbitrary code execution at load time**. Use an approved
**format** (ga-5_prm_1 — commonly **safetensors**, a non-executable tensor container) and
never `torch.load` an untrusted pickle checkpoint (`.bin`/`.pt`/`.ckpt`), which executes
code while deserializing. Load via an approved, **frequently updated** loader (ga-5_prm_2) —
loader CVEs are the attack path; pin by version/digest and take reviewed bumps. Pull weights
from a trusted, access-controlled source and verify checksums.

### Stage 3 — Guard the inputs (GA-6, DP-8)

**3a. File-upload safeguards (GA-6)** — only if uploads are enabled. **Disable bulk/batch
uploads**, require **per-file classification confirmation** (rejecting anything above the
route ceiling), run **DLP** on extracted text before it reaches the prompt, and validate
type/size. Treat extracted document text as untrusted (indirect prompt injection — test
under GA-7).

**3b. Classification disclosure at input fields (DP-8).** Show the maximum permitted
classification **at or near every input field** that reaches the model (and in the user
guide), kept in sync with the actual route. Visible, not buried in help.

### Stage 4 — Evaluate outputs (GA-7)

Build an **evaluation harness** with defined **metrics, test scenarios, and criteria**
across three axes: **accuracy** (task correctness, RAG groundedness), **safety** (refusals,
PII leakage, and prompt-injection/jailbreak resistance — direct and indirect), and
**quality** (format, tone, no fabricated citations). Run it as a **gate that re-runs after
every model or prompt change**, document the approach, and store results per model version
to catch regressions. This is where prompt injection gets tested — it has no separate
control.

### Stage 5 — Inform users (GA-8)

Require an **explicit acknowledgment** of hallucination risk (a checkbox or "I Agree")
**before** the app can be used — gate on it **server-side**, not just in the UI. Add a
**risk clause in the Terms of Use**, a **prominent persistent indicator** that outputs are
AI-generated, and **educational material** on responsible use.

## Audit checklist

Verify each row; record evidence. "Param" marks the control whose pass criteria come from
the SSP. GA-4/GA-5 apply only when self-hosting open-weights models — mark
not-applicable-per-SSP with a reason otherwise.

| ID | Check | Where | Param |
|---|---|---|---|
| GA-1 | Overseas GenAI API only sends ≤ RESTRICTED/SENSITIVE NORMAL; enforced in code, not prose | Routing/dispatch code | |
| GA-2 | SG-hosted GenAI API only sends ≤ CONFIDENTIAL/SENSITIVE HIGH; cross-region processing checked | Routing/dispatch code | |
| GA-3 | Legally-binding no-log/no-train agreement covering all endpoints; cache TTL ≤ 24h; or GCC 2.0 | Contract / provider config | |
| GA-4 | Self-hosted model environment authorized for the system's highest data classification | Hosting env / SSP | |
| GA-5 | Open-weights loaded from an approved format (safetensors) via an approved, updated loader; no pickle | Model-loading code | ✓ |
| GA-6 | Bulk uploads disabled; per-file classification confirm; DLP on extracted text; type/size validation | Upload handler | |
| DP-8 | Max permitted classification shown at/near every model input field and in the guide | UI + user guide | |
| GA-7 | Defined accuracy/safety/quality metrics + scenarios; safety incl. prompt-injection; gates on model change | Eval harness / CI | |
| GA-8 | Explicit hallucination acknowledgment before access (server-enforced); ToU clause; prominent AI indicator | UI + ToU | |

Report per control ID with pass / fail / not-applicable-per-SSP, the evidence found, and —
for failures — the fix from `references/implementation-recipes.md`. Where a pass depends on
the SSP (GA-5 formats/loaders), ask for the SSP value rather than inventing one.

## Related skills in this repo

- **ssp-navigator** — decides *whether* the Gen-AI overlay applies and at which level each
  GA control sits (and where GA-1/GA-2 gate on data classification). Use it before declaring
  any GA control in or out of scope; this skill implements what it selects.
- **secure-coding-as** — Application Security (AS) + Crypto/Key Management (CK): where the
  **provider API key (AS-8)** lives, and where **prompt-injection fixes** land as input
  handling and least-privilege tool design once GA-7 testing surfaces them.
- **container-security** — CS controls for a **self-hosted model's serving image and
  cluster**; pair with GA-4 when you host open-weights models in containers.
- **secure-pipeline** — SD + SC: the GA-5 loader is a pinned dependency (SC-4) and the eval
  harness is a required CI check (SD-3); wire GA-7 into the pipeline gate there.
- **data-protection** — the DP family this overlay leans on: **DP-8** classification
  disclosure (Stage 3), and the residency/encryption controls that decide which data may
  reach GA-1 overseas vs GA-2 Singapore-hosted models.
- **security-testing** — ST controls for the GenAI VAPT: GA-7 output evaluation and
  prompt-injection testing feed the vulnerability programme and remediation SLAs (ST-5).

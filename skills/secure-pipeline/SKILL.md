---
name: secure-pipeline
description: >-
  Set up or audit a repository and CI/CD pipeline that satisfies the Singapore
  Government's ICT&SS Policy Reform (IM8 successor) Secure Development (SD-1..SD-10) and
  Software Supply Chain (SC-1..SC-9) controls. Use whenever creating a repo, configuring
  CI/CD, reviewing pipeline or infra config, or preparing for a security audit on a
  Singapore government agency project. Triggers: "IM8 pipeline requirements", "ICT&SS
  secure development", branch protection, secret scanning, push protection, dependency
  pinning, lockfiles, SAST/DAST gates, artifact signing, cosign, provenance, supply chain
  security, environment segregation, DevSecOps for agency work, SHIP-HATS, SSP secure
  development controls.
---

# secure-pipeline: SD + SC controls for SG government delivery

You are configuring or auditing a repo + pipeline against 19 controls from the ICT&SS
Policy Reform Cybersecurity Control Catalog: **SD-1..SD-10** (Secure Development) and
**SC-1..SC-9** (Software Supply Chain). These are the controls a security audit will walk
through for the delivery pipeline, and most are pure configuration — cheap to set up on
day one, expensive to retrofit under audit pressure.

## Source and currency

Control text in this skill and `references/sd-sc-controls.md` is embedded from
**info.standards.tech.gov.sg as of 2026-07-16**. The standards iterate actively. For any
compliance-critical decision, verify against the live pages:

- SD: https://info.standards.tech.gov.sg/control-catalog/cybersecurity/sd/
- SC: https://info.standards.tech.gov.sg/control-catalog/cybersecurity/sc/

Machine-readable OSCAL: https://github.com/GovtechSG/tech-standards — useful for
tooling, but it **lags the site**; the site is authoritative.

## Reference files

- `references/sd-sc-controls.md` — full text of all 19 controls (statement,
  recommendations, risk statement, parameters). Read it when you need exact wording,
  e.g. for an audit response or SSP documentation.
- `references/platform-recipes.md` — concrete GitHub and GitLab recipes per control,
  with plan-gating notes and open-source fallbacks (gitleaks, semgrep, trivy, ZAP,
  cosign). Read it when actually configuring a platform.

## Before you start: find the SSP

Every agency system has a **System Security Plan (SSP)** that selects which controls
apply at which level and **sets the parameter values**. Three of these 19 controls carry
agency-defined parameters — the catalog deliberately sets no values:

| Control | Parameter | What the SSP defines |
|---|---|---|
| SD-4 | sd-4_prm_1 | Where static analysis runs (typically "CI/CD pipeline, per merge request") |
| SD-5 | sd-5_prm_1, sd-5_prm_2 | Dependency scan frequency in days, and where it runs |
| SD-6 | sd-6_prm_1, sd-6_prm_2 | Where secret detection runs, and the remediation SLA in days for true positives |
| SD-9 | sd-9_prm_1 | Where dynamic analysis runs |

**Ask for the project's SSP (or the agency ISO/CISO contact) and use its values. Never
invent a frequency or SLA** — writing "7 days" into a pipeline when the SSP says 3 is a
finding. If no SSP exists yet, flag that first: PM-3/PM-4/PM-5 (SSP development,
residual-risk approval, central submission) are Level 0 in every cybersecurity SSP. The
sibling skill **ssp-navigator** determines which SSP applies and which level each SD/SC
control sits at for this system — notably SD-8 (environment segregation) is promoted to
**Level 0 (mandatory, no deviation) in the medium-risk cloud SSP**.

## Procedure

Work through the five lifecycle stages in order — each stage's controls assume the
previous stage. For **setup**, apply each step. For **audit**, verify each step and
record pass/fail with evidence (a settings screenshot, a config file path, a pipeline
run URL). Platform-specific mechanics for every step are in
`references/platform-recipes.md`.

### Stage 1 — Repository settings

**1a. Central VCS (SC-1).** Code lives in the organisation's sanctioned Git platform —
for whole-of-government teams usually SHIP-HATS (GovTech's GitLab-based CI/CD suite),
otherwise an agency-managed GitHub org or GitLab instance. Personal accounts and
unversioned file shares fail the control. Why: without central version control you lose
code history, consistency, and the substrate every other control here attaches to.

**1b. Push protection for secrets (SD-1).** Enable secret push protection (GitHub push
protection / GitLab secret push protection; gitleaks pre-commit + CI as fallback) so
secrets are rejected *at push*, before they enter history. Why: a secret in Git history
is compromised even after deletion — prevention is the only cheap point.

**1c. Protected default branch (SD-2).** No direct pushes, no force pushes, no branch
deletion on the default branch — for everyone, including admins (empty bypass list, or
audited break-glass only). Why: force pushes destroy history; direct pushes bypass every
CI gate and review requirement you set up below.

**1d. Peer review before merge (SC-3).** Require ≥1 approval from a designated reviewer
before merge; dismiss stale approvals on new commits; block self-approval. Use
CODEOWNERS/approval rules to route sensitive paths (auth, crypto, IaC) to the right
reviewers. Why: unreviewed merges are the main channel for both honest defects and
malicious insertion.

**1e. Commit signing (SC-2).** Configure the repo to reject unsigned commits (GitHub
ruleset "Require signed commits"; GitLab push rule "Reject unsigned commits" —
Premium-gated, see recipes for the fallback). Onboard every developer with SSH or GPG
signing keys registered to their platform account before enforcing, or the team is
blocked. Why: unsigned commits can impersonate any author; signing ties each change to
a verified identity.

### Stage 2 — Dependency hygiene

**2a. Pin everything (SC-4).** Direct *and transitive* dependencies pinned via a
committed lockfile (`package-lock.json`, `Pipfile.lock`, `go.sum`, `Cargo.lock`, …), and
enforce lockfile sync in CI. Version ranges in a manifest alone fail the control —
transitive versions still float. Also pin container base images by digest and CI actions
by commit SHA. Why: unpinned dependencies mean every build can silently pull different —
possibly compromised — code (version drift, dependency-confusion, hijacked releases).

If you cannot resolve an action's commit SHA or an image's digest right now (e.g. no
network access), pin what you can, mark each unresolved pin as an explicit blocking TODO
in the file, and report the control as **open — not satisfied**. Never let a runbook or
audit response claim SC-4 compliance while `uses:` lines still carry mutable tags: the
claim will fail its audit, and worse, it tells the team the job is finished when it
isn't.

**2b. Install only pinned versions at deploy (SC-6).** Every install step in CI and
Dockerfiles uses the lockfile-strict command: `npm ci` not `npm install`,
`pipenv sync` not `pipenv install`, `yarn install --immutable`,
`pip install --require-hashes`, etc. Audit grep: `npm install`/bare `pip install` in
Dockerfiles and deploy scripts. Why: a strict install makes the deploy reproduce exactly
what was reviewed and scanned; a resolving install can ship code nobody has seen.

**2c. Dependency scanning on a schedule (SD-5).** SCA scanning (Dependabot + dependency
review, GitLab Dependency Scanning, or osv-scanner/trivy/grype on a scheduled job)
running at least every **sd-5_prm_1 days per the SSP**, in the location the SSP names
(sd-5_prm_2). Emit an SBOM (SPDX or CycloneDX — syft works) as scan evidence. Why: known
CVEs in outdated libraries are the most common exploited weakness; scanning is only a
control if it actually runs on the required cadence.

### Stage 3 — CI gates

**3a. Tests must pass before merge (SD-3).** Required status checks / "pipelines must
succeed" on the default branch, with the check names pinned so a skipped workflow can't
silently satisfy the gate. Why: the default branch is what ships; a merge that never ran
tests puts regressions one deploy away from production.

**3b. Static analysis (SD-4).** SAST (CodeQL, GitLab SAST, or semgrep) plus IaC scanning
(trivy/checkov/KICS) in the location the SSP names (sd-4_prm_1 — typically the CI
pipeline per merge request). True-positive findings are **remediated or formally
risk-accepted before production deploy** — keep an auditable triage trail (suppressions
link to an issue with an approver). Why: static analysis catches vulnerability classes
(injection, misconfiguration) before they exist in any running environment.

**3c. Secret detection with an SLA (SD-6).** Full-history and ongoing secret scanning
(distinct from SD-1's push-time block — this catches what slipped through or predates
enablement) in the SSP-named location (sd-6_prm_1). True positives remediated within
**sd-6_prm_2 days per the SSP**, and remediation always means: **revoke/rotate the
credential, then purge it from Git history** — rewriting history without revoking fixes
nothing. Why: exposed secrets are live credentials; the SLA bounds the exposure window.

**3d. Masked, protected CI secrets (SD-7).** CI secrets limited to protected
pipelines/environments (so a branch pipeline or fork PR can't read deploy credentials)
and masked in job logs (GitLab masked variables; GitHub Actions secrets +
`::add-mask::` for derived values). Prefer OIDC federation to the cloud provider over
long-lived credentials at all. Why: CI logs are broadly readable; an unmasked secret in
a log is an unmonitored copy, and unprotected variables let anyone who can push a branch
exfiltrate them.

**3e. Dynamic analysis (SD-9).** DAST (GitLab DAST, OWASP ZAP baseline/full scan)
against a deployed staging/test environment, in the SSP-named location (sd-9_prm_1);
findings addressed or risk-accepted before production deploy. Active scans target
non-production only. Why: runtime testing finds what static analysis structurally cannot
— auth flaws, misconfigured endpoints, input-validation gaps in the composed system.

### Stage 4 — Build and artifact integrity

**4a. Consistent build with provenance (SC-5).** All release artifacts built by the
pipeline (never a laptop), with a record of how each artifact was built and deployed:
GitHub artifact attestations / SLSA provenance, GitLab runner artifact metadata
(`RUNNER_GENERATE_ARTIFACTS_METADATA`), or minimally commit SHA + pipeline URL bound to
the artifact. Why: without a build record you cannot prove — to an auditor or during an
incident — that what is running came from reviewed source.

**4b. Sign artifacts during build (SC-7).** Sign code and container images with Cosign
(keyless via the CI job's OIDC identity is the low-maintenance option) or AWS
Signer/Notation. Sign the digest, never a floating tag. Why: an unsigned artifact can be
swapped for a tampered one anywhere between registry and runtime with no detection.

**4c. Verify signatures before deploy (SC-8).** A verification step gating deployment:
a pipeline stage (`cosign verify` / `gh attestation verify` pinned to the exact expected
identity — repo, workflow, issuer) and/or a Kubernetes admission controller (Sigstore
policy-controller, Kyverno `verifyImages`). Why: signing without verification is
theatre; verification is the enforcement point that unsigned or foreign artifacts never
run.

### Stage 5 — Deploy segregation and process

**5a. Prod / non-prod segregation (SD-8).** Segregate across **all six planes** the
control names — applications, services, data, secrets, roles, networks — ideally with
separate cloud tenant accounts per environment (on GCC: separate accounts). Check each
plane explicitly: no production data in non-prod, separate secret stores, no standing
developer write access to prod, no network path from non-prod into prod, CI deploy
credentials scoped per environment (GitHub environments / GitLab protected environments
+ per-environment OIDC trust). Why: non-prod is the soft target; without segregation a
compromised dev environment cascades straight into production. **Level 0 in the
medium-risk cloud SSP** — no deviation possible there.

**5b. SSDLC framework (SD-10).** Document which framework governs the lifecycle — NIST
SSDF (SP 800-218), OWASP SAMM, or Microsoft SDL — with roles and responsibilities per
phase, and map its practices to concrete evidence (this pipeline's gates, threat
modelling at design, VAPT per ST-4, patch cadence). The other 18 controls here are the
build/deploy-phase evidence. Why: point controls without an owning framework decay;
audits ask "who is accountable" as much as "is it configured".

**5c. InnerSource (SC-9).** Default repos to internal visibility on the agency/WOG
platform, with CONTRIBUTING.md and a maintainer list — after screening for confidential
algorithms or embedded sensitive data (SD-1/SD-6 clean is a prerequisite). The Singapore
Government Developer Portal's InnerSource guidelines are the named framework. Why:
closed silos duplicate effort and hide bugs from the colleagues most likely to spot
them.

## Audit checklist

Verify each row; record evidence (setting location, config path, pipeline run URL).
"Param" marks controls whose pass criteria come from the SSP.

| ID | Check | Where | Param |
|---|---|---|---|
| SC-1 | Code in sanctioned central Git platform, SSO+MFA | Platform org | |
| SD-1 | Secret push protection enabled (or gitleaks pre-commit + CI) | Repo security settings | |
| SD-2 | Default branch: no direct push, no force push, no deletion, empty bypass | Ruleset / protected branch | |
| SC-2 | Unsigned commits rejected; all devs have signing keys | Ruleset / push rules | |
| SC-3 | ≥1 required approval; stale approvals dismissed; no self-approval | Ruleset / approval rules | |
| SD-3 | Named CI checks required before merge; no skip-path bypass | Ruleset / merge checks | |
| SC-4 | Lockfile committed and CI-enforced; base images by digest; actions by SHA | Repo + CI config | |
| SC-6 | All deploy installs lockfile-strict (npm ci, pipenv sync, …) | Dockerfiles, CI, deploy scripts | |
| SD-5 | SCA scan every ≤ sd-5_prm_1 days in sd-5_prm_2; SBOM emitted | Scheduler + scan reports | ✓ |
| SD-4 | SAST + IaC scan in sd-4_prm_1; findings fixed or risk-accepted pre-prod | CI config + triage trail | ✓ |
| SD-6 | Secret detection in sd-6_prm_1; true positives revoked+purged ≤ sd-6_prm_2 days | Scanner + remediation records | ✓ |
| SD-7 | CI secrets protected-pipeline-only and masked in logs; OIDC preferred | CI variable settings | |
| SD-9 | DAST in sd-9_prm_1 vs staging; findings fixed or risk-accepted pre-prod | CI config + triage trail | ✓ |
| SC-5 | Pipeline-only builds; provenance/attestation per artifact | Workflow + attestation store | |
| SC-7 | Artifacts signed at build (cosign/AWS Signer), by digest | Build job + registry | |
| SC-8 | Signature verification gates deploy (pipeline stage or admission controller) | Deploy job / cluster policy | |
| SD-8 | Prod/non-prod segregated: apps, services, data, secrets, roles, networks | Cloud accounts + IAM + network | |
| SD-10 | SSDLC framework documented with roles; practices mapped to evidence | Team docs / wiki | |
| SC-9 | Internal visibility + contribution docs, after sensitivity screening | Repo visibility + docs | |

Report audit results per control ID with pass / fail / not-applicable-per-SSP, the
evidence found, and — for failures — the fix from `references/platform-recipes.md`.

## Related skills in this repo

- **ssp-navigator** — which SSP applies and which level each SD/SC control sits at for
  this system; where sd-4/5/6/9 parameter values live. Use it before declaring any
  control out of scope.
- **secure-coding-as** — the AS (Application Security) family: input validation,
  password policy, session handling, CSP/HSTS. SD/SC secure the pipeline; AS secures the
  code flowing through it.
- **sg-service-shell** — scaffolding an agency service (SGDS shell, banner, footer)
  whose repo this skill then hardens.
- **dss-accessibility** — Digital Service Standards / WCAG 2.2 controls; its automated
  checks belong in the SD-3 CI gate.
- **container-security** — CS controls for a containerised build: base-image hardening
  and runtime policy. SC secures the image's provenance and signing (SC-7/SC-8); CS
  secures what's inside it. Use both for a containerised delivery.
- **security-testing** — ST controls: the DAST gate here feeds the VAPT programme, and
  ST-5 sets the remediation SLAs for what SAST/DAST and dependency scanning surface.

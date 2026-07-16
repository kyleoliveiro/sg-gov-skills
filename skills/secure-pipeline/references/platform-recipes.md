# Platform recipes — implementing SD-1..10 and SC-1..9 on GitHub and GitLab

Concrete, feature-accurate implementations (as of mid-2026) for each control. Where a
feature is plan-gated, that is called out with an open-source fallback. Feature names and
tier gating change — check the platform docs when something fails to appear in the UI.

Plan-gating quick reference:

- **GitHub**: security features are free on public repos. Private repos need the paid
  add-ons **GitHub Secret Protection** (secret scanning + push protection) and **GitHub
  Code Security** (CodeQL, dependency review) — the two halves of the former GitHub
  Advanced Security, sold separately since April 2025. Environments on private repos need
  Team/Enterprise. Artifact attestations on private repos need Enterprise Cloud.
- **GitLab**: push rules, required MR approvals, and protected environments are
  **Premium**. Dependency Scanning, DAST, secret push protection, and security dashboards
  are **Ultimate**. Basic SAST and pipeline Secret Detection scans run on all tiers.
- Whole-of-Government teams: **SHIP-HATS** (GovTech's central CI/CD suite, GitLab-based)
  ships with Ultimate-tier scanners and is the default answer for SC-1 on agency work.

Open-source fallback toolkit used throughout: **gitleaks** (secrets), **semgrep**
(SAST), **trivy** / **grype** + **syft** (dependency + container scanning, SBOM),
**osv-scanner** (dependency vulns), **OWASP ZAP** (DAST), **cosign** (signing).

---

## SD-1 — Push protection for secrets

**GitHub.** Settings → Security → Secret Protection → enable **Push protection**. Blocks
pushes containing detected secrets at the git layer, with a bypass audit trail
(bypass can be restricted to a reviewer list via "delegated bypass"). Free on public
repos; private repos require the Secret Protection add-on. Enforce org-wide via the org's
Code security configurations.

**GitLab.** **Secret push protection** (Settings → Security configuration), Ultimate
tier, GA since 17.x — blocks secrets at push time. On lower tiers, push rules can reject
commits matching a regex (Premium) but are not a real secret scanner.

**Fallback.** gitleaks in two layers: a pre-commit hook for developers
(`gitleaks protect --staged` via pre-commit framework) and a blocking CI job on every
branch push — this is detection-at-push, not true pre-receive rejection, so pair it with
SD-6 remediation (revoke + purge history with `git filter-repo`).

```yaml
# .github/workflows/gitleaks.yml (fallback)
on: push
jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: gitleaks/gitleaks-action@v2   # org license needed for org repos
```

## SD-2 — Protected default branch (no direct or force push)

**GitHub.** Prefer **rulesets** (Settings → Rules → Rulesets) over classic branch
protection — rulesets layer, apply org-wide, and cover more signals. Target the default
branch and enable: **Require a pull request before merging**, **Block force pushes**,
**Restrict deletions**. Leave the
bypass list empty (or break-glass admins only, audited). Classic branch protection
("Require a pull request…", "Do not allow bypassing", "Allow force pushes" off) is
equivalent if rulesets are unavailable.

**GitLab.** Settings → Repository → **Protected branches**: default branch, *Allowed to
push and merge* = **No one**, *Allowed to merge* = Maintainers (or Developers +
Maintainers), *Allowed to force push* = off. All tiers.

## SD-3 — CI tests must pass before merge

**GitHub.** In the same ruleset/branch protection: **Require status checks to pass**
(and "Require branches to be up to date before merging" to prevent merging against stale
bases). Name the exact check(s) — a workflow that never runs never blocks, so make the
test job trigger on `pull_request` with no path filters, or add a merge-blocking
placeholder for skipped paths.

**GitLab.** Settings → Merge requests → Merge checks → **Pipelines must succeed**
(all tiers). Consider also "All threads must be resolved". Watch the known gap: if no
pipeline runs at all, "pipelines must succeed" can be satisfied — set
`workflow: rules` so every MR gets a pipeline.

## SD-4 — Static analysis (SAST + IaC scanning)

**GitHub.** **CodeQL** via default setup (Settings → Code security → Code scanning) or
`github/codeql-action` in a workflow; gate merges by adding the CodeQL check to required
status checks. Private repos need Code Security. IaC: CodeQL does not cover Terraform —
add trivy (`trivy config .`) or checkov.

**GitLab.** Include the managed template — all tiers run the scan; MR widget, security
dashboard, and approval gates on findings are Ultimate:

```yaml
include:
  - template: Jobs/SAST.gitlab-ci.yml        # semgrep-based analyzers
  - template: Jobs/SAST-IaC.gitlab-ci.yml    # KICS-based IaC scanning
```

**Fallback.** `semgrep ci` (Semgrep Community rules) or `semgrep scan --config auto` as
a required CI job; trivy/checkov for IaC. Record triage decisions (true positive fixed,
or risk-accepted with approver) — SD-4 requires remediation *or documented risk
acceptance* before production deploy, so keep an auditable trail (issue links in the
scanner's suppression file).

## SD-5 — Dependency scanning (frequency is an SSP parameter)

**GitHub.** **Dependabot** (free, all repos): enable *Dependabot alerts* + *security
updates*, and commit `.github/dependabot.yml` with `schedule.interval` matching the
SSP's `sd-5_prm_1` (e.g. `daily` or `weekly`). Add the **dependency review action**
(`actions/dependency-review-action`) on PRs to block newly-introduced vulnerable deps —
free on public repos, needs Code Security on private. Dependabot alone only alerts;
pair with a scheduled scanning job if the SSP requires scan evidence.

**GitLab.** Dependency Scanning template (Ultimate) plus a **scheduled pipeline**
(CI/CD → Schedules) at the SSP frequency:

```yaml
include:
  - template: Jobs/Dependency-Scanning.gitlab-ci.yml
```

**Fallback.** Scheduled workflow running `osv-scanner --lockfile=...` or
`trivy fs --scanners vuln .`; generate an SBOM with `syft . -o cyclonedx-json` and scan
it with `grype sbom:sbom.json`. SPDX/CycloneDX SBOM output also satisfies the SD-5
recommendation wording.

```yaml
# GitHub fallback: scheduled SCA
on:
  schedule: [{ cron: "0 1 * * *" }]   # match sd-5_prm_1 from the SSP
```

## SD-6 — Secret detection with remediation SLA

**GitHub.** **Secret scanning** (Secret Protection add-on on private repos) scans the
full history and new pushes; alerts land in Security → Secret scanning. Enable *validity
checks* so alerts show whether a credential is still live. Track remediation of true
positives against the SSP's `sd-6_prm_2` day count — wire alerts into an issue tracker
via the secret scanning webhook/API so the SLA clock is visible.

**GitLab.** Secret Detection pipeline template (all tiers):

```yaml
include:
  - template: Jobs/Secret-Detection.gitlab-ci.yml
```

Vulnerability report + resolution workflow is Ultimate; on Free, parse
`gl-secret-detection-report.json` and open issues.

**Fallback.** Scheduled `gitleaks detect --source . --log-opts="--all"` over full
history. Remediation is always the same regardless of tooling: **revoke/rotate the
secret first, then purge it from history** (`git filter-repo`) — history rewrite alone
never remediates, the secret must be assumed compromised.

## SD-7 — CI secrets: protected pipelines + masked logs

**GitHub.** Store secrets as **Actions secrets** (encrypted at rest, auto-redacted in
logs when printed exactly). Scope deploy secrets to an **environment** with protection
rules rather than repo-level, so only jobs targeting that environment can read them.
Mask derived values explicitly: `echo "::add-mask::$DERIVED"`. Prefer eliminating
long-lived secrets entirely with **OIDC** federation to the cloud provider
(`permissions: id-token: write`).

**GitLab.** CI/CD variables: tick **Protect variable** (only available to pipelines on
protected branches/tags) and **Mask variable** (redacted in job logs; value must meet
masking requirements). GitLab 17.4+ adds **Masked and hidden** (never revealable in the
UI again). All tiers.

## SD-8 — Production / non-production segregation

The control names six planes — check each one, not just "we have a staging account":
**applications, services, data, secrets, roles, networks**.

- Separate **cloud accounts/tenants** per environment (AWS accounts under an OU, Azure
  subscriptions, GCP projects) — the recommendation's primary mechanism. On GCC
  (Government Commercial Cloud) this maps to separate GCC accounts per environment.
- **Data**: no production data in non-prod; use synthetic or anonymised datasets.
- **Secrets**: separate secret stores (or at minimum separate paths + separate IAM) per
  environment; CI deploy credentials for prod scoped to prod only.
- **Roles**: distinct IAM roles; developers get no standing prod write access.
- **Networks**: no network path from non-prod to prod (separate VPCs, no shared
  peering).
- **CI/CD**: GitHub **environments** with required reviewers + environment-scoped
  secrets/OIDC subjects; GitLab **protected environments** (Premium) with approval rules
  and environment-scoped variables. Pin the prod OIDC trust policy to the exact
  repo+environment (`repo:org/repo:environment:production`).

## SD-9 — Dynamic analysis (DAST)

**GitHub.** No native DAST. Run **OWASP ZAP** against a deployed test/staging
environment in the pipeline: `zaproxy/action-baseline` (passive, PR-friendly) and
`zaproxy/action-full-scan` (active, pre-release). Commercial: StackHawk, Burp Suite
Enterprise actions.

**GitLab.** DAST template (Ultimate), pointed at a review/staging deployment:

```yaml
include:
  - template: DAST.gitlab-ci.yml
dast:
  variables:
    DAST_TARGET_URL: https://staging.example.gov.sg
```

**Fallback.** ZAP in Docker on any runner:
`docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t $TARGET`. Run active
scans only against non-production (SD-8) targets, never prod. Findings must be fixed or
risk-accepted before production deploy — same triage-trail discipline as SD-4.

## SD-10 — SSDLC framework

Process control, not a platform feature. Adopt and document a framework — **NIST SSDF
(SP 800-218)**, **OWASP SAMM**, or Microsoft SDL — naming roles and responsibilities per
phase. In practice for a delivery team: a short SSDLC doc in the repo/wiki mapping each
SSDF practice to where it happens (threat modelling at design, this pipeline's gates at
build/deploy, VAPT per ST-4 before launch, patching cadence in ops). The rest of this
skill's controls are the implementation evidence for the build/deploy phases.

## SC-1 — Central code repository

Use the organisation's sanctioned Git platform — for WOG agency teams that is typically
**SHIP-HATS** (GitLab); otherwise an org-managed GitHub organisation or self-managed
GitLab. What fails the control: code on personal accounts, unversioned shared drives, or
repos outside the agency's visibility. Enforce SSO + MFA on the platform org.

## SC-2 — Reject unsigned commits

**GitHub.** Ruleset rule **Require signed commits** (also exists in classic branch
protection). Developers sign with SSH keys
(`git config commit.gpgsign true` + `git config gpg.format ssh`), GPG, or S/MIME; keys must be
registered on the GitHub account to show "Verified". Note: commits made via the GitHub
web UI/API are signed by GitHub automatically. Keyless option: **gitsign** (Sigstore)
signs with OIDC identity, but GitHub shows gitsign signatures as "Unverified" — pair
gitsign with your own verification job if you use it.

**GitLab.** **Push rules → Reject unsigned commits** (Premium). All tiers can display
verification status; only push rules enforce rejection — on Free, enforce with a
server-side check in CI (`git log --format='%G?'` gate) plus policy.

## SC-3 — Peer review before merge

**GitHub.** Ruleset/branch protection: **Require a pull request before merging** with
**Required approvals ≥ 1**, plus **Dismiss stale approvals on new commits** and
**Require review from Code Owners** (add a `CODEOWNERS` file) for sensitive paths.
Block self-approval is inherent (authors cannot approve their own PR); also enable
"Require approval of the most recent reviewable push" so a reviewer-then-push author
cannot self-merge unreviewed code.

**GitLab.** Merge request **approval rules** (required approver count and eligible
groups are Premium): Settings → Merge requests → Approvals, ≥ 1 required, enable
*Prevent approval by author* and *Remove all approvals when commits are added*. On Free,
approvals exist but cannot be made mandatory — gate via protected branch (only
Maintainers merge) + documented process, or move to SHIP-HATS.

## SC-4 — Pin direct and transitive dependencies

Commit the lockfile; the manifest alone (`package.json`, `Pipfile`, `requirements.txt`
with ranges) does not satisfy the control because it leaves transitive versions floating.

| Ecosystem | Pinning artefact |
|---|---|
| npm / pnpm / yarn | `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock` |
| Python | `Pipfile.lock`, `poetry.lock`, `uv.lock`, or pip-tools `requirements.txt` with `--generate-hashes` |
| Go | `go.mod` + `go.sum` (hashes) |
| Java | Gradle dependency locking / Maven with versions-enforcer; no floating ranges |
| Ruby | `Gemfile.lock` |
| Rust | `Cargo.lock` |
| Containers | Pin base images by digest: `FROM node:22-slim@sha256:...` (see CS-1) |
| GitHub Actions | Pin third-party actions by full commit SHA, not tag |

CI check: fail the build if the lockfile is missing or out of sync
(`npm ci` and `pnpm install --frozen-lockfile` fail on mismatch by design).

## SC-5 — Consistent build with a record (provenance)

**GitHub.** Build only via Actions (no laptop releases). Generate signed **artifact
attestations**: `actions/attest-build-provenance` produces SLSA provenance bound to the
workflow's OIDC identity; verify later with `gh attestation verify`. Free on public
repos; private repos require Enterprise Cloud — fallback below.

```yaml
permissions: { id-token: write, attestations: write, contents: read }
steps:
  - uses: actions/attest-build-provenance@v2
    with: { subject-path: dist/app.tar.gz }
```

**GitLab.** Set `RUNNER_GENERATE_ARTIFACTS_METADATA: "true"` on the build job — the
runner emits an SLSA provenance statement (`artifacts-metadata.json`) alongside the
artifact. Keep pipeline definitions in-repo (`.gitlab-ci.yml`) so the build recipe is
versioned.

**Fallback.** slsa-framework's `slsa-github-generator` reusable workflows, or minimally:
immutable CI-built artifacts with the pipeline run URL, commit SHA, and input digests
recorded in the release notes/registry labels. IaC for deployment (Terraform) is itself
part of the "record of how it was deployed".

## SC-6 — Install only pinned versions at deploy

Use the lockfile-strict install command in every CI/CD and Dockerfile install step —
never the "resolve latest" command:

| Ecosystem | Use | Not |
|---|---|---|
| npm | `npm ci` | `npm install` |
| pnpm | `pnpm install --frozen-lockfile` | `pnpm install` |
| yarn | `yarn install --immutable` | `yarn install` |
| pipenv | `pipenv sync` | `pipenv install` |
| poetry | `poetry install --sync` (lockfile respected by default) | ad-hoc `pip install pkg` |
| uv | `uv sync --frozen` | `uv add` at deploy |
| pip | `pip install -r requirements.txt --require-hashes` | unhashed requirements |
| bundler | `bundle install --frozen` / `BUNDLE_FROZEN=true` | plain `bundle install` |

Audit greps: `npm install` in Dockerfiles/workflows, `pip install` of bare package names
in deploy scripts, `curl | bash` installers.

## SC-7 — Sign artifacts during build

**GitHub / GitLab / anywhere — Cosign (Sigstore).** Keyless signing binds the signature
to the CI job's OIDC identity (no key management):

```yaml
# GitHub Actions: permissions: id-token: write
- run: cosign sign --yes $IMAGE@$DIGEST
```

GitLab CI also has native OIDC support for keyless cosign (`SIGSTORE_ID_TOKEN` via
`id_tokens:`). Sign the **digest**, never a floating tag. For non-container artifacts:
`cosign sign-blob`. AWS-native alternative: **AWS Signer** with ECR/Notation
(`notation sign` against a Signer profile) — the control text names both Cosign and AWS
Signer. GitHub artifact attestations (SC-5 recipe) double as Sigstore signatures for
build provenance.

## SC-8 — Verify signatures before deploy or at runtime

Two placements, per the control recommendation — implement at least one:

**Pipeline stage** (before `deploy`):

```yaml
- run: cosign verify $IMAGE@$DIGEST \
    --certificate-identity-regexp "https://github.com/myorg/myrepo/.*" \
    --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

(GitHub attestations: `gh attestation verify oci://$IMAGE --owner myorg`.)

**Kubernetes admission controller**: Sigstore **policy-controller**
(`ClusterImagePolicy`) or **Kyverno** `verifyImages` rules — rejects unsigned/wrongly
signed images at admission, covering anything that bypasses the pipeline. AWS: EKS with
Kyverno, or ECS deploy step verifying via Notation/Signer before task definition update.

Pin verification to the exact expected identity (repo, workflow, issuer) — verifying
"any Sigstore signature" is nearly meaningless.

## SC-9 — InnerSource

Make repos visible internally by default: GitHub **internal** visibility (Enterprise) or
org-visible; GitLab **internal** visibility on SHIP-HATS/self-managed. Add
`CONTRIBUTING.md`, `CODEOWNERS`/maintainer list, and accept MRs/PRs from other teams.
Before opening a repo internally, screen it for confidential algorithms or embedded
sensitive data (the control text requires this evaluation) — and having SD-1/SD-6 clean
is a prerequisite. The Singapore Government Developer Portal
(www.developer.tech.gov.sg) publishes InnerSource guidelines that count as the framework
the control recommends.

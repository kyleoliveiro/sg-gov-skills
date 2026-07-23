---
name: container-security
description: >-
  Build, scan, distribute, and run containers that satisfy the Singapore Government's
  ICT&SS Policy Reform (IM8 successor) Container Security (CS-1..CS-11) controls. Use
  whenever writing or reviewing a Dockerfile, a Kubernetes manifest or Helm chart, a
  container build pipeline, or registry/runtime configuration for a Singapore government
  agency project, or when preparing for a security audit or VAPT of a containerised
  workload. Triggers: "ICT&SS container requirements", IM8 container security, Dockerfile
  hardening, minimal/distroless/alpine/scratch base image, digest-pinned FROM, non-root
  container user, read-only root filesystem, runtime secrets, Hadolint, image scanning
  (Trivy, Grype, Amazon Inspector), private container registry, Kubernetes API private
  endpoint, namespace/workload segmentation, NetworkPolicy, Falco / runtime protection,
  container security audit, GCC container workload, CS control catalog.
---

# container-security: CS controls for SG government containers

You are building or auditing a containerised workload against the **11 Container Security
controls (CS-1..CS-11)** of the ICT&SS Policy Reform Cybersecurity Control Catalog. The
family's scope is *securing container building, distribution, and deployment*. Almost all
of these are configuration in a Dockerfile or an orchestrator manifest — cheap to get
right on day one, and exactly what an audit or VAPT walks through for a container
platform.

## Source and currency

Control text in this skill and `references/cs-controls.md` is embedded from
**info.standards.tech.gov.sg as of 2026-07-22**. The standards iterate actively. For any
compliance-critical decision, verify against the live page:

- CS: https://info.standards.tech.gov.sg/control-catalog/cybersecurity/cs/

Machine-readable OSCAL: https://github.com/GovtechSG/tech-standards — handy for tooling,
but it **lags the site**; the site is authoritative.

## Reference files

- `references/cs-controls.md` — full text of all 11 controls (statement, recommendations,
  risk statement, the CS-7 parameter) plus cross-family notes. Read it when you need exact
  wording, e.g. for an audit response or SSP documentation.
- `references/platform-recipes.md` — concrete Dockerfile, Kubernetes, and CI recipes per
  control, open-source-first (Trivy, Grype, Hadolint, Falco, Cosign) with cloud-native
  equivalents. Read it when actually configuring a build or cluster.

## Before you start: find the SSP

Every agency system has a **System Security Plan (SSP)** that selects which controls apply
at which level and **sets parameter values**. One CS control carries an agency-defined
parameter — the catalog deliberately leaves it blank:

| Control | Parameter | What the SSP defines |
|---|---|---|
| CS-7 | cs-7_prm_1 | The location where container image scanning occurs (e.g. "CI pipeline on push, plus continuous registry scanning") |

**Ask for the project's SSP (or the agency ISO/CISO contact) and use its value. Do not
invent the scan location** — write what the SSP says. If no SSP exists yet, flag that
first; the sibling skill **ssp-navigator** determines which SSP applies and at which level
each CS control sits for this system.

Container Security also **depends on the Software Supply Chain (SC) family**: image signing
is SC-7 and signature verification before deploy is SC-8 — both live in the
**secure-pipeline** skill, not here. CS-8 is about registry *privacy*, not provenance. When
a workload needs "signed images verified before they run", that is SC-7/SC-8; point the
team at secure-pipeline for it.

## Procedure

Work the container lifecycle in order — **build → distribute → run**. For **setup**, apply
each step. For **audit**, verify each step and record pass / fail / not-applicable-per-SSP
with evidence (the Dockerfile line, the manifest field, the CI run URL, the registry
setting). Recipes for every step are in `references/platform-recipes.md`.

### Stage 1 — Build the image (Dockerfile)

**1a. Minimal base image (CS-2).** Build on the smallest viable base — `scratch`,
`distroless`, `wolfi`, `alpine`, or a `-slim` variant — using a multi-stage build so
compilers, package managers, and shells never reach the runtime image. Why: every package
in the base is attack surface and a potential CVE; a minimal image has less to exploit and
less to patch.

**1b. Unique, digest-pinned base tags (CS-1).** Pin `FROM` by `@sha256:` digest, never
`latest` or a floating tag; let Renovate/Dependabot raise reviewed digest bumps. Why:
rolling tags silently change what you build on between builds, introducing untracked
drift and vulnerabilities. (This also satisfies the base-image half of SC-4 pinning.) If
you cannot resolve a digest right now, pin the most specific immutable tag, mark the
digest as a blocking TODO, and report CS-1 as **open — not satisfied** — a mutable `FROM`
is never compliant.

**1c. Non-root default user (CS-4).** Create a dedicated user and set `USER <numeric-uid>`
in the Dockerfile, with only the permissions the container needs; re-assert it at runtime
with `runAsNonRoot: true` / `runAsUser`, `allowPrivilegeEscalation: false`, and drop all
capabilities. Why: a container running as root that escapes its boundary is root on
concerns beyond itself; least privilege contains the blast radius.

**1d. No build-time secrets (CS-3).** Never `COPY`/`ARG`/`ENV` a credential into an image
— it persists in a layer (and history) even if later removed. Use BuildKit
`--mount=type=secret` for build-time needs, and inject runtime secrets via the
orchestrator (K8s `Secret` files sourced from a vault via CSI/External Secrets; Docker
secrets) — never `ENV`. Why: an image is copied and stored widely; a baked secret is a
leaked secret. Audit existing images with `trivy image --scanners secret`.

**1e. Lint the Dockerfile (CS-5).** Run **Hadolint** as a required CI check (and ideally
pre-commit), tuning via `.hadolint.yaml` rather than blanket-ignoring. Why: linting
catches the misconfigurations and anti-patterns (unpinned installs, missing `USER`,
shell-form pitfalls) that become the vulnerabilities above — before the image is built.
Wire it into the SD-3 required-checks gate (see secure-pipeline).

### Stage 2 — Distribute (registry + scanning)

**2a. Scan images in the SSP-named location (CS-7).** Scan built images for known
vulnerabilities in **cs-7_prm_1** (per the SSP) with Trivy/Grype/Amazon Inspector: enable
**scan-on-push** at the registry, scan in CI, and **block deployment on Critical/High**
findings (`--ignore-unfixed` to stay actionable; suppressions link to an approved risk
acceptance). Scan the **digest**, not a tag. Why: an image bundles OS packages and app
layers that carry their own CVEs; scanning is the gate that stops known-exploitable images
from shipping — and continuous registry scanning catches CVEs disclosed *after* push. This
complements SD-5 (which scans declared dependencies) — you need both.

**2b. Private registry only (CS-8).** Host org-built images exclusively in a **private**
registry (ECR private, ACR with public access disabled, GCP Artifact Registry internal,
Harbor, private GitLab registry) with anonymous pull off and push scoped by IAM/RBAC. Why:
images can contain proprietary code, config, and inadvertently sensitive data; a public
registry exposes all of it and invites tampering.

### Stage 3 — Run (orchestrator + runtime)

**3a. Read-only root filesystem (CS-6).** Set `readOnlyRootFilesystem: true` and mount
explicit writable paths (`emptyDir`/`tmpfs` for scratch, volumes for stateful data);
`docker run --read-only --tmpfs /tmp` for plain Docker. Patch by rebuild + redeploy, never
by editing a running container. Why: an immutable filesystem denies an attacker the
ability to drop tools, tamper with binaries, or persist — and enforces the
immutable-infrastructure discipline the whole family assumes.

**3b. Private orchestrator API (CS-9).** The Kubernetes API server (or equivalent) must
not be internet-reachable: EKS private/CIDR-restricted endpoint, AKS/GKE private cluster
with authorized networks, or a self-managed API server bound to a private interface behind
VPN. Why: a publicly exposed control-plane API is a direct path to the whole cluster;
restricting reachability removes it from the internet attack surface.

**3c. Workload segmentation (CS-10).** Isolate workloads with **namespaces** plus
**default-deny NetworkPolicies** (a namespace without network policy is not isolation),
per-namespace RBAC and ResourceQuota; separate node pools or clusters for sensitive
tenants. Why: flat clusters let one compromised pod move laterally to everything;
segmentation contains an incident to its blast radius.

**3d. Runtime protection (CS-11).** Deploy a runtime threat-detection tool — **Falco**
(open) or managed GuardDuty EKS / Defender for Containers / GKE runtime — that detects
changes and threats in running containers; on detection, **isolate and replace** the
instance with a rebuilt, patched image, cycling from clean images until a patch exists.
Why: builds and scans are point-in-time; runtime protection is the only control that sees
a live compromise. Note this **replaces IS-7 (malware) and IS-8 (EDR)** for containers —
do not also demand a host AV/EDR agent inside the container.

## Audit checklist

Verify each row; record evidence (Dockerfile line, manifest field, registry/cluster
setting, CI run URL). "Param" marks the control whose pass criteria come from the SSP.

| ID | Check | Where | Param |
|---|---|---|---|
| CS-2 | Minimal base (scratch/distroless/wolfi/alpine/-slim); multi-stage; no toolchain in runtime image | Dockerfile | |
| CS-1 | `FROM` digest-pinned (`@sha256:`), no rolling tag; reviewed digest bumps | Dockerfile | |
| CS-4 | Non-root `USER` (numeric UID) in image; `runAsNonRoot`/no-priv-esc/drop-caps at runtime | Dockerfile + securityContext | |
| CS-3 | No secret via `COPY`/`ARG`/`ENV`; BuildKit secret mounts; runtime injection from vault | Dockerfile + orchestrator | |
| CS-5 | Hadolint runs as a required CI check (and/or pre-commit) | CI config | |
| CS-7 | Image scanning in cs-7_prm_1; scan-on-push; Critical/High blocks deploy; scans the digest | Registry + CI | ✓ |
| CS-8 | Images only in a private registry; anonymous pull off; scoped push | Registry settings | |
| CS-6 | `readOnlyRootFilesystem: true` with explicit writable mounts; patch by rebuild | securityContext / run flags | |
| CS-9 | Orchestrator API not internet-reachable (private/CIDR-restricted endpoint) | Cluster networking | |
| CS-10 | Namespaces + default-deny NetworkPolicies + per-ns RBAC/quota | Cluster config | |
| CS-11 | Runtime protection deployed (Falco/GuardDuty/Defender); isolate-and-replace on detection | Cluster / cloud console | |

Report audit results per control ID with pass / fail / not-applicable-per-SSP, the
evidence found, and — for failures — the fix from `references/platform-recipes.md`. Where a
pass depends on the SSP (CS-7 scan location), ask for the SSP value rather than inventing
one.

## Related skills in this repo

- **secure-pipeline** — SD (Secure Development) + SC (Software Supply Chain), including
  **image signing (SC-7) and signature verification before deploy (SC-8)** and base-image
  pinning (SC-4). CS secures the image and its runtime; SC secures its provenance and the
  pipeline that produces it. Use both for a containerised delivery.
- **secure-coding-as** — AS (Application Security) + CK (Crypto/Key Management): the code
  running *inside* the container. CS-3's runtime secrets pair with AS-8 secrets management.
- **ssp-navigator** — which SSP applies and which level each CS control sits at for this
  system; where the cs-7_prm_1 value lives. Use it before declaring any control out of
  scope.
- **sg-service-shell** — scaffolding an agency service whose container image this skill
  then hardens.
- **security-testing** — ST controls: CS-7 image scanning feeds the vulnerability
  programme, and ST-5 sets the remediation SLAs for the CVEs your scans surface.
- **data-protection** — DP encryption-at-rest for mounted volumes and the registry, and
  the residency (DP-1) that constrains which region the registry and cluster run in.
- **logging-monitoring** — CS-11 runtime detections (Falco/GuardDuty) are a log source;
  route them to the LM central alerting and GCSOC pipeline rather than a local sink.

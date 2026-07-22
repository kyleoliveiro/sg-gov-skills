# Container Security — platform recipes

Concrete mechanics per control for Docker/OCI builds, Kubernetes runtime, and CI. Open
tools first (Trivy, Grype, Hadolint, Falco, Cosign) with cloud-native equivalents noted,
since agency workloads run across GCC on AWS/Azure/GCP and on-prem. Read the section for
the control you are configuring.

Legend: **Build** = Dockerfile / image build. **Runtime** = orchestrator/pod config.
**CI** = pipeline step.

---

## CS-1 — Unique base image tags (Build)

Pin `FROM` by **digest**, not by a rolling or floating tag:

```dockerfile
# BAD — rolling/floating, silently changes between builds
FROM node:latest
FROM node:22

# GOOD — digest-pinned, immutable
FROM node:22.11.0-bookworm-slim@sha256:8f...e3
```

- Resolve a digest: `docker buildx imagetools inspect node:22.11.0-bookworm-slim` (read
  the `Digest:` line), or `crane digest node:22.11.0-bookworm-slim`.
- Keep digests fresh deliberately: let **Renovate** or **Dependabot** (`docker`
  ecosystem) raise PRs that bump the pinned digest, so updates are reviewed, not implicit.
- If a build genuinely assigns no tag, the digest SHA is the unique identifier (per the
  control recommendation).
- **Cannot resolve a digest right now** (no registry access)? Pin the most specific
  immutable tag you can, mark the digest as a blocking TODO, and report CS-1 as
  **open — not satisfied**. A `FROM` on a mutable tag is not compliant no matter what a
  runbook claims.

## CS-2 — Minimal base images (Build)

Prefer, in rough order of smallest attack surface: `scratch` (static binaries) → Google
`distroless` → `wolfi` (`cgr.dev/chainguard/...`) → `alpine` → `-slim` variants.

```dockerfile
# Go / Rust static binary — nothing but the binary
FROM scratch
COPY --from=build /app/server /server
ENTRYPOINT ["/server"]

# Node/Python without a shell or package manager at runtime
FROM gcr.io/distroless/nodejs22-debian12@sha256:...
```

- Use **multi-stage builds**: compile/install in a fat builder stage, copy only artifacts
  into the minimal final stage. Keeps compilers, package managers, and shells out of the
  runtime image.
- Distroless/scratch have no shell — design health checks and entrypoints accordingly
  (exec-form `ENTRYPOINT`, no `sh -c`).
- Verify the win: `docker images` size, and `trivy image --scanners vuln <img>` package
  count before/after.

## CS-3 — Runtime secrets, never build-time (Build + Runtime)

Never `COPY`, `ARG`, or `ENV` a secret into an image — it persists in a layer and in
history even if later removed.

```dockerfile
# BAD — secret baked into a layer forever
ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc

# GOOD — BuildKit secret mount: available only during that RUN, not in any layer
RUN --mount=type=secret,id=npmtoken \
    NPM_TOKEN=$(cat /run/secrets/npmtoken) npm ci
# build:  docker build --secret id=npmtoken,env=NPM_TOKEN .
```

At runtime, inject via the orchestrator, not `ENV`:
- **Kubernetes:** mount a `Secret` as a file (preferred) or env; source from AWS Secrets
  Manager / Azure Key Vault / GCP Secret Manager via the CSI Secrets Store driver or
  External Secrets Operator so nothing sensitive lives in a manifest.
- **Docker/Compose/Swarm:** `docker secret` / `secrets:` (tmpfs-backed), not `environment:`.
- Audit an existing image for baked secrets: `trivy image --scanners secret <img>`, or
  inspect layers with `dive`.

## CS-4 — Non-root default user (Build + Runtime)

```dockerfile
RUN groupadd --gid 10001 app && useradd --uid 10001 --gid app --no-create-home app
# ... copy files, set ownership ...
USER 10001            # numeric UID so runAsNonRoot can verify it
```

Enforce at runtime too (defence in depth) — a `USER` line can be overridden by the
orchestrator:

```yaml
securityContext:            # pod or container
  runAsNonRoot: true
  runAsUser: 10001
  allowPrivilegeEscalation: false
  capabilities: { drop: ["ALL"] }
```

- Prefer a **numeric** UID: `runAsNonRoot` cannot verify a username-only `USER`.
- Distroless offers a `:nonroot` variant (UID 65532).
- Bind to ports ≥ 1024 (a non-root process cannot bind privileged ports).

## CS-5 — Dockerfile linting (CI)

**Hadolint** as a required CI check:

```yaml
# GitHub Actions
- uses: hadolint/hadolint-action@v3.1.0
  with: { dockerfile: Dockerfile, failure-threshold: warning }
```

```yaml
# GitLab CI
hadolint:
  image: hadolint/hadolint:latest-debian
  script: hadolint Dockerfile
```

- Pre-commit: `hadolint/hadolint` mirror in `.pre-commit-config.yaml`.
- Tune with `.hadolint.yaml` (e.g. `trusted-registries`) rather than blanket-ignoring —
  keep ignores documented. Wire the job into the SD-3 required-checks gate
  (`secure-pipeline`).

## CS-6 — Read-only root filesystem (Runtime)

```yaml
securityContext:
  readOnlyRootFilesystem: true
volumeMounts:
  - { name: tmp, mountPath: /tmp }         # writable scratch via emptyDir/tmpfs
  - { name: cache, mountPath: /var/cache/app }
volumes:
  - { name: tmp, emptyDir: { medium: Memory } }
  - { name: cache, emptyDir: {} }
```

- Docker/Compose: `docker run --read-only --tmpfs /tmp ...` / `read_only: true` with
  `tmpfs:`.
- Enumerate the paths the app actually writes and mount each as `emptyDir`/`tmpfs` or a
  real volume — do not fall back to a writable root.
- Patch by **rebuild + redeploy**, never by editing a running container (immutable
  infrastructure). Enforce fleet-wide with a Kyverno/Gatekeeper/Pod Security Admission
  `restricted` policy.

## CS-7 — Image scanning in `[cs-7_prm_1]` (CI + Registry)

`cs-7_prm_1` is the **SSP-defined location** where scanning occurs (typically "the CI
pipeline on push, and the registry continuously"). Use the SSP value; do not invent one.

```yaml
# GitHub Actions — Trivy, fail the build on High/Critical
- uses: aquasecurity/trivy-action@0.28.0
  with:
    image-ref: ${{ env.IMAGE }}@${{ env.DIGEST }}
    severity: 'HIGH,CRITICAL'
    exit-code: '1'
    ignore-unfixed: true
```

- Open tools: **Trivy** or **Grype**. Cloud-native: **Amazon Inspector** (ECR
  scan-on-push + continuous), **Azure Defender for Containers**, **GCP Artifact
  Analysis**.
- Enable **scan-on-push** at the registry *and* scan in CI: CI blocks new bad images;
  continuous registry scanning catches newly disclosed CVEs in images already pushed.
- **Block deploy** on Critical/High (per the control recommendation). `--ignore-unfixed`
  keeps the gate actionable; track suppressions in a `.trivyignore` that links to an
  approved risk acceptance.
- Scan the **digest**, not a tag, so the scanned artifact is exactly the deployed one.

## CS-8 — Private registries (Registry)

- Host org-built images only in a **private** registry: Amazon ECR private, Azure ACR
  (`Premium`, public access disabled), GCP Artifact Registry (internal), Harbor, or GitLab
  Container Registry on a private project. Never Docker Hub public or a public GHCR
  package for agency images.
- Lock it down: no anonymous pull, IAM/RBAC-scoped push, private endpoints/VPC where
  available, immutable tags on.
- Audit: confirm the registry's public-access setting is off and that `docker pull`
  without credentials fails.

## CS-9 — Orchestrator API access control (Runtime)

Kubernetes API server (and equivalent) must not be reachable from the open internet.

- **EKS:** cluster endpoint `Private` or `Public+Private` with `publicAccessCidrs`
  restricted to known ranges; prefer fully private with access via VPN/bastion.
- **AKS:** enable **Private Cluster**; **GKE:** **private cluster** with authorized
  networks for the control plane.
- Self-managed: API server bound to a private interface, reachable only over VPN;
  firewall/security-group deny from `0.0.0.0/0`.
- Audit: resolve the API endpoint and confirm it is not publicly routable, and that
  authorized-network / public-CIDR settings are restrictive.

## CS-10 — Workload segmentation (Runtime)

- **Namespaces** per workload/service/project, each with **NetworkPolicies** (default-deny
  ingress+egress, then allow-list) — a namespace without network policy is not real
  isolation. Cilium/Calico enforce them.
- Add per-namespace **ResourceQuota**/**LimitRange** and distinct RBAC so a compromise
  stays contained.
- Strong isolation for sensitive tenants: separate node pools/taints, or separate
  clusters/accounts (aligns with SD-8 environment segregation in `secure-pipeline`).

## CS-11 — Runtime protection (Runtime)

- Deploy a runtime threat-detection tool: **Falco** (open; syscall-level detection of
  shells-in-containers, unexpected writes, privilege changes), or managed **Amazon
  GuardDuty EKS Runtime Monitoring / EKS Protection**, **Microsoft Defender for
  Containers**, **GCP Security Command Center / GKE runtime**.
- On detection: **isolate** the instance for investigation and **replace** it with a
  rebuilt, patched image; while awaiting a patch, cycle instances frequently from a clean
  image (per the control recommendation).
- This **replaces IS-7 (malware protection) and IS-8 (EDR)** for containers — do not also
  require a host AV/EDR agent inside the container.
- Route alerts to the LM (Logging & Monitoring) pipeline / SOC.

---

## Quick audit greps

Run against a repo to surface the cheap, high-signal build-time failures:

```sh
grep -rEn 'FROM .*(:latest|:[0-9]+([.-][a-z0-9]+)*)\s*$' --include=Dockerfile* .  # CS-1: tag without @sha256 digest
grep -rEn '^\s*(USER\s+root|USER\s+0)\b' --include=Dockerfile* .                  # CS-4: explicit root (or no USER at all)
grep -rLn 'USER ' --include=Dockerfile* . 2>/dev/null                             # CS-4: Dockerfiles that never set USER
grep -rEn '(ARG|ENV).*(TOKEN|PASSWORD|SECRET|KEY|CREDENTIAL)' --include=Dockerfile* .  # CS-3: secret via ARG/ENV
grep -rEn 'readOnlyRootFilesystem|runAsNonRoot' --include=*.yaml .                 # CS-6/CS-4: present in manifests?
```

Absence of a match for `runAsNonRoot`/`readOnlyRootFilesystem` across manifests is itself
a finding. Pair every failure with the recipe above.

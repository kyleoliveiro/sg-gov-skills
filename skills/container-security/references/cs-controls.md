# Container Security (CS) — full control text

Embedded from **https://info.standards.tech.gov.sg/control-catalog/cybersecurity/cs/ as
of 2026-07-22**. The standards iterate actively; verify against the live page for any
compliance-critical decision. Each control on the site publishes a Control Statement,
Control Recommendations, a Risk Statement, and (where applicable) Parameters.

**Family scope:** *Controls to secure container building, distribution, and deployment.*

The family has **11 controls (CS-1..CS-11)**. Only **CS-7** carries an agency-defined
parameter (`cs-7_prm_1`).

---

## CS-1 — Unique Base Container Image Tags

- **Control Statement:** Use unique base container image tags instead of rolling tags.
- **Control Recommendations:** Avoid the `latest` tag or other rolling tags for base
  images to minimize unintended changes during subsequent builds. A digest SHA can
  provide a unique identifier if no tag is assigned during build time.
- **Risk Statement:** Using unique base container image tags instead of rolling tags
  reduces the risk of unintentional updates, inconsistencies, and potential security
  vulnerabilities in containerised environments.

## CS-2 — Minimal Base Container Images

- **Control Statement:** Build container images with minimal base images.
- **Control Recommendations:** Use minimal container images such as `alpine`, `scratch`,
  `wolfi`, and `distroless` images as the base to reduce attack surface.
- **Risk Statement:** Building container images with minimal base images reduces the
  attack surface, potential vulnerabilities, and resource overhead.

## CS-3 — Runtime Container Secrets

- **Control Statement:** Provide secrets and sensitive data to the container at runtime
  instead of image build time.
- **Control Recommendations:** Ensure no secrets (e.g., TLS certificate keys, cloud
  provider credentials, SSH private keys, database passwords) are embedded in the
  container image by using dedicated features like Docker secrets or
  `podman-secret-create`.
- **Risk Statement:** Providing secrets and sensitive data to the container at runtime
  instead of image build time reduces the risk of exposing sensitive information in the
  image.

## CS-4 — Non-Privileged Container User

- **Control Statement:** Create a non-root user and set it as the default user in the
  container image build instructions.
- **Control Recommendations:** Ensure the non-root user has the minimal set of
  permissions required to run the container.
- **Risk Statement:** Failure to create a non-root user and set it as the default user
  in container image build instructions increases the risk of security vulnerabilities,
  as running containers with root privileges may lead to potential exploitation and
  compromise of the host system.

## CS-5 — Dockerfile Linting

- **Control Statement:** Lint Dockerfiles before building container images.
- **Control Recommendations:** Use linters such as Hadolint to check Dockerfile
  instructions and flag issues contravening best practices. Ensure linting runs as part
  of Continuous Integration (CI) pipelines.
- **Risk Statement:** Without linting Dockerfiles before building container images,
  there's an increased risk of syntax errors, misconfigurations, and potential security
  vulnerabilities.

## CS-6 — Read-Only Container Root Filesystem

- **Control Statement:** Configure the container root filesystem to be read-only during
  runtime, except for designated non-persistent storage locations or mounted volumes for
  stateful storage.
- **Control Recommendations:** Use security policies (e.g., `readOnlyRootFilesystem` for
  Kubernetes) to prevent direct writes to the container's root filesystem during runtime
  and ensure immutable infrastructure. Do not directly apply patches or alter running
  containers. Apply patches by rebuilding and redeploying container images. Use `tmpfs`
  mounts to mount a temporary file system.
- **Risk Statement:** Failure to configure the container filesystem as read-only
  increases the risk of unauthorised modifications, potential tampering, and compromise
  of containerised applications.

## CS-7 — Container Image Scanning

- **Control Statement:** Scan container images in the [insert: param, cs-7_prm_1] for
  known vulnerabilities.
- **Control Recommendations:** Container image scanning tools (e.g., Amazon Inspector,
  Trivy, Grype) scan image contents for known vulnerabilities. Configure scans to run
  automatically and continuously, enable scanning on push, and block deployment of images
  with critical or high severity vulnerabilities.
- **Risk Statement:** Failure to scan container images increases the risk of deploying
  insecure images, potentially exposing the infrastructure to known exploits.
- **Parameters:**

  | ID | Type | Description |
  |---|---|---|
  | cs-7_prm_1 | location (str) | The location where container image scanning occurs. |

## CS-8 — Private Container Image Registries

- **Control Statement:** Host built container images in private container registries.
- **Control Recommendations:** Use only private container registries (e.g., Amazon ECR
  private registry) to host organization-built container images, as images may contain
  proprietary code or sensitive information.
- **Risk Statement:** Hosting built container images in private registries enhances
  security by reducing the exposure of sensitive images, minimising the risk of
  unauthorised access.

## CS-9 — Container Orchestrator API Access Control

- **Control Statement:** Disable public access to Container Orchestrator API endpoints
  from the internet.
- **Control Recommendations:** Restrict access to Container Orchestrator API endpoints
  (such as the Kubernetes API Server) to specific address ranges or use CSP-provided
  features such as disabling Endpoint public access and Private Clusters.
- **Risk Statement:** Failure to disable public access to Container Orchestrator API
  endpoints from the internet increases the risk of unauthorised access, potential
  exploitation, and security breaches.

## CS-10 — Container Workload Segmentation

- **Control Statement:** Segregate container workloads to help contain attacks through
  isolation.
- **Control Recommendations:** Create Kubernetes namespaces or similar container
  segmentation controls to isolate different workloads, services or projects.
- **Risk Statement:** Without separating container workloads into namespaces, there's an
  increased risk of lateral movement and potential compromise.

## CS-11 — Container Runtime Security

- **Control Statement:** Detect and remediate changes to running containers with
  container runtime protection tools.
- **Control Recommendations:** Runtime protection tools (such as AWS EKS Protection,
  Microsoft Defender for Containers, or Falco) monitor threats and changes to running
  containers. Vulnerable instances should be isolated for investigation and replaced with
  rebuilt and patched images. Replace container instances frequently with un-compromised
  images until patches are released. These tools replace Malware Protection (IS-7) and
  EDR (IS-8) in container environments.
- **Risk Statement:** Failure to detect and remediate changes to running containers using
  container runtime protection tools increases the risk of unnoticed compromises,
  potential exploitation, and unauthorised alterations.

---

## Cross-family notes

- **CS-1 ↔ SC-4 (Software Supply Chain).** SC-4 also requires pinning base images by
  digest. A digest-pinned `FROM` satisfies the pinning half of both; CS-1 is specifically
  about *not using rolling tags*.
- **CS-3 ↔ AS-8 / SD-7.** CS-3 is the container-image expression of the general
  secrets-management controls: nothing sensitive baked into the artifact; inject at
  runtime.
- **CS-7 ↔ SD-5 (dependency scanning).** SD-5 scans declared dependencies; CS-7 scans the
  *assembled image* (OS packages + app layers). Both are needed — an image can be
  vulnerable through its base OS even with clean app dependencies.
- **CS-11 explicitly replaces IS-7 (Malware Protection) and IS-8 (EDR)** in container
  environments — do not also demand host-agent AV/EDR inside containers.
- **Image signing is SC-7; signature verification before deploy is SC-8** (Software
  Supply Chain family, covered by the `secure-pipeline` skill), not CS. CS-8 is about
  registry privacy, not provenance.

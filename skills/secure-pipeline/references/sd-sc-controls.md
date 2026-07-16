# SD + SC control text — ICT&SS Policy Reform Cybersecurity Control Catalog

Full text of the Secure Development (SD-1..SD-10) and Software Supply Chain (SC-1..SC-9)
control families, embedded from info.standards.tech.gov.sg as of 2026-07-16.

Source pages (authoritative — verify before compliance-critical decisions):

- https://info.standards.tech.gov.sg/control-catalog/cybersecurity/sd/
- https://info.standards.tech.gov.sg/control-catalog/cybersecurity/sc/

Parameter placeholders appear as `[insert: param, <id>]` — values are agency-defined in
the system's SSP, never in the catalog.

---

## SD — Secure Development

### SD-1: Push Protection for Secrets

**Control Statement:** Configure the code repository to prevent secrets from being pushed
to the repository.

**Control Recommendations:** Use GitLab's push rules or GitHub's push protection to
reject secrets on push.

**Risk Statement:** Failure to configure the code repository to prevent secrets from
being pushed introduces the risk of inadvertent exposure, unauthorised access, and
potential misuse of sensitive information, compromising the security of the codebase and
associated systems.

**Parameters:** None

### SD-2: Default Branch Push Permissions

**Control Statement:** Configure the code repository to prevent pushes (including force
pushes) to the default branch.

**Control Recommendations:** Use GitLab's protected branch and merge request settings or
GitHub's branch protection settings to enforce this.

**Risk Statement:** Without configuring the code repository to prevent pushes, including
force pushes, to the default branch, there's an increased risk of unintentional or
malicious changes, potential loss of code history, and compromised version control,
impacting the integrity and reliability of the software development process.

**Parameters:** None

### SD-3: Continuous Integration (CI) Tests

**Control Statement:** Require Continuous Integration (CI) tests to pass before merging
into the default branch.

**Control Recommendations:** Use GitLab's protected branch and merge request settings or
GitHub's branch protection settings to enforce this.

**Risk Statement:** Failing to require passing Continuous Integration (CI) tests before
merging into the default branch increases the risk of introducing faulty code, potential
regressions, and compromise of code quality.

**Parameters:** None

### SD-4: Static Analysis

**Control Statement:** Set up a static analysis job in the [insert: param, sd-4_prm_1],
and remediate or risk accept true positive vulnerability findings before deploying to
production.

**Control Recommendations:** Static analysis tools (such as SAST or IaC security
scanners) check source code for common vulnerabilities and misconfigurations. By running
static analysis tools earlier in the DevSecOps cycle, vulnerabilities can be detected and
prevented from being deployed to production.

**Risk Statement:** Without setting up static analysis in the CI/CD pipeline for each
merge request and addressing true positive vulnerability findings, there is an increased
risk of deploying insecure code to the production branch, potentially leading to security
breaches and compromise of the overall system.

**Parameters:**

| ID | Type | Description |
|---|---|---|
| sd-4_prm_1 | location | The location where static analysis occurs. |

### SD-5: Dependency Scanning

**Control Statement:** Schedule a scan at least every [insert: param, sd-5_prm_1] day(s)
in the [insert: param, sd-5_prm_2] to identify the use of vulnerable software libraries.

**Control Recommendations:** Dependency scanning checks the source code for dependencies
with known vulnerabilities. By running scans regularly using bots or software composition
analysis (SCA) tools, vulnerabilities arising from outdated dependencies can be quickly
detected and patched. Software composition analysis can be performed using tools such as
Gitlab, Nexus IQ, or their equivalent, with output in a common SBOM format such as SPDX
or CycloneDX.

**Risk Statement:** Failing to schedule regular dependency scanning to identify
vulnerable software libraries and address findings in a timely manner increases the risk
of deploying applications with known vulnerabilities, potentially exposing the system to
security exploits and compromise.

**Parameters:**

| ID | Type | Description |
|---|---|---|
| sd-5_prm_1 | time period in days | The time period in days of dependency scanning frequency. |
| sd-5_prm_2 | location | The location where dependency scanning occurs. |

### SD-6: Secret Detection

**Control Statement:** Set up secret detection in the [insert: param, sd-6_prm_1] and
remediate true positives within [insert: param, sd-6_prm_2] day(s).

**Control Recommendations:** Ensure that the exposed secret is revoked and purged from
the Git history.

**Risk Statement:** Without setting up secret detection and addressing true positive
findings promptly, there's an increased risk of exposing sensitive information, potential
unauthorised access, and compromised security.

**Parameters:**

| ID | Type | Description |
|---|---|---|
| sd-6_prm_1 | location | The location where secret detection occurs. |
| sd-6_prm_2 | time period in days | Number of days within which to remediate a secret detection true positive. |

### SD-7: CI Environment Variable Secrets Management

**Control Statement:** Protect environment variable secrets used in CI jobs by limiting
them to protected pipelines and masking them in job logs.

**Control Recommendations:** Use GitLab's CI/CD variable security settings or GitHub's
encrypted secrets with the add-mask workflow command.

**Risk Statement:** Failing to protect environment variable secrets in CI jobs by
limiting them to protected pipelines and masking them in job logs increases the risk of
unauthorised access and exposure of sensitive information.

**Parameters:** None

### SD-8: Deployment Environment Segregation

**Control Statement:** Segregate production and non-production environments including
applications, services, data, secrets, roles, and networks.

**Control Recommendations:** Achieve segregation using separate cloud tenant accounts for
environments such as production, development, test, and staging. Account segregation
enhances security by limiting exposure, simplifies resource and cost management,
maintains configuration integrity, facilitates compliance and auditing and streamlines
operational tasks. Deploy and operate environments as similarly as possible to enhance
debugging and time-to-market.

**Risk Statement:** Failure to segregate production and non-production environments
increases the risk of unauthorised access, data leaks, and denial of service attacks, as
compromises in non-production environments may lead to cascading impacts on production
systems.

**Parameters:** None

### SD-9: Dynamic Analysis

**Control Statement:** Implement dynamic analysis testing in the
[insert: param, sd-9_prm_1], and address or risk-accept all identified vulnerabilities
before deploying to production.

**Control Recommendations:** Dynamic analysis tools (such as DAST, IAST, or fuzzing
tools) test applications in runtime conditions to identify vulnerabilities that may not
be apparent in static code. Integrate these tools into your CI/CD pipeline to
automatically scan applications in a controlled environment. Ensure that the analysis
covers various attack vectors, including input validation, authentication mechanisms, and
API endpoints. Regularly update and tune your dynamic analysis tools to detect emerging
threats and vulnerabilities.

**Risk Statement:** Failure to perform dynamic analysis in a controlled environment
before production deployment increases the risk of undetected runtime vulnerabilities,
potentially leading to security breaches, data leaks, and compromised system integrity in
the production environment.

**Parameters:**

| ID | Type | Description |
|---|---|---|
| sd-9_prm_1 | location | The location where static analysis occurs. |

> Note: the site's description of sd-9_prm_1 says "static analysis" — this appears to be
> a typo on the source page (the control is dynamic analysis). Reproduced verbatim.

### SD-10: Secure Software Development Lifecycle (SSDLC)

**Control Statement:** Implement and maintain a secure software development lifecycle
based on an industry-standard or organisation-defined framework, integrating security
practices throughout all phases of application design, development, testing, deployment,
and maintenance.

**Control Recommendations:** Outline a framework that defines roles, responsibilities,
and accountability for security throughout the SSDLC. Existing frameworks include NIST
Secure Software Development Framework (SSDF), OWASP Software Assurance Maturity Model
(SAMM), and Microsoft Security Development Lifecycle (SDL).

**Risk Statement:** Failure to implement a comprehensive secure software development
lifecycle increases the risk of introducing vulnerabilities throughout the development
process, potentially leading to security breaches, data leaks, and compromised system
integrity in production environments.

**Parameters:** None

---

## SC — Software Supply Chain

### SC-1: Code Repository

**Control Statement:** Manage the codebase in a central code repository with version
control.

**Control Recommendations:** Use common internal platforms that provide Git repository
services.

**Risk Statement:** Absence of centralised code repository and version control increases
the risk of code inconsistencies, loss of code history, and difficulties in
collaboration, potentially leading to errors and security vulnerabilities.

**Parameters:** None

### SC-2: Commit Signing

**Control Statement:** Configure the code repository to reject unsigned commits.

**Control Recommendations:** Use GitLab's push rules, GitHub's branch protection rules or
similar code repository controls to reject unsigned commits on push.

**Risk Statement:** Allowing unsigned commits in the code repository introduces the risk
of unauthorised or malicious code changes, compromising the integrity and security of the
software development process.

**Parameters:** None

### SC-3: Peer Review

**Control Statement:** Require peer review and approval by a designated reviewer before
merging into the default branch.

**Control Recommendations:** Use GitLab's protected branch and merge request settings,
GitHub's branch protection settings or similar code repository controls to enforce this.

**Risk Statement:** Without peer review and approval before merging, there is an
increased risk of introducing undetected coding errors, security vulnerabilities, and
maintaining codebase consistency may become challenging.

**Parameters:** None

### SC-4: Dependency Manifest Version Pinning

**Control Statement:** Pin direct and transitive dependency versions in the application's
dependency manifest.

**Control Recommendations:** Dependency manifests such as package-lock.json for npm and
Pipfile.lock for pipenv allow you to pin dependency versions.

**Risk Statement:** Failure to pin direct and transitive dependency versions in the
application's manifest may lead to version drift, introducing compatibility issues,
security vulnerabilities, and unpredictability in the software environment.

**Parameters:** None

### SC-5: Build and Release Process

**Control Statement:** Use a consistent build and release process that generates a record
of how the release artefact was built and deployed.

**Control Recommendations:** Consider automated build and deploy tools such as CI/CD
Pipelines, Infrastructure as Code (IaC) and other scripts, which allow for signing and
validation of build artefacts. If automation is not possible, develop and implement
release management processes.

**Risk Statement:** Inconsistent and unmanaged releases may lead to configuration drift,
increased likelihood of errors, and unapproved changes to releases.

**Parameters:** None

### SC-6: Dependency Installation during Deployment

**Control Statement:** Only install pinned versions in the manifest when installing
dependencies during deployment.

**Control Recommendations:** Use package manager commands such as npm ci for npm and
pipenv sync for pipenv that ensure only versions specified in the manifest are installed
rather than the latest version.

**Risk Statement:** Failure to install only pinned versions of dependencies during
deployment increases the risk of introducing unforeseen changes, compatibility issues,
and potential security vulnerabilities into the deployed environment.

**Parameters:** None

### SC-7: Software Artefact Signing

**Control Statement:** Sign software artefacts such as code and container images using a
trusted source during build.

**Control Recommendations:** Use tools or services like Cosign or AWS Signer to sign and
verify code.

**Risk Statement:** Unsigned code and container images pose a risk of tampering,
impersonation, and the injection of malicious code during the build process, compromising
the integrity and security of the deployed software.

**Parameters:** None

### SC-8: Software Artefact Signature Verification

**Control Statement:** Verify the signatures of code and artefacts before deployment or
runtime.

**Control Recommendations:** Implement a signature verification step such as a pipeline
stage or Kubernetes Admission Controller.

**Risk Statement:** Without verifying the signatures of code and artefacts before
deployment or runtime, there's an increased risk of deploying tampered or malicious
software, compromising the integrity and security of the system.

**Parameters:** None

### SC-9: Internal Code Collaboration and Sharing

**Control Statement:** Share source code internally to enhance code quality, accelerate
innovation, and improve problem-solving efficiency.

**Control Recommendations:** Adopt InnerSource practices for internal collaboration,
utilising Git platforms to manage and share code repositories internally. Source code
should be evaluated for suitability for InnerSourcing, such as the use of confidential
algorithms or embedded sensitive data. The InnerSource guidelines published in the
Singapore Government Developer Portal provide a useful framework for code sharing.

**Risk Statement:** Restricting code repositories to closed source can result in
duplicated efforts, hinder collaborative learning, and lead to missed bugs or
vulnerabilities.

**Parameters:** None

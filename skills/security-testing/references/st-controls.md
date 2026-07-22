# Security Testing (ST) controls — verbatim reference

Embedded from **info.standards.tech.gov.sg as of 2026-07-22**; the ST family page was
**last updated 24 March 2026**. The family scope is the *testing lifecycle around a
running system*: vulnerability assessment scans, cloud security posture management, a
public disclosure channel, the penetration testing programme, and severity-based
remediation. The standards iterate; verify anything compliance-critical against the live
page:

- ST control catalog: https://info.standards.tech.gov.sg/control-catalog/cybersecurity/st/

## Level assignments (vary by SSP)

The ST family page assigns no levels itself; levels come from each System Security Plan.
As published on the SSP pages (last updated 24–26 March 2026):

| SSP | ST levels |
|---|---|
| Low-Risk Cloud / Low-Risk On-Premises | All of ST at **Level 1** |
| Medium-Risk Cloud | **ST-1, ST-3, ST-4 at Level 0** (mandatory, no deviation); ST-2, ST-5 at Level 1 |
| High-Risk Cloud CII | **All of ST at Level 0** |

The project's own SSP is authoritative for which level applies and for every parameter
value below.

---

## ST-1: Vulnerability Assessment

**Statement:** "Run regular [st-1_prm_1] vulnerability assessment scans for eligible hosts
at least every [st-1_prm_2] day(s)."

**Recommendations:** Use agent-based or network-based scans as needed. Deploy
authenticated scans for greater coverage. For cloud systems, leverage tools like Amazon
Inspector or Microsoft Defender for Cloud. For periodic scanning on-premises, subscribe to
a Vulnerability Management System (VMS). For SaaS, consult prior vulnerability scanning
reports from the provider.

**Risk addressed:** "Without regular vulnerability assessment scans, hosts remain exposed
to undetected security vulnerabilities or misconfigurations, increasing the risk of
exploitation and unauthorised access to critical systems."

**Parameters:**
- **st-1_prm_1** (str) — the type of vulnerability assessment scanning (agency-defined).
- **st-1_prm_2** (int, days) — the maximum time between vulnerability assessment scans.

---

## ST-2: Cloud Security Posture Management

**Statement:** "Set up cloud security posture management that performs continuous
configuration scans on cloud assets."

**Recommendations:** Implement tools such as AWS Security Hub, Azure Defender for Cloud,
and Google Security Command Center.

**Risk addressed:** "Lack of continuous configuration scans through cloud security posture
management increases the risk of misconfigurations in cloud assets, leading to security
vulnerabilities, data breaches, and unauthorised access."

**Parameters:** None.

---

## ST-3: Public Vulnerability Disclosure Programme

**Statement:** "Establish a public reporting channel for disclosing vulnerabilities in
public-facing systems via [st-3_prm_1]."

**Recommendations:** Use the security.txt standard or add a vulnerability reporting link
on all pages, such as in the footer.

**Risk addressed:** "Lack of a reporting channel for vulnerabilities increases the risk of
undetected and unmitigated vulnerabilities."

**Parameters:**
- **st-3_prm_1** (str) — the type of public vulnerability reporting channel
  (agency-defined).

**Implementation note (RFC 9116):** a compliant security.txt is served at
`/.well-known/security.txt` over HTTPS and must carry `Contact` and a non-expired
`Expires` field (recommended less than a year in the future). A file at `/security.txt`
alone, or with a lapsed `Expires`, fails the standard — researcher tooling checks exactly
one path and treats an expired file as stale.

---

## ST-4: Security Testing Programme

**Statement:** "Conduct and document a [st-4_prm_1] by internal teams or independent
external parties every [st-4_prm_2] day(s)."

**Recommendations:** Refer to the WOG Security Testing Guidelines. Systems eligible for
the Government Bug Bounty Programme require a passing Agency Readiness Scorecard rating.
For SaaS, review prior penetration testing reports from the provider.

**Risk addressed:** "Without undergoing security testing, there's an increased risk of
undetected security weaknesses, leaving the application susceptible to exploitation, data
breaches, and unauthorised access."

**Parameters:**
- **st-4_prm_1** (str) — the type of security testing programme (agency-defined; typically
  a penetration test / VAPT).
- **st-4_prm_2** (int, days) — the maximum time between security tests.

---

## ST-5: Vulnerability Management

**Statement:** "Triage, prioritise and then remediate or risk accept vulnerabilities that
materially impact security within the following timeframe based on severity: Critical:
[st-5_prm_1] day(s); High: [st-5_prm_2] day(s); Medium: [st-5_prm_3] day(s); Low:
[st-5_prm_4] day(s)."

**Recommendations:** Prioritise vulnerabilities with high exploitability likelihood or
known active exploitation. Consult CISA's Known Exploited Vulnerabilities Catalog. Obtain
approving authority consent for risk acceptance and document all actions.

**Risk addressed:** "Failure to promptly remediate vulnerabilities increases the risk of
potential exploits, security breaches, and prolonged exposure to known vulnerabilities in
the system."

**Parameters:**
- **st-5_prm_1** (int, days) — timeframe to remediate or risk-accept **Critical**
  vulnerabilities.
- **st-5_prm_2** (int, days) — timeframe to remediate or risk-accept **High**
  vulnerabilities.
- **st-5_prm_3** (int, days) — timeframe to remediate or risk-accept **Medium**
  vulnerabilities.
- **st-5_prm_4** (int, days) — timeframe to remediate or risk-accept **Low**
  vulnerabilities.

---

## Cross-family notes (what is NOT an ST control)

- **CI code and dependency scanning** is Secure Development, not ST-1: SAST is **SD-4**,
  SCA/dependency scanning is **SD-5**, secret detection is **SD-6**, and pipeline DAST is
  **SD-9** (all in secure-pipeline). ST-1 is *host-level* vulnerability assessment — the
  VM/instance/network layer. Dependabot + CodeQL provide no ST-1 coverage; conversely,
  their findings do enter the **ST-5** register and run on the same SLA clocks.
- **Container image scanning** belongs to the **Container Security (CS)** family
  (container-security), not ST-1.
- **Fixing a specific vulnerability** is the owning family's work — e.g. SQL injection
  remediation is **AS-1** (secure-coding-as). ST-5 governs the surrounding process:
  triage, prioritisation, the SLA clock, and documented approving-authority risk
  acceptance.
- **Which SSP applies and at which level each ST control sits** is selection-time work
  owned by **ssp-navigator**. This family is implementation-time: given the levels and
  parameters, build and audit the programme.

# Access Control (AC) controls — verbatim reference

Embedded from **info.standards.tech.gov.sg as of 2026-07-23**; the AC family page was
**last updated 24 March 2026**. The family scope, as published: *"Controls to protect
against unauthorised access to agency systems."* The standards iterate; verify anything
compliance-critical against the live page:

- AC control catalog: https://info.standards.tech.gov.sg/control-catalog/cybersecurity/ac/

## Level assignments (verified against the published SSP pages)

| Control | Low-Risk Cloud / On-Prem | Medium-Risk Cloud | High-Risk Cloud CII | Sandbox |
|---|---|---|---|---|
| AC-1 | 1 | 1 | **0** | 2 |
| AC-2 | 1 | **0** | **0** | 2 |
| AC-3 | 1 | **0** | **0** | 2 |
| AC-4 | 1 | 1 | 1 | 2 |
| AC-5 | 1 | **0** | **0** | 2 |
| AC-6 | 1 | **0** | **0** | 2 |
| AC-7 | 1 | 1 | 1 | 2 |
| AC-8 | 1 | 1 | 1 | 2 |
| AC-9 | 1 | 1 | 1 | 2 |
| AC-10 | 2 | 2 | 2 | 2 |
| AC-11 | 2 | 2 | 1 | 2 |
| AC-12 | 1 | 1 | 1 | 2 |
| AC-13 | 2 | 2 | 1 | 2 |
| AC-14 | 1 | 1 | 1 | 2 |
| AC-15 | — | — | — | — |
| AC-16 | — | — | 1 | — |

Key promotions: **Medium-Risk Cloud puts AC-2, AC-3, AC-5, AC-6 at Level 0** (MFA,
account expiry, endpoint hardening, default credentials — mandatory, no deviation path);
**High-Risk Cloud CII adds AC-1** (least privilege) to Level 0 and promotes AC-11 and
AC-13 to Level 1. **AC-16 (Separation of Duties) appears only in the High-Risk Cloud CII
plan**; **AC-15 is in the catalog but assigned in no published SSP** as of the embed
date — expect it wherever AC-8 automation integrates with SaaS. The project's own SSP is
authoritative for which level applies and for every parameter value below.

---

## AC-1: Principle of Least Privilege

**Statement:** "Deny access by default and grant only the minimum permissions required
for authorised accounts or processes to perform a specific function based on the account
inventory implemented."

**Recommendations:** "Consider attribute- or feature-based access control for greater
customisability and granularity. Use automated tools such as AWS IAM Access Advisor or
Azure AD Access Review to assist with granular permission management."

**Risk addressed:** "Violating the principle of least privileges increases the risk of
unauthorised access, privilege escalation, and potential security breaches due to
unnecessary permissions, compromising the overall security posture."

**Parameters:** None.

Note the statement's closing clause: least privilege is granted *"based on the account
inventory implemented"* — AC-1 presupposes the AC-14 inventory.

---

## AC-2: Multi-Factor Authentication (MFA)

**Statement:** "Require MFA for privileged accounts at login."

**Recommendations:** "Ensure that the authentication factors are different and
independent of the accessing device. For additional security, consider MFA for
privileged actions at the application level (such as step-up MFA challenges via PIM
tools)."

**Risk addressed:** "Without requiring phishing-resistant Multi-Factor Authentication
(MFA) for remote access, there is an increased risk of unauthorised access, credential
theft, and potential compromise of sensitive systems, especially for accounts with
elevated privileges."

**Parameters:** None.

---

## AC-3: Inactive and Expired Accounts

**Statement:** "Disable or remove [ac-3_prm_3] accounts within [ac-3_prm_1] day(s) from
last day of authorised use or have not been used for [ac-3_prm_2] day(s)."

**Recommendations:** "Use automated checks to identify accounts and credentials that
should be disabled. Consider using automated workflows such as System for Cross-domain
Identity Management (SCIM) or identity lifecycle management tools. For cloud service
provider accounts, use tools such as AWS Config iam-user-unused-credentials-check to
manage Identity and Access Management (IAM) Users."

**Risk addressed:** "Failure to disable or remove unused accounts or credentials with
elevated access increases the risk of unauthorised access, as dormant accounts may
become targets for exploitation, compromising the security of the system."

**Parameters:**
- **ac-3_prm_1** (time period (days), int) — "The time period in days after account
  expiry."
- **ac-3_prm_2** (time period (days), int) — "The time period in days of account
  inactivity."
- **ac-3_prm_3** (type, str) — "The type of accounts."

---

## AC-4: Access Review

**Statement:** "Perform an access review [ac-4_prm_1] and remove unauthorised or
unnecessary access rights within [ac-4_prm_2] day(s)."

**Recommendations:** "For application accounts, implement automated review workflows or
reports. For cloud service provider accounts and roles, use tools such as AWS IAM Access
Advisor or Azure AD Access Review to facilitate and manage access reviews."

**Risk addressed:** "Without regular access reviews and prompt removal of unauthorised
or unnecessary access rights, there is an increased risk of lingering access, potential
misuse of privileges, and compromised security, impacting the confidentiality and
integrity of sensitive data."

**Parameters:**
- **ac-4_prm_1** (organisation-defined frequency, str) — "The access review frequency."
- **ac-4_prm_2** (time period (days), int) — "The time period in days for access
  removal."

---

## AC-5: Endpoint Device Hardening

**Statement:** "Require hardened endpoint devices for remote developer, maintainer, or
administrator access."

**Recommendations:** "Use Endpoint Management platforms to continuously check and
enforce device security posture and deny access if the hardening requirements are not
met."

**Risk addressed:** "Without requiring hardened endpoint devices for remote access,
there's an increased risk of compromised endpoints, potential malware infections, and
security breaches, which could lead to unauthorised access and compromise the integrity
of systems."

**Parameters:** None.

---

## AC-6: Default Credentials

**Statement:** "Change default credentials prior to first use."

**Recommendations:** "Identify any default credentials used in any system components
before deploying and change them. Configure end-user systems to prompt for password
change on first login after account creation or reset."

**Risk addressed:** "Failure to change default credentials prior to first use increases
the risk of unauthorised access, as default credentials are often well-known and
targeted by attackers, compromising the security of the system or device."

**Parameters:** None.

---

## AC-7: Singpass/Corppass for Public Users

**Statement:** "Use Singpass or Corppass MFA for digital services that require high
level of identity assurance for Public Users."

**Recommendations:** "For high impact or high risk transactions, use Singpass/Corppass
to identify Public Users (e.g. citizens). Agency or internal Users should use Government
managed Single Sign-on (SSO) solutions (such as WOG AAD)."

**Risk addressed:** "Leverage on Singpass or Corppass to reduce duplication of effort
and provide consistent end user experience." *(Published as the risk statement —
benefit-phrased on the live page.)*

**Parameters:** None.

---

## AC-8: Automated Account Lifecycle Management

**Statement:** "Automate account [ac-8_prm_1] for [ac-8_prm_3] using an account
lifecycle management tool."

**Recommendations:** "Consider adopting Single Sign-On (SSO) with just-in-time
provisioning or account lifecycle management protocols or tools such as [ac-8_prm_2].
Perform validation testing of the integration between systems and tools to ensure that
accounts are provisioned and/or deprovisioned in a timely manner. Where applicable,
configure the system to enhance management capabilities via automation."

**Risk addressed:** "Manual account and access lifecycle management can introduce
errors and weaknesses, thus making access control measures ineffective and unreliable."

**Parameters:**
- **ac-8_prm_1** (process, str) — "The account lifecycle management processes to
  automate."
- **ac-8_prm_2** (tool, str) — "Recommended account lifecycle management tool."
- **ac-8_prm_3** (type, str) — "The type of accounts."

---

## AC-9: Endpoint Device Management

**Statement:** "Implement and maintain an endpoint device management solution to ensure
the security and integrity of endpoint devices used within the organisation."

**Recommendations:** "Mobile Device Management (MDM) platforms enable management,
monitoring, and secure configuration of endpoint devices. This includes enforcing disk
encryption, managing configuration, ensuring regular updates, and providing the ability
to remotely wipe data in case of device loss or theft."

**Risk addressed:** "Unmanaged endpoint devices increase the risk of unauthorised
access and potential loss of sensitive information due to the compromise of devices."

**Parameters:** None.

---

## AC-10: Identity and Device-Based Access Control

**Statement:** "Adopt Identity and Device-Based Access Control for secure and
context-aware connectivity to private organisational resources."

**Recommendations:** "Use solutions such as Secure Service Edge (SSE), Identity Aware
Proxies (IAP) or other Zero Trust services (Entra ID Conditional Access, Okta Device
Trust, etc) that integrate identity and device management systems to provide granular
access control to resources based on user identity and device posture."

**Risk addressed:** "Relying on direct connections or traditional VPNs for remote
access can lead to vulnerabilities, as they do not always incorporate strong identity
and device-based security measures. This increases the risk of unauthorised access and
potential data breaches."

**Parameters:** None.

---

## AC-11: Single User Endpoints

**Statement:** "Assign each endpoint device to a single designated primary
[ac-11_prm_1] and enforce the assignment to ensure accountability and enhance security
monitoring."

**Recommendations:** "Implement measures such as user authentication and endpoint
management with device enrolment to enforce the single primary user per endpoint. If
secondary accounts for local device support or maintenance activities are used, consider
securing them with endpoint privilege management tools."

**Risk addressed:** "Allowing multiple users to access a single endpoint device can
lead to security risks such as data leakage, difficulty in tracking user activities, and
increased vulnerability to insider threats."

**Parameters:**
- **ac-11_prm_1** (type, str) — "The type of user or identity."

---

## AC-12: Single Sign-On (SSO) for Internal Services and Accounts

**Statement:** "Use Single Sign-On (SSO) for internal services and accounts."

**Recommendations:** "Configure multi-factor authentication (MFA) at the Single-Sign On
(SSO) identity provider (IdP) and ensure that access to the system is only granted after
the IdP authenticates the user."

**Risk addressed:** "Without Single Sign-On (SSO), there is an increased risk of
unauthorised access and compromised user credentials, as users may resort to using weak
passwords or reusing credentials across multiple systems, thereby exposing sensitive
information to potential security breaches."

**Parameters:** None.

---

## AC-13: Static Credential Expiry and Rotation

**Statement:** "Rotate long-lived static credentials such as API keys, access keys, and
personal access tokens every [ac-13_prm_1] day(s) or use time-restricted credentials."

**Recommendations:** "Automate credential rotation where possible. Consider
time-restricted alternatives to long-lived static credentials, such as AWS Security
Token Service and IAM Identity Center authentication instead of IAM user access keys."

**Risk addressed:** "Failure to regularly rotate long-lived credentials or use
time-restricted credentials increases the risk of unauthorised access from stolen or
unrevoked credentials."

**Parameters:**
- **ac-13_prm_1** (time period (days), int) — "The time period in days for credential
  rotation."

---

## AC-14: Inventory of Accounts

**Statement:** "Establish and maintain an inventory of all accounts and their access
rights managed within the system."

**Recommendations:** "Regularly review and update the account inventory to ensure
accuracy and completeness. Implement automated tools where feasible to assist in
tracking and managing accounts and their access rights."

**Risk addressed:** "Failure to maintain an accurate inventory of managed accounts
increases the risk of unauthorised access, account misuse, and security breaches due to
unmonitored or orphaned accounts."

**Parameters:** None.

---

## AC-15: Validation Testing of Automated Account Lifecycle Management

**Statement:** "Conduct validation tests on the system integrated with account
management tools to ensure secure integration."

**Recommendations:** "Where possible, test cases should include verifying that: account
provisioning occurs solely through the account management tool(s), not directly on the
SaaS; accounts are deactivated on the final day of authorised use; accounts are
provisioned only after validating that access is permitted to the defined boundaries;
and access rights match the account's assigned role and functions."

**Risk addressed:** "Failure to conduct validation tests on the integration of account
management tools with SaaS platforms increases the risk of unauthorised access, improper
account provisioning, and potential security breaches."

**Parameters:** None.

**Level note:** in the catalog but assigned in no published SSP as of the embed date.

---

## AC-16: Separation of Duties

**Statement:** "Implement and maintain separation of duties for access and privileges
to prevent any single individual from having excessive control over key processes or
systems."

**Recommendations:** "Implement multiple complementary controls to enforce separation
of duties, including but not limited to role-based access control (RBAC), Privileged
Identity Management (PIM), and Just-In-Time (JIT) access. Where perfect separation is
not feasible, use compensating controls such as audit logging, alerting, and rate
limits. Consider using tools like Azure AD Privileged Identity Management or AWS
Organizations for managing separation of duties in cloud environments."

**Risk addressed:** "Failure to implement separation of duties increases the risk of
fraud, errors, and misuse of systems due to excessive concentration of privileges,
potentially compromising the integrity and security of critical operations."

**Parameters:** None.

**Level note:** appears only in the High-Risk Cloud CII plan (Level 1).

---

## Cross-family boundaries

- **AS (secure-coding-as):** application-layer authentication mechanics — password
  policy (AS-5), salted hashing (AS-6), per-request authorisation checks in code (AS-7),
  secrets storage (AS-8), rate limiting (AS-4), session timeouts (AS-11) — are AS. AC
  owns account and identity *governance*: who has an account, what it may access, how it
  authenticates at the identity layer, and when it dies. A weak password hash is AS-6;
  an account nobody disabled is AC-3.
- **LM (logging-monitoring):** logging of account, access-rights, and authentication
  events is LM-4/LM-7; AC-16's compensating "audit logging, alerting" leans on LM
  machinery. UEBA over account behaviour is LM-20.
- **NS (network security):** firewalls, segmentation, and network ACLs are NS. AC-10
  replaces network-position trust (VPN reachability) with identity + device posture —
  it governs *who and what device*, not *which subnet*.
- **HR (Human Resource, High-Risk CII only):** personnel vetting and exit process are
  HR; the account provisioning/deprovisioning that must fire on those events is AC-8,
  validated by AC-15.
- **DSS TX-6 / singpass and corppass:** Myinfo/Corppass pre-fill and the
  Singpass/Corppass integration mechanics of a public-facing form live in the
  **singpass** and **corppass** skills; **sg-service-shell** owns the surrounding DSS
  page shell. AC-7 is the cybersecurity-side mandate to use Singpass/Corppass MFA for
  high-assurance public services in the first place.
- **SD/SC (secure-pipeline):** pipeline deploy keys and CI tokens are covered by AC-13
  rotation policy, but pipeline hardening (protected branches, signed commits) is SD/SC.

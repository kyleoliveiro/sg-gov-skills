# Data Protection (DP) controls — verbatim reference

Embedded from **info.standards.tech.gov.sg as of 2026-07-23**; the DP family page was
**last updated 24 March 2026**. The family scope is *how a system stores, moves, and
disposes of government data*: residency, encryption, tenancy, sanitisation, loss
prevention, and classification disclosure. The standards iterate; verify anything
compliance-critical against the live page:

- DP control catalog: https://info.standards.tech.gov.sg/control-catalog/cybersecurity/dp/

## Level assignments (vary by SSP)

**DP-1 is part of the 7-control Level-0 spine of every published SSP** (alongside PM-3,
PM-4, PM-5, LM-12, IS-11, IS-14) — mandatory with no deviation path, cloud and on-prem.
DP-8 additionally ships with the **Gen-AI SSP overlay** at Level 1. The remaining DP
controls commonly sit at Level 1; the project's own SSP is authoritative for which level
applies and for every parameter value below.

---

## Data classification background

The Singapore Government classifies data by security classification — OFFICIAL (OPEN /
CLOSED), RESTRICTED, CONFIDENTIAL, SECRET — and by sensitivity tier — NORMAL / SENSITIVE
NORMAL / SENSITIVE HIGH. The maximum classification a system handles (confirm with the
data owner) drives which data falls under dp-1_prm_2 residency enforcement, how strong
encryption and DLP must be, and what DP-8 must disclose at input fields.

---

## DP-1: Data Residency

**Statement:** "Enforce data residency of [dp-1_prm_2] data in [dp-1_prm_1]."

**Recommendations:** "Data residency in Singapore must be enforced for [dp-1_prm_2]
data."

**Risk addressed:** "Failure to enforce data residency in the appropriate country may
lead to legal and regulatory compliance issues, privacy concerns, and potential
unauthorised access or storage of sensitive data outside the jurisdiction, increasing the
risk of legal consequences and data breaches."

**Parameters:**
- **dp-1_prm_1** (country, str) — the country the data resides in (Singapore for
  government data).
- **dp-1_prm_2** (type, str) — the type of data requiring enforced residency.

---

## DP-2: Data at Rest Encryption

**Statement:** "Encrypt data at rest."

**Recommendations:** "Many CSP services encrypt data at rest by default but this should
be confirmed and validated depending on service usage."

**Risk addressed:** "Without encrypting data at rest, there's an increased risk of
unauthorised access and data exposure in the event of physical theft, unauthorised access
to storage media, or compromised security controls, compromising the confidentiality of
stored information."

**Parameters:** None.

---

## DP-3: Data in Transit Encryption

**Statement:** "Encrypt data in transit."

**Recommendations:** "While some CSP services transparently encrypt data in transit at
the network layer, data at the application layer should be encrypted using protocols such
as Transport Layer Security (TLS) and Secure Socket Layer (SSL)."

**Risk addressed:** "Failure to encrypt data in transit increases the risk of
unauthorised interception and eavesdropping, potentially leading to data breaches,
unauthorised access, and compromise of sensitive information during transmission."

**Parameters:** None.

---

## DP-4: Central Cloud Tenant Management

**Statement:** "Implement a centralised cloud tenant management structure for
[dp-4_prm_1] using [dp-4_prm_2]."

**Recommendations:** "Consider services like AWS Organizations, GCP Organizations, or
Azure Management Groups for centralised management. Implement appropriate landing zone
frameworks. Establish consistent policies and guardrails across all accounts or projects.
Centralise logging and monitoring for comprehensive visibility. Use tagging strategies
for resource organisation."

**Risk addressed:** "Lack of centralised cloud tenant management can lead to inconsistent
security policies, reduced visibility, and increased difficulty in managing and securing
cloud resources across the organisation."

**Parameters:**
- **dp-4_prm_1** (systems, str) — the systems to be hosted on a central tenant.
- **dp-4_prm_2** (system, str) — the central tenant management structure.

---

## DP-5: Sanitisation

**Statement:** "Sanitise all hardware that stores data at rest. Shred or incinerate data
storage meant for retirement."

**Recommendations:** "Use industry standards such as a) Peter Gutmann Secure Deletion; b)
Bruce Schneier Algorithm c) US Department of Defence's Standards (DoD 5220.22-M)."

**Risk addressed:** "Violating this control can expose government data to unauthorised
users."

**Parameters:** None.

---

## DP-6: Witness Sanitisation and Destruction of Storage Devices

**Statement:** "Witness the sanitisation and destruction process to ensure data is
removed from storage."

**Recommendations:** "Establish a SOP to ensure sanitisation and destruction are
witnessed by an agency staff."

**Risk addressed:** "Ensuring storage devices are sanitised or destroyed will eliminate
the possibility of unauthorised or unintended data retention."

**Parameters:** None.

---

## DP-7: Data Loss Prevention

**Statement:** "Implement data loss prevention mechanisms that monitor data flows, detect
sensitive data transfers, and block unauthorised sharing of sensitive data."

**Recommendations:** "Where possible, use built-in solutions such as Microsoft Purview or
Google Workspace data loss prevention rules. Regularly review and update data loss
prevention policies to adapt to evolving threats and organisational needs."

**Risk addressed:** "Failure to implement data loss prevention measures increases the
risk of unauthorised data exfiltration, accidental data leaks, and data breaches,
compromising sensitive information and organisational integrity."

**Parameters:** None.

---

## DP-8: Data Classification Disclosure

**Statement:** "For internal applications serving public officers, specify the highest
permitted security and sensitivity classification for input data, such as text, audio, or
multimedia/file uploads, in the system's user interface and guides."

**Recommendations:** "Indicate with a clear message, either at or near the input field,
the relevant data classification that may be used with the system."

**Risk addressed:** "Users who are not informed of the maximum allowed data
classification may submit sensitive information the system is not permitted to process,
risking data breaches, legal violations, and reputational harm."

**Parameters:** None.

---

## Cross-family notes (what is NOT a DP control)

- **Encryption algorithms, key storage, and rotation** belong to **CK (Cryptography,
  Encryption and Key Management)** — secure-coding-as. DP-2/DP-3 require encryption to
  exist and cover every store and hop; a weak cipher, a hardcoded key, or missing
  rotation is a CK finding.
- **GenAI features** carry the Gen-AI overlay: upload DLP is **GA-6** and the
  model-input classification disclosure is **DP-8 as shipped with that overlay**
  (gen-ai-security). This family covers the general estate.
- **Backup lifecycle** is **BR (Backup & Recovery)**; **access/audit logging** is **LM
  (Logging & Monitoring)**. DP-1 still constrains where backups and logs may reside.
- **The PDPA exclusion.** Public agencies are excluded from the PDPA; the public-sector
  data regime is the **Public Sector (Governance) Act (PSGA)** and the ICT&SS/IM8
  policies, with criminal penalties for public officers' unauthorised disclosure or
  misuse. Vendors acting for agencies carry equivalent obligations contractually. A
  "PDPA doesn't apply" claim therefore never waives a DP control. This is background
  context, not legal advice.
- **Which SSP applies and at which level each DP control sits** is selection-time work
  owned by **ssp-navigator**; this family is implementation-time.

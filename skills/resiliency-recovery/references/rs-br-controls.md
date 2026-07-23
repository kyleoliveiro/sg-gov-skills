# Resiliency (RS) and Backup & Recovery (BR) — full control text

Embedded from **https://info.standards.tech.gov.sg/control-catalog/cybersecurity/rs/**
and **https://info.standards.tech.gov.sg/control-catalog/cybersecurity/br/** as of
**2026-07-23** (both pages last updated 24 March 2026). The standards iterate actively;
verify against the live pages for any compliance-critical decision.

**Family scopes:** RS — controls for system resiliency (availability under failure and
load). BR — *controls to support backup and disaster recovery.*

**RS has 3 controls (RS-1..RS-3), BR has 6 (BR-1..BR-6).** Six of the nine carry
agency-defined parameters — the catalog sets no values; every parameter is an SSP
tailoring decision.

---

## RS-1 — Multi-AZ Deployment

- **Control Statement:** Deploy the system in [rs-1_prm_1] availability zones (AZs)
  within the region.
- **Control Recommendations:** Utilise cloud-native services for load-balancing and
  auto-scaling across multiple AZs. Implement health checks and automated failover
  mechanisms to redirect traffic. Ensure data is replicated across multiple AZs.
- **Risk Statement:** Failure to deploy services across multiple availability zones
  increases the risk of extended service outages due to a single point of failure.
- **Parameter:** `rs-1_prm_1` — the number of availability zones to deploy to.

## RS-2 — Dynamic Resource Scaling

- **Control Statement:** Implement and utilise dynamic resource scaling techniques in
  the system.
- **Control Recommendations:** Employ load balancing and auto-scaling to optimise
  resources and minimise idle capacity. See the AWS Well-Architected Framework's
  "Reliability" pillar for additional guidance.
- **Risk Statement:** Inadequate scaling implementation may result in inefficient
  resource utilisation and potential service degradation during spikes in demand,
  potentially causing system outages during peak loads.

## RS-3 — Load Testing

- **Control Statement:** Perform load testing every [rs-3_prm_1] days.
- **Control Recommendations:** Test on a replica of the production system using load
  that mimics real user traffic.
- **Risk Statement:** Inadequate load testing may lead to unexpected system failures
  during periods of high demand, leading to service interruptions.
- **Parameter:** `rs-3_prm_1` — the frequency (in days) at which load testing is
  performed.

---

## BR-1 — Backup

- **Control Statement:** Backup all important data and systems at least every
  [br-1_prm_1] day(s), and store backups in a secure and separate location.
- **Control Recommendations:** Leverage CSP-managed solutions like AWS Backup, Azure
  Backup, or GCP Backup and DR Service as defaults. Backups must reside separately from
  primary storage with encryption applied at rest. For SaaS environments, confirm
  providers can restore from their most recent backup.
- **Risk Statement:** Without regular backups stored in a secure and separate location,
  there is an increased risk of data loss, system failures, and extended downtime in
  the event of accidental deletion, hardware failures, or malicious attacks.
- **Parameter:** `br-1_prm_1` — backup frequency in days.

## BR-2 — Recovery Testing

- **Control Statement:** Conduct testing of recovery processes at least every
  [br-2_prm_1] day(s) to ensure their effectiveness.
- **Control Recommendations:** Ensure each test verifies the system's ability to fully
  restore all data and services.
- **Risk Statement:** Failure to regularly test recovery processes may result in
  ineffective response during actual incidents, increasing the risk of prolonged
  downtime, data loss, and compromised business continuity in the event of a disaster
  or system failure.
- **Parameter:** `br-2_prm_1` — recovery-testing frequency in days.

## BR-3 — Backup Retention

- **Control Statement:** Prevent backups from being modified or deleted for
  [br-3_prm_1] day(s) or as stipulated in the agency's data retention policies.
- **Control Recommendations:** Implement immutability protections using tools such as
  S3 Object Lock or Azure Blob Storage with immutability enabled to enforce
  retention-based safeguards.
- **Risk Statement:** Lack of prevention measures against the modification or deletion
  of backups for the specified duration increases the risk of data loss, unauthorised
  alterations, and potential inability to recover from incidents, compromising the
  integrity and availability of critical information.
- **Parameter:** `br-3_prm_1` — immutable retention period in days.

## BR-4 — Disaster Recovery Plan

- **Control Statement:** Develop, maintain, and regularly test a disaster recovery plan
  that ensures critical functions and data can be restored within the Recovery Time
  Objective (RTO) and Recovery Point Objective (RPO) as determined by business
  requirements and risk assessments.
- **Control Recommendations:** Plans should articulate defined roles, detailed recovery
  procedures, incident communication approaches, and alignment with broader continuity
  initiatives. Validate plan effectiveness through formal exercises.
- **Risk Statement:** Absence of a comprehensive disaster recovery plan increases the
  risk of prolonged system downtime, data loss, and inability to maintain business
  continuity in the event of a disaster, potentially leading to significant financial
  losses and damage to organisational reputation.

## BR-5 — Business Continuity Plan

- **Control Statement:** Develop a business continuity plan.
- **Control Recommendations:** Reference the Cyber Security Agency of Singapore's
  Cybersecurity Toolkit for IT Teams for template resources.
- **Risk Statement:** Failure to develop a Business Continuity Plan may result in
  prolonged system downtime, loss of critical data, and diminished organisational
  resilience during disruptive events, increasing the risk of financial and
  reputational damage.

## BR-6 — Business Continuity Exercise

- **Control Statement:** Conduct a business continuity exercise at least every
  [br-6_prm_1] day(s) to test the effectiveness of the business continuity plan.
- **Control Recommendations:** Conduct testing based on the business continuity plan,
  which can include checklists, tabletop exercises, and simulations.
- **Risk Statement:** Failure to conduct regular business continuity exercises may lead
  to unpreparedness during an actual disruption, increasing response times, operational
  impact, and the risk of ineffective recovery, ultimately jeopardising business
  operations and stakeholder trust.
- **Parameter:** `br-6_prm_1` — exercise frequency in days.

---

## Cross-family notes

- **DP-1 (data-protection)** constrains *where* backups and DR targets may reside —
  a cross-region replica or overseas DR site is a residency breach even though the
  backup itself satisfies BR-1. Backup encryption at rest is DP-2 mechanics; retiring
  backup media triggers DP-5/DP-6 sanitisation and witnessed destruction.
- **PR-3/PR-4 (sg-service-shell)** are the DSS user-facing twins: 24/7 availability
  (delivered by RS-1/RS-2) and scheduled-downtime notices (invoked when DR/BC events
  interrupt service).
- **LM (logging-monitoring)** owns the health checks' alerting pipeline, SLOs, and
  golden signals that detect the failures RS is designed to absorb.
- **CS (container-security)** hardens the containers whose *placement* across AZs
  (topology spread, pod disruption budgets) implements RS-1 for containerised
  workloads.

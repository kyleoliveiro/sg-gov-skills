---
name: logging-monitoring
description: >-
  Set up or audit logging and monitoring against the Singapore Government's ICT&SS Policy
  Reform (IM8 successor) Logging and Monitoring controls (LM-1..LM-21): capturing the five
  security log sources, off-box tamper-resistant storage, retention, structured formats
  and log sanitisation, central security log management (GCSOC), security monitoring and
  detection, and service-health/SLO/DORA/WOGAA monitoring. Use whenever configuring logs,
  CloudTrail/VPC Flow Logs/WAF or database logging, GuardDuty-class detection, SIEM or
  UEBA, log retention or lifecycle policies, alerting, observability, or when auditing an
  agency system's detection posture. Triggers: "logging requirements", IM8/ICT&SS LM
  controls, GCSOC, central log management, security monitoring, log retention, log
  sanitisation, SLOs / golden signals, DORA metrics, web defacement monitoring, WOGAA on
  a government project.
---

# logging-monitoring: LM controls for SG government systems

You are setting up or auditing **how a system captures, protects, and acts on its logs
and telemetry** against the ICT&SS Policy Reform **Logging and Monitoring family
(LM-1..LM-21)** — the largest cybersecurity family in the catalog. It covers what to log,
where logs live, how long they survive, who watches them, and the operational monitoring
(SLOs, golden signals, DORA, WOGAA) that keeps the service healthy.

Two facts anchor everything:

1. **LM-12 (central security log management and monitoring) sits in the Level-0 spine of
   every published SSP** — mandatory, no deviation path, cloud and on-prem alike. **GCC
   tenants already have CSP tenant security logs stored centrally and available for
   forwarding to the Government Cyber Security Operations Centre (GCSOC)** — contact
   GCSOC for subscription. A system whose logs never leave the team's own account fails
   the one LM control that cannot be traded away.
2. **Security log coverage is enumerable, not a vibe.** The catalog names the five
   security log sources — **network flow logs, cloud management/audit logs, access logs,
   database logs, and host logs** (LM-3..LM-7, enumerated in LM-8's recommendation).
   Audit against that list; "we have logging" without all five is a coverage gap, not a
   pass.

## What this family is *not* about

- **CSPM and vulnerability scanning are ST** (security-testing). ST-2 watches for cloud
  *misconfigurations*; LM-9 watches for *runtime threats and breaches* (GuardDuty-class
  detection). Findings from either feed the ST-5 vulnerability register.
- **Where log stores reside and whether they're encrypted is DP** (data-protection).
  Logs are data: DP-1 residency and DP-2 at-rest encryption apply to the log bucket too.
  An unencrypted or overseas log store is a DP finding; LM owns capture, protection from
  tampering, retention, and monitoring.
- **User-facing error hygiene is AS** (secure-coding-as). Not leaking stack traces to
  end users is an application-security concern; **LM-19 is about sensitive data written
  *into* the logs themselves** — sanitise before recording.
- **WOGAA implementation detail is the service shell.** LM-18 mandates WOGAA in public
  facing digital services from the cybersecurity side; the DSS twin (PR-2) and the
  registration/tracking-code mechanics live in **sg-service-shell**.
- **Pipeline controls are SD/SC** (secure-pipeline). LM-17 *measures* software delivery
  performance (DORA metrics); the branch protections and CI gates being measured belong
  to Secure Development.

## Source and currency

Control text in this skill and `references/lm-controls.md` is embedded from
**info.standards.tech.gov.sg as of 2026-07-23**; the LM family page was last updated
**24 March 2026**. The standards iterate. For any compliance-critical decision, verify
against the live page:

- LM control catalog: https://info.standards.tech.gov.sg/control-catalog/cybersecurity/lm/

## Reference files

- `references/lm-controls.md` — full text of LM-1..LM-21 (statement, recommendations,
  risk, the three parameters) plus per-SSP level assignments and cross-family notes.
  Read it when you need exact wording for an audit response or SSP documentation.
- `references/implementation-recipes.md` — concrete config per control: Terraform for
  flow logs/CloudTrail/ALB logging, off-box shipping and tamper-resistant bucket
  policies, retention lifecycle, OCSF/OTel formatting, sanitisation patterns, GuardDuty,
  and the monitoring stack (SLOs, golden signals, DORA, defacement). Read it when
  actually building.

## Before you start: the SSP parameters

Get these values from the System Security Plan — if the SSP is missing or a value is
blank, flag that as its own finding and ask; never invent a number (the sibling skill
**ssp-navigator** determines levels):

| Control | Parameter | What the SSP defines |
|---|---|---|
| LM-8 | lm-8_prm_1 | Security log retention period in days |
| LM-12 | lm-12_prm_1 | The central security log management and monitoring service |
| LM-21 | lm-21_prm_1 | Maximum days between malware/IOC detection updates |

LM-12 is Level 0 in every SSP. Medium-Risk Cloud additionally promotes **LM-3, LM-4,
LM-6, LM-9** to Level 0; High-Risk Cloud CII puts **LM-1..LM-9, LM-12, LM-13** at
Level 0. The project's own SSP is authoritative.

## Procedure

Work in this order. For **setup**, produce each configuration/artifact. For **audit**,
verify each and record pass / fail / not-applicable-per-SSP with evidence (the logging
config, the bucket policy, the retention rule, the GCSOC subscription, the dashboards).
Recipes for every step are in `references/implementation-recipes.md`.

### Stage 1 — Capture every source (LM-3..LM-7)

Enable all five security log sources:

- **Network flow (LM-3)**: VPC Flow Logs or equivalent on every network interface.
- **Cloud management/audit (LM-4)**: CloudTrail or equivalent for account, access, IAM
  and resource changes; for SaaS/COTS, enable the built-in audit logging features.
- **Database (LM-5)**: RDS logging or equivalent audit events.
- **Access (LM-6)**: WAF, load balancer, proxy, API gateway and web server request logs.
- **Host security events (LM-7)**: OS security events, authentication, EDR alerts,
  configuration changes, account and access-rights changes.

### Stage 2 — Make the logs trustworthy (LM-1, LM-2, LM-19, LM-15, LM-8)

**2a. Off the box, immediately (LM-1).** Ship logs to a different system/component than
the one that generated them, as soon as possible after the event — an app server keeping
its only copy on local disk means a compromise erases the evidence. Store cloud audit
logs in a separate system or account.

**2b. Tamper-resistant (LM-2).** Least-privilege access to log storage; **as far as
possible, read-only**. Nobody on the delivery team needs delete rights on security logs.
Logs sent to GCC Central Logs are tamper-resistant already.

**2c. Sanitise before recording (LM-19).** Identify classified/sensitive data that could
reach logs — NRIC-class PII, credentials, API keys, payment details — and mask or
tokenise it *before* it is written or shared with any third party.

**2d. Structured format (LM-15).** Security logs in OCSF/ECS-style schemas; operational
logs in OpenTelemetry or structured JSON — consistent formats are what make central
analysis and automated detection possible.

**2e. Retain long enough (LM-8).** Security logs (all five Stage-1 sources) kept at
least **lm-8_prm_1 days**, with lifecycle automation (e.g. S3 Lifecycle). Non-security
logs: as long as needed for incident resolution and debugging.

### Stage 3 — Centralise and detect (LM-12, LM-9, LM-13, LM-20, LM-21, LM-14)

**3a. Central security log management (LM-12 — Level 0 everywhere).** Centralise with
the service named in lm-12_prm_1. On GCC, tenant security logs are already central and
forwardable to **GCSOC** — subscribe rather than build.

**3b. Security monitoring with automated alerts (LM-9).** GuardDuty / Defender /
equivalents, alerting to somewhere a human responds. **Error tracking (Sentry-class
tools) and uptime checks are not security monitoring** — they watch bugs and
availability, not breaches.

**3c. Deeper detection where warranted**: anomalous database activity monitoring
(LM-13, e.g. RDS Activity Streams), UEBA integrated with the SIEM for insider-threat
signals (LM-20), and **web defacement monitoring for internet-facing systems (LM-14)**
with a recovery plan.

**3d. Keep detections current (LM-21).** Malware/IOC detections updated at least every
**lm-21_prm_1 days**, with automation to monitor rollout and conformance.

### Stage 4 — Watch the service, not just attackers (LM-10, LM-11, LM-16, LM-17, LM-18)

- **Resource usage (LM-10)**: alerts on abnormal usage — spikes, access at unexpected
  hours, excessive charges.
- **SLOs/SLIs (LM-11)** and the **4 Golden Signals — latency, traffic, errors,
  saturation (LM-16)**: track, alert, and use trends to improve.
- **DORA metrics (LM-17)**: deployment frequency, lead time for changes, change failure
  rate, time to restore.
- **WOGAA (LM-18)**: mandatory for public-facing digital services — register at
  https://wogaa.sg/ and implement per https://docs.wogaa.sg/ (mechanics in
  sg-service-shell).

## Audit checklist

Verify each row; record evidence. "Param" marks controls whose pass criteria come from
the SSP — ask for the values rather than inventing them.

| ID | Check | Where | Param |
|---|---|---|---|
| LM-1 | Logs shipped off the generating component promptly; cloud audit logs in a separate system/account | Log pipeline config | |
| LM-2 | Log storage least-privilege, read-only as far as possible; no team delete rights | IAM / bucket policy | |
| LM-3 | Flow logs on all network interfaces | VPC config | |
| LM-4 | Cloud management/audit events logged (CloudTrail or equivalent; SaaS audit features on) | Trail config | |
| LM-5 | Database audit events logged | DB config | |
| LM-6 | WAF / LB / proxy / web server access requests logged | LB/WAF config | |
| LM-7 | Host security events logged (OS, auth, EDR, config and access changes) | Host/EDR config | |
| LM-8 | Security logs retained ≥ lm-8_prm_1 days with lifecycle automation | Retention rules | ✓ |
| LM-9 | Security monitoring with automated alerts (GuardDuty-class), responded to | Detection config | |
| LM-10 | Resource usage monitoring and abnormal-usage alerts | Alarms | |
| LM-11 | SLOs/SLIs monitored, maintained, alerted | Monitoring config | |
| LM-12 | Central security log management with lm-12_prm_1 (GCC → GCSOC forwarding) | Central logging / subscription | ✓ |
| LM-13 | Anomalous database activity monitored | DB activity streams | |
| LM-14 | Web defacement detection and recovery measures (internet-facing) | Monitoring plan | |
| LM-15 | Structured formats (OCSF/ECS for security; OTel/JSON for ops) | Log schema | |
| LM-16 | 4 Golden Signals tracked and analysed | Dashboards | |
| LM-17 | DORA 4 Key metrics measured and used | Delivery metrics | |
| LM-18 | WOGAA implemented in public-facing services | WOGAA registration | |
| LM-19 | Sensitive data masked/tokenised before logging or sharing | Log samples + pipeline | |
| LM-20 | UEBA integrated with SIEM, tuned, real-time alerts | UEBA config | |
| LM-21 | Detections updated ≤ every lm-21_prm_1 days, rollout automated | Update automation | ✓ |

Report per control ID with pass / fail / not-applicable-per-SSP, the evidence found,
and — for failures — the fix from `references/implementation-recipes.md`. Attribute log
store encryption/residency findings to DP and misconfiguration-posture findings to ST-2,
not LM; and correct, don't accept, "we have Sentry so monitoring is covered" reasoning.

## Related skills in this repo

- **ssp-navigator** — which SSP applies and at which level each LM control sits (LM-12
  is Level 0 everywhere; Medium-Risk Cloud promotes LM-3/4/6/9; High-Risk Cloud CII
  promotes LM-1..9, 12, 13).
- **security-testing** — ST-2 CSPM (misconfig posture) vs LM-9 (runtime detection);
  detections and alerts feed the ST-5 vulnerability register and response SLAs.
- **data-protection** — DP-1/DP-2 residency and encryption of the log stores themselves;
  DP-7 DLP for data flows beyond logs.
- **sg-service-shell** — WOGAA registration and implementation (LM-18's DSS twin PR-2).
- **secure-coding-as** — AS error hygiene (what users see) alongside LM-19 (what logs
  record).
- **secure-pipeline** — the SD/SC pipeline controls that LM-17's DORA metrics measure.
- **network-security** — NS-9 IPS/IDS detections and NS-11 firewall-change alerts are
  security log/alert sources that must feed the LM central pipeline and GCSOC; NS owns
  the sensors, LM owns the pipeline.
- **resiliency-recovery** — RS/BR owns multi-AZ failover, scaling, backups, and DR; LM
  owns the health checks, SLOs, and golden-signal alerting that detect the failures RS
  absorbs and that load-test results are judged against.

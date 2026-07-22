# Logging and Monitoring (LM) controls — verbatim reference

Embedded from **info.standards.tech.gov.sg as of 2026-07-23**; the LM family page was
**last updated 24 March 2026**. The family scope, as published: *"Controls to support
detection and response to security and operations incidents."* The standards iterate;
verify anything compliance-critical against the live page:

- LM control catalog: https://info.standards.tech.gov.sg/control-catalog/cybersecurity/lm/

## Level assignments (vary by SSP)

**LM-12 is part of the 7-control Level-0 spine of every published SSP** (alongside PM-3,
PM-4, PM-5, DP-1, IS-11, IS-14) — mandatory with no deviation path, cloud and on-prem.
**Medium-Risk Cloud** additionally promotes **LM-3, LM-4, LM-6, LM-9** to Level 0.
**High-Risk Cloud CII** puts **LM-1 through LM-9 plus LM-12 and LM-13** at Level 0. The
remaining LM controls commonly sit at Level 1 (Sandbox parks everything except the PM
trio at Level 2); the project's own SSP is authoritative for which level applies and for
every parameter value below.

---

## LM-1: Separate Log Storage

**Statement:** "Store logs in a different system or system component than the system
component that generated the logs."

**Recommendations:** "Do not store logs only in the same system component that generated
it. For example, an application server on EC2 or ECS should send logs to a separate
storage such as an S3 bucket as soon as possible after the logged event instead of only
storing it on the server. For cloud audit logs, store them in a separate system or
account."

**Risk addressed:** "Storing logs in a repository separate from the system component
reduces the risk of tampering, unauthorised access, and manipulation of logs if the
system component is compromised."

**Parameters:** None.

---

## LM-2: Tamper-Resistant Log Storage

**Statement:** "Protect logs from unauthorised access, modification, and deletion."

**Recommendations:** "Apply access control policies to logs based on the principle of
least privilege. As far as possible, only read access should be granted. Logs sent to
GCC Central Logs are tamper-resistant."

**Risk addressed:** "Without protection measures, logs are susceptible to unauthorised
access, modification, or deletion, leading to the risk of tampering, loss of crucial
audit information, and compromised forensic analysis capabilities during security
incidents."

**Parameters:** None.

---

## LM-3: Network Flow Logging

**Statement:** "Log network traffic going to and from network interfaces."

**Recommendations:** "Enable VPC Flow Logs for AWS or its equivalents."

**Risk addressed:** "Failing to log network traffic going to and from network interfaces
increases the risk of overlooking suspicious activities, potential security breaches,
and the inability to trace and investigate network-related incidents effectively."

**Parameters:** None.

---

## LM-4: Audit Logging

**Statement:** "Log management and audit events."

**Recommendations:** "For cloud, configure CloudTrail for AWS or its equivalents to log
management and audit events such as changes to accounts, access, IAM policies and
resources. For SaaS and COTS, enable audit logging features."

**Risk addressed:** "Neglecting to log and manage audit events increases the risk of
undetected security incidents, compromises visibility into system activities, and
hinders effective forensic analysis and compliance monitoring."

**Parameters:** None.

---

## LM-5: Database Logging

**Statement:** "Log database audit events."

**Recommendations:** "Enable RDS logging for AWS or its equivalents."

**Risk addressed:** "Neglecting to log database audit events raises the risk of
overlooking unauthorised activities, compromises in data security, and hinders the
ability to track and investigate security incidents or compliance violations within the
database environment."

**Parameters:** None.

---

## LM-6: Access Logging

**Statement:** "Log access requests sent to web application firewalls, load balancers,
proxies or web servers."

**Recommendations:** "Enable AWS WAF logging, Application Load Balancer logging, API
Gateways, or their equivalents."

**Risk addressed:** "Failure to log access requests sent to web application firewalls,
load balancers, proxies, or web servers increases the risk of overlooking potential
security threats, unauthorised access attempts, and compromises visibility into the
traffic that could lead to security incidents."

**Parameters:** None.

---

## LM-7: Host Security Event Logging

**Statement:** "Log security events on hosts."

**Recommendations:** "Host security events include operating system security events,
authentication, and endpoint detection and response alerts, configuration changes, and
account and access rights changes."

**Risk addressed:** "Neglecting to log security events on hosts increases the risk of
undetected security incidents, compromises incident response capabilities, and hinders
forensic analysis, limiting the ability to identify and mitigate potential threats."

**Parameters:** None.

---

## LM-8: Security Log Retention

**Statement:** "Retain security logs for at least [lm-8_prm_1] day(s)."

**Recommendations:** "Security logs include network flow logs, cloud management logs,
access logs, database logs and host logs. Retain non-security logs (e.g. application,
operations and performance logs) as long as needed for incident resolution and
debugging. Consider log lifecycle management automation, such as Amazon S3 Lifecycle
configurations."

**Risk addressed:** "Failure to retain security logs increases the risk of losing
crucial historical data, hindering investigations, compliance audits, and the ability to
identify and respond to security incidents that occurred beyond a limited timeframe."

**Parameters:**
- **lm-8_prm_1** (time period (days), int) — "The time period in days of log retention."

Note the enumeration in the recommendation: the five security log sources are exactly
LM-3..LM-7 — audit coverage against that list.

---

## LM-9: Security Monitoring and Alerting

**Statement:** "Configure security monitoring to identify potential security violations
or breaches and send automated alerts, and respond to them accordingly."

**Recommendations:** "Enable Amazon GuardDuty, Microsoft Azure Security Center, or their
equivalents."

**Risk addressed:** "Without configuring security monitoring to identify potential
security violations or breaches and send automated alerts, there's an increased risk of
delayed or unnoticed security incidents, hindering timely response and mitigation
efforts to protect the system from further compromise."

**Parameters:** None.

---

## LM-10: Resource Usage Monitoring and Alerting

**Statement:** "Configure resource usage monitoring to identify abnormal usage and send
automated alerts."

**Recommendations:** "Configure Amazon CloudWatch alarms, Azure Monitor alerts, or their
equivalents to identify abnormal usage such as spike in usage, access to resources
during unexpected hours, and excessive charges."

**Risk addressed:** "Lack of resource usage monitoring with automated alerts increases
the risk of overlooking abnormal usage patterns, potential resource abuse, and
compromises in system performance, hindering the ability to proactively address issues
and prevent service disruptions."

**Parameters:** None.

---

## LM-11: Service Level Monitoring and Alerting

**Statement:** "Monitor, maintain and alert on service level objectives (SLOs) and
indicators (SLIs) to ensure consistent service performance, availability and
reliability."

**Recommendations:** "Implement a comprehensive monitoring system that tracks key SLIs
and evaluates them against defined SLOs. This will help in identifying potential service
level breaches early and take proactive measures to maintain service quality. Examples
include CloudWatch metrics and alerts, Amazon Route 53 health checks, Azure Monitor
Application Insights, or their equivalents."

**Risk addressed:** "Without effective service level monitoring to identify potential
application or service degradation and send automated alerts, there is a risk of failing
to meet service availability standards, which could result in user dissatisfaction and
reduced reliability."

**Parameters:** None.

---

## LM-12: Central Security Log Management and Monitoring

**Statement:** "Centralise security log management and monitoring with [lm-12_prm_1]."

**Recommendations:** "Tenants on Government Commercial Cloud (GCC) already have Cloud
Service Provider (CSP) tenant security logs stored centrally and available for
forwarding to Government Cyber Security Operations Centre (GCSOC). Contact GCSOC for
subscription and additional services."

**Risk addressed:** "Lack of central security log management and monitoring increases
the risk of delayed or unnoticed security incidents, hindering effective response, and
compromising the overall cybersecurity posture."

**Parameters:**
- **lm-12_prm_1** (service, str) — "The central security log management and monitoring
  service."

**Level note:** Level 0 in every published SSP — part of the 7-control spine.

---

## LM-13: Anomalous Database Activity Monitoring

**Statement:** "Monitor database activities for anomalous activity."

**Recommendations:** "Configure database activity monitoring tools, such as RDS Activity
Streams or similar mechanisms, to detect and alert on unusual authentication attempts,
abnormal read or write operations, or other anomalous database activity."

**Risk addressed:** "Neglecting to monitor database activities for anomalous behaviour
increases the risk of undetected security threats, unauthorised access, and compromises
in data integrity, hindering the ability to identify and respond to potential
database-related incidents."

**Parameters:** None.

---

## LM-14: Web Defacement Monitoring

**Statement:** "Plan for and implement measures to detect and recover from web
defacements."

**Recommendations:** "Visual monitoring tools enable detection of web defacements of
internet-facing systems."

**Risk addressed:** "Failure to detect and respond to web defacement promptly will lead
to prolonged disruption to services."

**Parameters:** None.

---

## LM-15: Structured Log Formatting

**Statement:** "Publish logs in a consistent, structured format that aligns with
industry standards for easy parsing and analysis."

**Recommendations:** "For security logs, implement or transform to OCSF (Open
Cybersecurity Schema Framework), ECS (Elastic Common Schema) or similar schemas to
standardise log formats for better threat detection and analysis. For operational logs,
adopt OpenTelemetry or structured JSON formats to facilitate clear, structured, and
efficient log analysis for system performance and diagnostics. Consistent log formatting
aids in automated parsing and helps in integrating logs from various sources."

**Risk addressed:** "Inconsistent or unstructured log formatting can lead to
difficulties in log analysis and monitoring, potentially resulting in missed critical
events or delayed response to system anomalies."

**Parameters:** None.

---

## LM-16: Key Signals Monitoring

**Statement:** "Monitor key user-facing signals to maintain robust service health and
performance."

**Recommendations:** "Implement monitoring of key signals such as latency, traffic,
errors, and saturation (the 4 Golden Signals). Regularly track and analyse these
indicators for proactive issue detection and resolution. Use this data to identify
trends and areas for system improvement, ensuring continuous enhancement in service
quality and reliability."

**Risk addressed:** "Inadequate monitoring of key user-facing signals such as latency,
traffic, errors, and saturation can lead to suboptimal service performance, adversely
impacting user experience, system efficiency, and increasing the likelihood of system
failures. This oversight can significantly detract from service reliability and user
satisfaction."

**Parameters:** None.

---

## LM-17: Software delivery performance monitoring

**Statement:** "Measure and analyse software delivery performance to optimise
development velocity and operational efficiency."

**Recommendations:** "Implement tools and processes to track Deployment Frequency, Lead
Time for Changes, Change Failure Rate, and Time to Restore Service (the DORA 4 Key
metrics). Use these metrics as benchmarks to drive continuous improvement in the
software development and deployment process, enhancing agility, reliability, and
responsiveness to changes."

**Risk addressed:** "Failing to measure and improve the software delivery performance
can lead to inefficient development processes, reduced software quality and longer
recovery times."

**Parameters:** None.

---

## LM-18: Whole of Government Application Analytics (WOGAA)

**Statement:** "Implement Whole of Government Application Analytics (WOGAA) in public
facing digital services."

**Recommendations:** "Register at the WOGAA portal at https://wogaa.sg/ and follow the
implementation documentation at https://docs.wogaa.sg/."

**Risk addressed:** "Lack of performance tracking can lead to gaps in service delivery."

**Parameters:** None.

**Cross-family note:** the DSS twin is PR-2 (Level 0 in both DSS profiles); WOGAA
mechanics are covered in the sg-service-shell skill.

---

## LM-19: Log Sanitisation

**Statement:** "Sanitise logs to protect classified and sensitive data before it is
recorded in any logging system or shared to any third party."

**Recommendations:** "Identify types of classified and sensitive data that may appear in
logs. When logging, consider using sanitisation techniques like masking or tokenisation.
This ensures that sensitive information — such as PII, credentials, API keys, and
payment details — are not stored in plaintext during log collection."

**Risk addressed:** "Failing to sanitise logs increases the risk of unauthorised
exposure or misuse of sensitive information and other confidential data. This exposure
could lead to privacy breaches, financial losses, compliance violations and damage to
national reputation."

**Parameters:** None.

---

## LM-20: User and Entity Behaviour Analytics

**Statement:** "Implement User and Entity Behaviour Analytics (UEBA) to monitor and
analyse user activities for suspicious behaviour and potential threats."

**Recommendations:** "Select a UEBA tool that integrates with existing security
information and event management (SIEM) solutions and provides real-time alerts for
anomalous activities. Ensure regular updates and tuning of the tool to enhance detection
capabilities."

**Risk addressed:** "Lack of monitoring for potentially malicious user and entity
behaviour increases the risk of insider threats and undetected malicious activities,
potentially leading to data breaches and system compromise."

**Parameters:** None.

---

## LM-21: Detection Updates

**Statement:** "Update detections for malware and indicators of compromise at least
every [lm-21_prm_1] day(s)."

**Recommendations:** "Implement automation to monitor the rollout of detection updates
and ensure conformance."

**Risk addressed:** "Outdated detection rules increase the risk of undetected
compromises."

**Parameters:**
- **lm-21_prm_1** (time period (days), int) — "The time period in days for detection
  update frequency."

---

## Cross-family boundaries

- **ST (security-testing):** ST-2 CSPM detects cloud *misconfigurations*; LM-9 detects
  *runtime threats*. ST-1 scans for vulnerabilities. Alerts and findings from LM
  detection flow into the ST-5 vulnerability register with its severity SLAs.
- **DP (data-protection):** log stores are data stores — DP-1 (Singapore residency) and
  DP-2 (encryption at rest) apply to log buckets and SIEM storage. Attribute an
  unencrypted or overseas log store to DP.
- **AS (secure-coding-as):** user-facing error hygiene (no stack traces to users) is AS;
  sensitive data written into logs is LM-19.
- **SD/SC (secure-pipeline):** LM-17 measures delivery performance (DORA); the pipeline
  controls being measured are SD/SC.
- **DSS (sg-service-shell):** LM-18 WOGAA is mirrored by DSS PR-2; registration and
  tracking-code implementation live with the service shell.

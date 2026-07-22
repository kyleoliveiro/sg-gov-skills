# LM implementation recipes

Concrete configuration per control group. AWS examples throughout (swap for Azure/GCP
equivalents); on GCC, prefer the platform-provided central logging over building your
own.

## Stage 1 — Capture every source (LM-3..LM-7)

### VPC Flow Logs (LM-3)

```hcl
resource "aws_flow_log" "vpc" {
  vpc_id               = aws_vpc.main.id
  traffic_type         = "ALL"
  log_destination_type = "s3"
  log_destination      = aws_s3_bucket.security_logs.arn
}
```

### CloudTrail (LM-4)

```hcl
resource "aws_cloudtrail" "org" {
  name                          = "agency-trail"
  s3_bucket_name                = aws_s3_bucket.security_logs.id
  is_multi_region_trail         = true
  include_global_service_events = true
  enable_log_file_validation    = true   # integrity — supports LM-2
}
```

For SaaS/COTS, enable the product's audit logging feature and export it (many default
to off or to short in-product retention).

### Database logging (LM-5) and anomaly monitoring (LM-13)

```hcl
resource "aws_db_instance" "app" {
  # ...
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
}
```

Add `pgaudit` (or the engine's audit plugin) for statement-level audit events, and RDS
**Activity Streams** (LM-13) to alert on unusual authentication attempts and abnormal
read/write patterns.

### Access logging (LM-6)

```hcl
resource "aws_lb" "app" {
  # ...
  access_logs {
    bucket  = aws_s3_bucket.security_logs.id
    prefix  = "alb"
    enabled = true
  }
}
```

Also enable WAF logging (`aws_wafv2_web_acl_logging_configuration`) and API Gateway
access logs. Every request-serving hop — WAF, LB, proxy, web server — logs.

### Host security events (LM-7)

Ship OS security/auth logs (CloudWatch agent, auditd/journald collection) plus EDR
alerts, configuration changes, and account/access-rights changes. On managed endpoints
the agency's EDR usually covers this — confirm events actually reach central storage.

## Stage 2 — Trustworthy logs (LM-1, LM-2, LM-8, LM-15, LM-19)

### Off-box, tamper-resistant storage (LM-1, LM-2)

Ship as soon as possible after the event (CloudWatch agent / Fluent Bit → S3 or
CloudWatch Logs); local disk is a buffer, never the system of record. Cloud audit logs
go to a **separate account** (the org's log-archive account).

Bucket policy: least privilege, read-only as far as possible —

```json
{
  "Sid": "DenyDeleteAndOverwrite",
  "Effect": "Deny",
  "Principal": "*",
  "Action": ["s3:DeleteObject", "s3:DeleteObjectVersion", "s3:PutBucketPolicy"],
  "Resource": "arn:aws:s3:::agency-security-logs/*",
  "Condition": { "ArnNotLike": { "aws:PrincipalArn": "arn:aws:iam::*:role/log-archive-admin" } }
}
```

Add S3 **Object Lock** (compliance mode) or versioning + MFA delete for stronger
tamper resistance. Delivery-team roles get `s3:GetObject` at most. Logs sent to GCC
Central Logs are tamper-resistant by construction.

Log-store encryption and residency (SSE-KMS, `ap-southeast-1`) are DP-2/DP-1 — apply
the data-protection skill to the bucket itself.

### Retention with lifecycle automation (LM-8)

Security logs (flow, cloud management, access, database, host) ≥ **lm-8_prm_1** days:

```hcl
resource "aws_s3_bucket_lifecycle_configuration" "security_logs" {
  bucket = aws_s3_bucket.security_logs.id
  rule {
    id     = "retain-security-logs"
    status = "Enabled"
    transition { days = 90  storage_class = "GLACIER" }
    expiration { days = 365 }   # = lm-8_prm_1; never below the SSP value
  }
}
```

Non-security logs (application/operations/performance): keep as long as needed for
incident resolution and debugging — they are not bound by lm-8_prm_1.

### Structured formats (LM-15)

- Security logs: **OCSF** or **ECS** schemas (Security Lake ingests OCSF natively).
- Operational logs: **OpenTelemetry** or structured JSON — one event per line, stable
  field names, ISO-8601 timestamps.

### Sanitisation before recording (LM-19)

1. Inventory sensitive fields that can reach logs: NRIC/FIN, names, addresses,
   credentials, API keys, bearer tokens, payment details.
2. Mask or tokenise at the logging layer, not after the fact:

```js
const NRIC = /\b[STFGM]\d{7}[A-Z]\b/g;
const redact = (s) => s
  .replace(NRIC, "[NRIC]")
  .replace(/Bearer\s+[\w.-]+/gi, "Bearer [REDACTED]")
  .replace(/("password"\s*:\s*)"[^"]*"/gi, '$1"[REDACTED]"');
```

3. Never log full request bodies or `Authorization`/`Cookie` headers by default; log
   allowlisted fields.
4. The same rule applies before logs are **shared with any third party**.

User-facing error responses (stack traces to browsers) are an AS finding — separate
from this control.

## Stage 3 — Centralise and detect (LM-12, LM-9, LM-20, LM-21, LM-14)

### Central security log management (LM-12 — Level 0)

- **On GCC:** CSP tenant security logs are already stored centrally and forwardable to
  **GCSOC** — contact GCSOC for subscription and additional services. Subscribe; don't
  rebuild.
- **Otherwise:** name the central service in lm-12_prm_1 (org-level Security Lake /
  SIEM), aggregate all five security log sources into it, and monitor there.

### Security monitoring and alerting (LM-9)

```hcl
resource "aws_guardduty_detector" "main" { enable = true }
```

Route findings to an alerting channel a human answers (EventBridge → SNS/on-call).
**Error trackers (Sentry) and uptime checks are not security monitoring** — they don't
detect breaches. Posture/misconfiguration scanning is ST-2 (security-testing skill).

### UEBA (LM-20)

Pick a UEBA capability integrated with the SIEM (e.g. Microsoft Sentinel UEBA, Splunk
UBA), with real-time alerts on anomalous user/entity activity; tune and update it on a
schedule.

### Detection updates (LM-21)

Malware/IOC detections updated at least every **lm-21_prm_1** days. Managed services
(GuardDuty) update continuously — record that as evidence. For EDR/AV you operate,
automate signature rollout and **monitor conformance** (a dashboard of agent versions /
signature ages, alert on stale hosts).

### Web defacement monitoring (LM-14)

For internet-facing pages: a visual-diff monitor on key public pages, alerting on
unexpected content changes, plus a documented recovery path (redeploy from
pipeline-built artifacts — tie-in with secure-pipeline).

## Stage 4 — Service health (LM-10, LM-11, LM-16, LM-17, LM-18)

- **LM-10:** CloudWatch alarms / Azure Monitor alerts on abnormal usage — CPU/network
  spikes, access at unexpected hours, cost anomalies (AWS Cost Anomaly Detection).
- **LM-11 / LM-16:** define SLIs (availability, p95 latency, error rate) with SLOs;
  dashboards + alerts on the **4 Golden Signals: latency, traffic, errors, saturation**.
  Route 53 health checks for availability from outside.
- **LM-17:** track the **DORA 4 Key metrics** — Deployment Frequency, Lead Time for
  Changes, Change Failure Rate, Time to Restore Service — from your pipeline data;
  review them to drive delivery improvement.
- **LM-18:** public-facing services register at https://wogaa.sg/ and implement per
  https://docs.wogaa.sg/ — see sg-service-shell for the tracking-code mechanics and the
  DSS PR-2 twin.

## Audit quick-greps

```bash
# Missing capture (LM-3..LM-6)
grep -rn "aws_flow_log\|aws_cloudtrail\|access_logs\|enabled_cloudwatch_logs_exports" *.tf

# Tamper risk (LM-2): who can write/delete the log store?
grep -rn "s3:Delete\|s3:Put\|logs:Delete" policies/ *.tf

# Retention (LM-8): lifecycle expiration vs lm-8_prm_1
grep -rn "expiration\|retention_in_days" *.tf

# Sensitive data in logs (LM-19)
grep -rnE "[STFGM][0-9]{7}[A-Z]|Bearer |password=" sample-logs/
```

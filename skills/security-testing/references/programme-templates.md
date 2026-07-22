# ST implementation templates

Concrete artifacts per control. Adapt names, addresses, and values to the project; every
`st-*_prm_*` reference must come from the System Security Plan, not from these examples.

## ST-3 — security.txt (RFC 9116)

Serve at exactly `https://<domain>/.well-known/security.txt`. `Contact` and `Expires` are
mandatory; keep `Expires` under a year out and renew it before it lapses (an expired file
reads as abandoned).

```
Contact: mailto:security@agency.gov.sg
Contact: https://www.tech.gov.sg/report_vulnerability
Expires: 2027-07-01T00:00:00.000Z
Preferred-Languages: en
Canonical: https://service.agency.gov.sg/.well-known/security.txt
```

Serving it — Express:

```js
app.get("/.well-known/security.txt", (req, res) =>
  res.type("text/plain").sendFile(path.join(__dirname, "security.txt")));
```

nginx:

```nginx
location = /.well-known/security.txt {
    alias /var/www/security.txt;
    default_type text/plain;
}
```

The alternative channel shape the catalog accepts: a vulnerability reporting link on all
pages (footer). Many SG government services point it at the whole-of-government reporting
channel, `https://www.tech.gov.sg/report_vulnerability`. Either way, put a calendar
reminder on the `Expires` date — a stale file is the most common ST-3 audit finding.

## ST-1 — host vulnerability assessment scans

Cloud (AWS) — enable Amazon Inspector for continuous, authenticated (agent-based via SSM)
scanning of EC2, ECR, and Lambda:

```hcl
resource "aws_inspector2_enabler" "hosts" {
  account_ids    = [data.aws_caller_identity.current.account_id]
  resource_types = ["EC2", "ECR", "LAMBDA"]
}
```

Azure: enable Microsoft Defender for Cloud (Defender for Servers) on the subscription.
On-premises: subscribe to a Vulnerability Management System (VMS) and schedule
authenticated scans. SaaS you can't scan: request the provider's latest vulnerability
scanning report and file it as evidence.

Record in the runbook: scan type (must match st-1_prm_1), cadence (≤ st-1_prm_2 days),
host inventory in scope, and where reports land. Continuous scanners satisfy any cadence;
for scheduled scanners, the schedule itself is the evidence.

## ST-2 — cloud security posture management

AWS:

```hcl
resource "aws_securityhub_account" "cspm" {}

resource "aws_securityhub_standards_subscription" "afsbp" {
  standards_arn = "arn:aws:securityhub:ap-southeast-1::standards/aws-foundational-security-best-practices/v/1.0.0"
  depends_on    = [aws_securityhub_account.cspm]
}
```

Azure: Defender for Cloud with the Cloud Security Posture Management plan. GCP: Security
Command Center. Route findings to the same register as everything else (e.g. Security Hub
→ EventBridge → ticketing) so they run on the ST-5 SLA clocks.

## ST-4 — security testing programme plan

A documented plan, per test cycle. One page is enough; undocumented testing fails the
control regardless of how good the testing was.

```markdown
# Security Test Plan — <system> — <year>

- Test type: <st-4_prm_1, e.g. grey-box penetration test / VAPT>
- Frequency: every <st-4_prm_2> days; last test <date>, this test <date>
- Tester: <named independent external party, or internal team independent
  of the system's developers>
- Scope: <URLs, APIs, network ranges, cloud account IDs>
- Rules of engagement: <window, allowed techniques, contacts, data-handling>
- Methodology: per WOG Security Testing Guidelines
- Deliverables: findings report with severity ratings -> ST-5 register
- Retest: remediated Critical/High findings verified by <date>
```

Timing rules that catch teams out:

- A **new internet-facing service is tested before launch** — the st-4_prm_2 clock is a
  ceiling between tests, not a grace period for the first one.
- Re-test after major changes (new auth flow, new public API), not only on the calendar.
- **Government Bug Bounty Programme** participation requires a passing **Agency Readiness
  Scorecard** rating first — GBBP complements the VAPT programme; it doesn't replace it.

## ST-5 — vulnerability register and risk acceptance

One register, all sources (ST-1 scans, ST-2 CSPM, ST-4 tests, ST-3 reports, CI scanners
from secure-pipeline). Minimum columns:

```csv
id,source,title,severity,cvss,kev,found_date,sla_due,status,owner,acceptance_ref
VULN-041,inspector,OpenSSH RCE CVE-XXXX-NNNN,Critical,9.8,yes,2026-07-01,2026-07-16,remediated,platform,
```

`sla_due = found_date + st-5_prm_n` for the finding's severity — SLA breaches should be
visible arithmetic. Triage order: known active exploitation (CISA KEV) first, regardless
of severity label; then severity; then exposure.

Risk-acceptance record — the only alternative to remediation, and only with the approving
authority:

```markdown
# Risk Acceptance — VULN-<id>

- Finding: <title, severity, source>
- Rationale: <why remediation is not proceeding now>
- Compensating controls: <what limits exploitability meanwhile>
- Approving authority: <name, appointment> — consent recorded <date>
- Review/expiry: <date — acceptance lapses and re-enters triage>
```

A sign-off by the dev lead or an undocumented "we know about it" does not satisfy ST-5;
the approving authority's documented consent, with an expiry, does.

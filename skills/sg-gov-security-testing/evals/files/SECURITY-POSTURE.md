# BizGrants Portal — security posture notes

Prepared by the platform team ahead of the audit, 2026-07-21.

## System

- Internet-facing grants application portal for business owners.
- Hosted on AWS (ap-southeast-1) under our GCC tenancy: ALB → ECS services → RDS,
  plus two EC2 instances running the reverse proxy and a legacy PDF renderer.
- Handles applicant financial statements — data classified up to CONFIDENTIAL /
  Sensitive Normal.

## SSP excerpt (security testing section)

Our System Security Plan sets these values:

| Parameter | Value |
|---|---|
| Vulnerability assessment scan type (st-1_prm_1) | TBD — not yet defined |
| Vulnerability assessment cadence (st-1_prm_2) | 14 days |
| Public reporting channel (st-3_prm_1) | security.txt |
| Security testing type (st-4_prm_1) | Independent penetration test (VAPT) |
| Security testing frequency (st-4_prm_2) | 365 days |
| Remediation SLA — Critical (st-5_prm_1) | 15 days |
| Remediation SLA — High (st-5_prm_2) | 30 days |
| Remediation SLA — Medium (st-5_prm_3) | 60 days |
| Remediation SLA — Low (st-5_prm_4) | 90 days |

## Current practices

**Vulnerability scanning.** We have continuous vulnerability scanning covered: Dependabot
alerts and CodeQL are enabled on all our GitHub repos, so every dependency and code change
is scanned automatically. Separately, an infrastructure engineer ran a Nessus network scan
(unauthenticated) against the public endpoints on 2025-12-30 before the last release; it
came back mostly clean. Nothing is installed on the EC2 hosts themselves — we didn't want
agents adding load.

**Cloud configuration.** We review our AWS configuration manually as part of the annual
architecture review. We looked at AWS Security Hub once but haven't enabled it — the
console noise seemed high and nobody owns it.

**Vulnerability disclosure.** We publish a security.txt at
`https://portal.example.gov.sg/security.txt` (file included in this pack). There's no
security or vulnerability-reporting link in the site footer — the design system team felt
it cluttered the layout.

**Penetration testing.** The portal was pen-tested in August 2023, before the original
launch. Two of our own backend developers spent a weekend attacking the staging
environment with Burp Suite. They fixed what they found as they went; there wasn't a
formal report, scope document, or retest — it was more of a hackathon. Nothing since: the
system hasn't changed enough to justify the spend, in our view.

**Vulnerability handling.** Findings land in the register (CSV included). We fix things
as sprint capacity allows. For VULN-007 (the High on the PDF renderer), the dev lead
posted in Slack that we can live with it since the renderer is behind the ALB, so it's
marked accepted. VULN-012 has a CVE that's apparently being exploited in the wild
according to the CISA list, but it's only a Medium so it's queued for next quarter's
maintenance window.

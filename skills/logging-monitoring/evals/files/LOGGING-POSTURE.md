# GrantHub — logging & monitoring posture

GrantHub is our internet-facing grant application portal for SMEs, run by the agency's
digital services team. It runs on AWS under the agency's GCC tenancy:
an ALB in front of the app tier on EC2, and a PostgreSQL RDS instance.
Data classification: up to RESTRICTED / Sensitive Normal.

## SSP excerpt (Logging & Monitoring parameters)

| Parameter | Value |
|---|---|
| lm-8_prm_1 (security log retention, days) | 365 |
| lm-12_prm_1 (central security log management and monitoring service) | GCSOC |
| lm-21_prm_1 (detection update frequency, days) | TBD |

## Current logging setup

- The application writes structured-ish text logs to `/var/log/granthub/app.log` on
  each EC2 instance. System logs are in the usual `/var/log` locations. That's where
  they live — disk on the instances is sized generously so we've never needed to move
  them anywhere.
- `logrotate` compresses daily and **deletes anything older than 30 days** to keep the
  disk healthy.
- We stood up an S3 bucket (`granthub-logs`) last year for an analytics experiment.
  The developer role has full read/write/delete on it so the team can clean up test
  data while debugging.
- Cloud-level audit logging: not something we've configured — our understanding is
  that this comes with AWS by default, so we haven't set anything up ourselves.
- Database: the RDS instance runs with the default parameter group. We haven't turned
  on any log exports; the DBA checks `pg_stat_activity` when something looks slow.
- The ALB's access logging is switched off — it was generating a lot of S3 objects
  during load testing so we disabled it and never re-enabled it.

## Monitoring

- **Sentry** is wired into the app and catches exceptions with stack traces. Between
  that and the ALB health checks, monitoring is covered — if something breaks, we get
  a Sentry email.
- We don't run GuardDuty or any SIEM. Nothing is forwarded to GCSOC — we assumed
  that's only for the big ministry systems.
- The EC2 instances have the agency-standard antivirus agent installed. Signature
  updates happen manually when someone remembers to run the updater, roughly monthly.
- No uptime SLOs are defined; we look at CloudWatch's default EC2 graphs when users
  report slowness.

## Notes for the auditors

- WOGAA is registered and the tracking snippet is live on the portal (done during the
  DSS review last quarter).
- We know the log bucket isn't encrypted yet — it's on the backlog.

# SchoolPlace operations notes — for the resilience review

Context for the reviewers, honest state of play.

## Availability history

- Last July, ap-southeast-1a had a ~40-minute AZ impairment on day 3 of the
  registration window. Both app servers and the database went dark together; the
  service was down for the duration plus recovery. We got a parliamentary question
  about it.
- During the same window the app servers hit sustained 100% CPU on results-release
  morning and requests timed out for about two hours. We have never run a load test —
  the July peak is our load test.

## Backups and recovery

- The only backup is the nightly `pg_dump` cron on app_1 (described in `infra.tf`).
  RDS automated backups are off (`backup_retention_period = 0`). If app_1 dies, the
  backup job dies with it — nobody gets alerted.
- We have **never attempted a restore** from the dumps. Nobody currently on the team
  knows the restore procedure; the engineer who wrote the cron left in 2025.
- Dumps live in the same account and region as production, expire after 14 days, have
  no object lock or immutability, and every developer role can delete or overwrite
  them.
- The app servers' EBS volumes, application config, and uploaded documents (local
  disk on app_1!) are not backed up at all.

## Plans and exercises

- There is no disaster recovery plan. RTO and RPO have never been defined — when we
  asked the business owner, the answer was "as fast as possible, lose nothing", which
  we know is not an engineering answer.
- There is no business continuity plan. During last July's outage, the call centre
  improvised; two officers gave parents contradictory instructions.
- No recovery test, tabletop, or continuity exercise has ever been run.

## Constraints

- The SSP for this system exists but the resiliency/backup parameter values (AZ
  count, backup frequency, retention days, test cadences) were left blank at
  tailoring. Finance will push back on anything that looks like idle capacity — the
  2024 cost review is why `multi_az` is off.

## Ask

Audit us against the ICT&SS resiliency and backup & recovery requirements: pass/fail
per requirement with evidence, the fix for each failure, and what you need from the
agency (parameter values, RTO/RPO) versus what engineering can just do.

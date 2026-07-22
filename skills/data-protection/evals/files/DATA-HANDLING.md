# CaseDesk — data handling notes

Prepared for the review, 2026-07-22.

## System

Internal case management system ("CaseDesk") used by ~180 public officers to process
assistance applications. Case files include scanned financial statements and medical
reports — classified up to **CONFIDENTIAL / Sensitive Normal**. Hosted on AWS
(ap-southeast-1) in the `casedesk-prod` account, which the team opened directly with AWS
in 2025 so we could move faster than the central GCC onboarding queue; we plan to migrate
into the agency organisation "eventually".

## Compliance position

As a government agency we are **excluded from the PDPA**, so the personal-data
obligations that apply to companies don't apply to us — which is why this review should
be lighter-touch on the data protection side. We focus our effort on availability.

## Architecture notes

- Officers use the web UI (HTTPS via the ALB). Between the app service and the OCR
  worker, and from both to Postgres, traffic is **plain HTTP / non-TLS** — the VPC is
  private with no internet gateway on those subnets, so encrypting internal hops adds
  latency for no real gain. We also set `rds.force_ssl = 0` after TLS handshakes slowed
  the nightly batch import.
- **Disaster recovery**: case documents replicate continuously to a bucket in
  `us-east-1`, and nightly backups are copied to a vault there too. We chose a far-away
  region deliberately — a regional disaster shouldn't take out our copies.
- Passwords for the legacy admin console are hashed with **MD5** (inherited from the old
  system; migration ticket open since 2024).

## Data loss prevention

Nothing specific in place. Officers are trusted users and the annual data-handling
e-learning covers what shouldn't be emailed out.

## Old hardware

When we refreshed the office in May 2026, the old **Synology NAS** that held case
exports for the branch was quick-formatted by the IT executive and **sold on Carousell**
along with the monitors. The drives worked fine, so destroying them seemed wasteful.

## User guidance

The case entry form (see `templates/case_form.html`) is where officers paste applicant
details and upload documents. We haven't put any classification guidance on the screens
or in the user guide — officers are expected to know their markings from the e-learning.

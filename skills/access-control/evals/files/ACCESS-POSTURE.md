# ReliefPortal — identity & access setup (current state)

Internal doc, last updated July 2026. ReliefPortal lets citizens apply for financial
assistance online; case officers assess and approve applications in an internal admin
console. Runs on AWS under our GCC tenancy. Data classification: **CONFIDENTIAL /
Sensitive High** (household income, bank details, case notes). Launched May 2025.

## SSP excerpt (access control parameters)

| Parameter | Value |
|---|---|
| ac-3_prm_1 (days after account expiry) | 1 |
| ac-3_prm_2 (days of inactivity) | 90 |
| ac-3_prm_3 (account types) | all user and privileged accounts |
| ac-4_prm_1 (access review frequency) | quarterly |
| ac-4_prm_2 (days to remove access) | 7 |
| ac-13_prm_1 (credential rotation days) | TBD |

## How people sign in

**Citizens** register with email + password on the portal. We built the registration
and login flow ourselves — verification email, password reset, the usual. Singpass
integration is on the roadmap for v2, but the bespoke login has worked fine so far and
avoided the integration effort at launch.

**Case officers** log into the internal admin console with their own usernames and
passwords, stored in our `officers` table (passwords hashed with SHA-1; we didn't get
around to adding salts, but the console is only reachable from the office network).
There was talk of connecting it to WOG AAD but the local accounts were faster to ship.

**AWS console**: each developer has an IAM user. MFA is optional in our setup and in
practice nobody has enabled it — including the two admins — because the virtual MFA
enrolment was fiddly on personal phones.

## Permissions

The team is small (5 devs, 8 case officers), so everyone on the dev side gets the
`reliefportal-developers` role, which has admin-level access — it keeps velocity up
and we know who has access, so we've never needed a formal inventory of accounts and
access rights.

## Account management

We create accounts by hand when someone joins. Nobody has ever run an access review —
we haven't had turnover, mostly. One exception: Tan W.L. from our vendor
(tan.wl@vendor.example) finished the contract in **February 2026**; the account is
still enabled because we might re-engage the vendor next year.

The full account export is in `accounts.csv`.

## Credentials & tooling

- CI deploys through the `ci-deployer` IAM user; its access key was created in
  **January 2024** when we set up the pipeline and has worked without issues since.
- Our internal Grafana (metrics dashboards) is still on `admin`/`admin` — it's on the
  private subnet, and we'll change it after the current feature push.

## Devices

Developers work from their **personal MacBooks** and administer production over the
VPN. No MDM or device checks — the team prefers their own machines and it saved us a
procurement cycle.

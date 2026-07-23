# AC implementation recipes

Concrete configuration per control. AWS-first (most GCC workloads), with the Azure/GCP
equivalent named where it differs. Substitute your SSP's parameter values — never invent
them.

## AC-14 / AC-1 — Account inventory, then deny-by-default

Least privilege is granted *"based on the account inventory implemented"* — build the
inventory first, then scope permissions to it.

Minimum viable inventory (version-controlled or exported from the IdP):

```csv
account,type,owner,role,access_rights,last_review,expiry
svc-granthub-app,service,team-granthub,app-runtime,"s3:granthub-uploads rw, rds:granthub ro",2026-07-01,n/a
jlim@agency.gov.sg,user,J Lim,developer,"console ro, s3:granthub-uploads ro",2026-07-01,2027-03-31
```

Tooling: AWS IAM Access Advisor / Azure AD Access Review surface what each principal
*actually* used — feed that back into permission scoping.

Deny-by-default in IAM — grant specific actions on specific resources; never ship:

```json
{"Effect": "Allow", "Action": "*", "Resource": "*"}
```

Scoped example:

```hcl
data "aws_iam_policy_document" "app_runtime" {
  statement {
    actions   = ["s3:GetObject", "s3:PutObject"]
    resources = ["${aws_s3_bucket.uploads.arn}/*"]
  }
  statement {
    actions   = ["rds-db:connect"]
    resources = [aws_db_instance.main.arn]
  }
}
```

Consider attribute-/feature-based access control (ABAC via IAM tags, Azure AD dynamic
groups) where role explosion makes RBAC unwieldy.

## AC-2 — MFA for privileged accounts

Factors must be different and independent of the accessing device. Enforce at the IdP
(Conditional Access / IAM Identity Center MFA policy), and as an IAM guardrail:

```json
{
  "Effect": "Deny",
  "Action": "*",
  "Resource": "*",
  "Condition": {"BoolIfExists": {"aws:MultiFactorAuthPresent": "false"}}
}
```

For privileged *actions* (not just login), add step-up MFA via PIM tools (Entra PIM
role activation, AWS IAM Identity Center permission-set session policies). The risk
statement asks for phishing-resistant MFA for remote access — prefer FIDO2/passkeys or
platform authenticators over SMS/TOTP for admin accounts.

## AC-3 — Inactive and expired accounts

Disable/remove [ac-3_prm_3] accounts within **ac-3_prm_1 days of last authorised use**
or after **ac-3_prm_2 days of inactivity**. Automate the detection:

- AWS Config managed rule `iam-user-unused-credentials-check` with
  `maxCredentialUsageAge` = ac-3_prm_2.
- Entra ID: `signInActivity` reports + lifecycle workflows.
- SCIM deprovisioning from the HR/IdP source of truth so contract end-dates actually
  disable accounts (see AC-8).

Contractor and vendor accounts need an explicit expiry date at creation — "we'll
remember to remove it" is the finding.

## AC-4 — Access review

Frequency **ac-4_prm_1**; removals within **ac-4_prm_2 days** of the review. For
application accounts, automate the review workflow or report; for CSP accounts/roles,
use IAM Access Advisor / Azure AD Access Review. Keep evidence: review date, reviewer,
accounts changed, removal timestamps — an auditor accepts artifacts, not intentions.

## AC-5 / AC-9 / AC-10 / AC-11 — Endpoint posture

- **AC-5**: remote developer/maintainer/admin access only from hardened devices.
  Enforce with endpoint management posture checks that *deny access* on failure —
  a hardening guide nobody verifies is not a control.
- **AC-9**: MDM (Intune, Jamf, Kandji) enforcing disk encryption, configuration,
  updates, remote wipe.
- **AC-10**: replace flat VPN reachability with identity- and device-aware access —
  SSE, Identity-Aware Proxy, Entra ID Conditional Access, Okta Device Trust. Access
  decisions consider user identity *and* device posture per request.
- **AC-11**: one designated primary [ac-11_prm_1] per endpoint, enforced via device
  enrolment + user authentication; secondary local support accounts secured with
  endpoint privilege management.

GCC access is commonly via SEED-compliant (Security Suite for Engineering Endpoint
Devices) laptops — device posture is checked before access, which is AC-5/AC-10 in
practice; check your agency's issued-device policy before inventing your own.

## AC-6 — Default credentials

Change default credentials **before first use**, not after go-live. Sweep for them
pre-deploy: admin consoles (Grafana `admin/admin`, database `postgres/postgres`,
router/appliance logins), COTS installs, sample accounts shipped with software.
Configure end-user systems to force password change on first login after account
creation or reset.

## AC-7 / AC-12 — Who authenticates where

The catalog splits identity by audience:

- **Public users (citizens/businesses), high identity assurance**: **Singpass /
  Corppass MFA** — do not build your own citizen login for high-impact or high-risk
  transactions. Integration docs: https://api.singpass.gov.sg/.
- **Agency/internal users**: Government-managed SSO (such as **WOG AAD**) — AC-12
  requires SSO for internal services, with **MFA configured at the IdP** and access
  granted only after IdP authentication. Internal apps federate (SAML/OIDC) rather than
  keeping local password tables.

A citizen-facing service running its own username/password store for sensitive
transactions fails AC-7; an internal tool with its own login form instead of WOG
AAD/agency SSO fails AC-12.

## AC-8 / AC-15 — Automated lifecycle + validation

Automate **ac-8_prm_1** processes for **ac-8_prm_3** accounts with the tool named in
ac-8_prm_2 — SSO with just-in-time provisioning, or SCIM between IdP and applications,
so joiner/mover/leaver events propagate without a human remembering.

AC-15 validation test cases (verbatim targets from the catalog): provisioning occurs
solely through the account management tool (not directly on the SaaS); accounts
deactivate on the final day of authorised use; provisioning validates access boundaries
first; access rights match the assigned role.

## AC-13 — Static credential rotation

Rotate API keys, access keys, personal access tokens every **ac-13_prm_1 days** — or
eliminate them: prefer time-restricted credentials (AWS STS, IAM Identity Center, OIDC
federation for CI) over long-lived IAM user access keys. Automate rotation where static
credentials must exist (Secrets Manager rotation lambdas). Quick audit:

```bash
aws iam list-users --query 'Users[].UserName' --output text | tr '\t' '\n' | while read u; do
  aws iam list-access-keys --user-name "$u" \
    --query 'AccessKeyMetadata[].[UserName,AccessKeyId,CreateDate]' --output text
done
```

Any key older than ac-13_prm_1 days is a finding; CI systems authenticating with a
3-year-old access key are the classic case.

## AC-16 — Separation of duties (High-Risk CII)

RBAC + PIM + JIT so no single individual controls a key process end-to-end (e.g. the
person who writes code is not the one who approves and deploys it to production with no
second pair of eyes). Where perfect separation is not feasible, compensate with audit
logging, alerting, and rate limits (the logging machinery is LM). Cloud tooling: Entra
PIM, AWS Organizations SCPs.

## Audit quick-greps

```bash
# Wildcard IAM grants
grep -rn '"Action": "\*"\|Action.*=.*"\*"\|actions.*\[.*"\*"' infra/ *.tf *.json
# IAM users with console access but no MFA
aws iam get-credential-report  # then check mfa_active column
# Default-credential smells in config
grep -rni 'admin.*admin\|changeme\|password.*=.*password\|default_password' .
# Long-lived access keys
aws iam list-access-keys --user-name <user>   # CreateDate vs ac-13_prm_1
# Local user tables in internal apps (AC-12 smell)
grep -rn 'users.*password\|password_hash' app/models/
```

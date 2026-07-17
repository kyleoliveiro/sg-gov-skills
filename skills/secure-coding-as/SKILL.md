---
name: secure-coding-as
description: >-
  Write and review application code that satisfies the Singapore Government
  ICT&SS Policy Reform Application Security (AS) controls and allied
  Cryptography/Key Management (CK) controls. Use whenever writing new code,
  reviewing a diff, or auditing an existing codebase for a Singapore government
  agency project — especially anything touching input handling, database
  queries, authentication, passwords, sessions, secrets, crypto, HTTP security
  headers, file uploads, or error handling. Triggers: "IM8 compliant code",
  "ICT&SS controls", "application security controls", "AS family", "AS-1"
  through "AS-15", security review of an agency system, implementing
  auth/passwords/sessions/uploads/error handling in a gov service, SSP
  application security evidence.
---

# Secure coding for SG Government: AS + CK controls

The ICT&SS Policy Reform (IM8's successor) Cybersecurity Control Catalog contains 15
Application Security (AS) controls and 4 Cryptography/Key Management (CK) controls that
land directly in application code. This skill maps them to coding decisions so an agent
writing or reviewing code produces compliant output the first time, with control IDs the
agency's security team can trace to its System Security Plan (SSP).

Use this skill in three modes:

1. **Writing new code** — apply the scenario sections below as you write.
2. **Reviewing a diff** — run the review checklist against every changed file; flag
   violations with the control ID.
3. **Auditing a codebase** — sweep for each checklist row; report findings per control ID
   with file:line references.

## Source and currency

Control text in this skill and in [references/as-controls.md](references/as-controls.md)
is embedded from **info.standards.tech.gov.sg as of 2026-07-16**. The standards iterate
actively. For compliance-critical decisions (SSP evidence, audit responses, deviations),
verify against the live pages:

- AS family: https://info.standards.tech.gov.sg/control-catalog/cybersecurity/as/
- CK family: https://info.standards.tech.gov.sg/control-catalog/cybersecurity/ck/
- SSP profiles (control levels): https://info.standards.tech.gov.sg/ssp/

Machine-readable OSCAL: https://github.com/GovtechSG/tech-standards — useful for tooling
but **lags the site**; the site is authoritative.

## Before you start: levels and parameters

- **Levels come from the project's SSP, not the catalog.** Level 0 = mandatory, no
  deviation. Level 1 = default; deviations need documented IDSC/CIO/CISO approval.
  Level 2 = risk-based best practice. In the Medium-Risk Cloud SSP, **AS-1, AS-3, AS-7
  and AS-8 are Level 0** (promoted from Level 1 in low-risk); AS-10, AS-12, AS-13, AS-14
  sit at Level 2 in both cloud SSPs; CK-1/CK-2 are Level 1 in medium-risk. Use the
  sibling skill **ssp-navigator** to determine the applicable SSP and each control's
  level for this system — treat every control below as required unless the SSP says
  otherwise.
- **Parameters are agency-defined.** `as-5_prm_1/2/3` (password length, policy, type),
  `as-11_prm_1/2` (session hours, session type), `ck-2_prm_1` (key rotation days) have
  **no catalog values**. Never invent them. Ask the user for the project's SSP parameter
  values, or locate them in the repo (SSP document, security config, compliance docs).
  If unavailable, implement against a named configuration constant, flag it as
  `TODO(SSP): confirm as-5_prm_1`, and say so in your report.

Full statement/recommendation/risk text for every control:
[references/as-controls.md](references/as-controls.md). The sections below are the
working summary.

## Handling input and output

**AS-1 — Input Validation.** Validate all application inputs against expected type,
structure, or format. Why: unvalidated input invites injection, data manipulation, and
crashes that can lead to unauthorised access or service disruption.

- Validate at the trust boundary with a schema library (Zod/Joi in Node, Pydantic in
  Python, Bean Validation in Java), not ad-hoc `if` checks scattered through handlers.
- Cover every input channel: body, query string, path params, headers, cookies, file
  metadata, webhook payloads, message-queue consumers.
- Allowlist (expected shape) over denylist (known-bad patterns). Reject, don't repair.
- Level 0 in medium-risk cloud — never skip, never partially apply.

**AS-2 — Parameterised Interfaces.** Use parameterised interfaces for database queries
and system commands. Why: string-built queries are the direct path to SQL/command
injection and system compromise.

- Prepared statements, query builders, or ORMs only. Any string concatenation or
  template interpolation into SQL, shell commands, LDAP filters, or NoSQL queries is a
  finding — including "safe-looking" cases like dynamic column names (allowlist those).
- For OS commands, use exec-style APIs with argument arrays (`execFile`, `subprocess.run`
  with a list, `ProcessBuilder`), never `shell=True` / backtick interpolation.

**AS-3 — Output Sanitisation.** Sanitise all application outputs used to render an HTML
document. Why: unsanitised output is XSS — malicious code executing in users' browsers.

- Rely on auto-escaping template engines/frameworks (React JSX, Jinja2 autoescape,
  Thymeleaf). Treat every escape hatch — `dangerouslySetInnerHTML`, `| safe`,
  `v-html`, `innerHTML` — as a finding unless the value passes an HTML sanitiser
  (e.g. DOMPurify) with a tight allowlist.
- Applies to API responses that clients render into HTML, error pages, and emails too.
- Level 0 in medium-risk cloud. Pairs with the AS-9 CSP header as defence in depth.

## Authentication, passwords, and sessions

**AS-4 — Authentication Mechanism Rate-Limiting.** Rate-limit all authentication
mechanisms. Why: without it, weak credentials fall to brute force.

- Site recommendation: max 3 consecutive failed attempts within 15 minutes (or other
  reasonable limit); add time delays between attempts; consider CAPTCHA/bot mitigation.
- "All mechanisms" means login, registration, password reset, OTP/MFA verification, API
  token endpoints — not just the main login form. Registration is the one teams forget:
  an unthrottled signup endpoint enables mass account creation and email/SMS flooding,
  and it exercises the same password and notification paths as the rest of auth. Key
  limits on account and source IP.

**AS-5 — Password Requirements.** Where SSO or passwordless is not supported, enforce
the SSP-defined minimum length (`as-5_prm_1`), policy (`as-5_prm_2`), and password type
(`as-5_prm_3`). Why: short or common passwords are the cheapest account takeover.

- Prefer SSO (for agency staff, typically the WOG identity provider; for public users,
  Singpass/Corppass — see AC-7) or passwordless before building password auth at all.
- Per NIST SP 800-63B (which the control cites): length is the primary strength factor;
  composition rules add little. Implement a length minimum plus breached/common-password
  screening rather than character-class rules, unless `as-5_prm_2` says otherwise.
- **Do not invent parameter values** — get them from the SSP (see "Before you start").

**AS-6 — Password Salting and Hashing.** Store passwords as salted hashes using an
offline-attack-resistant scheme per NIST SP 800-63B; salts must be (a) generated by a
cryptographically secure PRNG, (b) at least 32 bits, (c) unique per account. Why: on
breach, unsalted or weakly hashed passwords are trivially extracted.

- Use Argon2, scrypt, bcrypt, or PBKDF2 via a maintained library. These generate
  compliant per-account salts internally — do not hand-roll salting, and never use
  general-purpose hashes (MD5/SHA-x) for passwords.
- CSPRNG examples from the control itself: `crypto.randomBytes` not `Math.random`
  (Node.js); `java.security.SecureRandom.nextBytes` not `java.util.Random` (Java).
  Python: `secrets`, not `random`.

**AS-7 — Access Control Check Enforcement.** Perform access control checks on **all**
authenticated requests. Why: authenticated-but-unauthorised access is how data breaches
and IDOR happen.

- Enforce via middleware/filters/route guards so checks are structural, not per-handler
  discipline: deny by default, every route declares its authorisation requirement.
- Check object-level ownership on every request (`WHERE owner_id = :current_user`), not
  just role at login. Re-check on state-changing requests; never trust hidden fields or
  client-supplied IDs as authorisation.
- Level 0 in medium-risk cloud. In review, any new authenticated route without an
  explicit authorisation check is a finding.

**AS-11 — Session Management.** Require the SSP-defined session type (`as-11_prm_2`) to
re-authenticate after the session exceeds `as-11_prm_1` hour(s), or terminate the
session. Why: stale sessions let whoever holds them act as the user indefinitely.

- Enforce absolute session lifetime server-side (issue time + max age), not only idle
  timeout, and not only cookie expiry — the server must reject expired sessions.
- NIST SP 800-63B reference points from the control: AAL1 re-auth every 30 days; AAL2
  12 h or 30 min inactivity; AAL3 12 h or 15 min inactivity. Also consider forcing
  re-authentication on role/credential changes and before privileged functions.
- For JWTs: short-lived access tokens plus revocable refresh tokens whose absolute
  lifetime respects `as-11_prm_1`. Get the parameter from the SSP.

**AS-15 — Password Change.** Force a password change on suspected account compromise.
Why: without it, an attacker with a stolen credential keeps access indefinitely.

- Build the mechanism: a `must_change_password` / credential-invalidation flag that
  blocks all authenticated activity except the change flow, plus session revocation.
- Wire detection signals to it: unusual login activity, repeated failures (from AS-4),
  breach-list hits. Notify the user promptly; consider MFA as a compensating layer.

## Secrets and cryptography

**AS-8 — Secrets Management.** Store secrets in a proper secrets management solution
with access control, encryption, and monitoring. Why: hard-coded or plaintext secrets in
code or config are standing credentials for anyone who reads the repo.

- Secrets = API keys, access keys, DB credentials, signing keys, any static credential.
  Never unencrypted in source code, config files, or committed `.env` files.
- Use cloud-native (AWS Secrets Manager, Azure Key Vault) or cloud-agnostic (HashiCorp
  Vault, CyberArk Conjur) stores; inject at runtime. On platforms, use the platform's
  secret facility — e.g. GitHub Actions **secrets**, not variables.
- Level 0 in medium-risk cloud. Push protection and secret scanning in the pipeline are
  SD-1/SD-6 — see the **secure-pipeline** skill; this control is about where the app
  gets secrets at runtime.

**AS-14 — Secure Cryptographic Libraries.** Use reputable, secure cryptographic
libraries and functions for all cryptographic operations. Why: home-grown or obsolete
crypto quietly fails, exposing data.

- Never implement primitives yourself. Use the platform's vetted library (OpenSSL,
  `libsodium`, language-standard crypto modules); prefer FIPS 140-2/140-3 validated
  modules where assurance matters. Keep libraries updated.
- Follow the OWASP Cryptographic Storage Cheat Sheet for algorithm/mode choices; flag
  legacy algorithms (MD5, SHA-1 for signatures, DES/3DES, ECB mode) in review.

**CK-1 — Cryptographic Key Establishment.** Use industry-standard key establishment and
key derivation (NIST SP 800-56A/B/C). Why: weak establishment = weak or broken
encryption. In code: use your KMS or library's standard ECDH/RSA-KEM + HKDF flows;
never derive keys from passwords without a proper KDF.

**CK-2 — Cryptographic Key Rotation.** Rotate keys every `ck-2_prm_1` days (SSP-defined
— do not invent). Why: long-lived keys raise breakage risk. Enable automatic rotation in
KMS (AWS KMS, Azure Key Vault) and design code to be key-version-aware (encrypt with
current, decrypt with any active version).

**CK-3 — Cryptographic Key Management.** Manage keys across their full lifecycle
(generation → storage → distribution → use → rotation → backup → revocation →
destruction) per NIST SP 800-57 / ISO/IEC 27017. Why: poorly managed keys mean
unauthorised access and compromised crypto. Mostly process, but code must not undermine
it: no keys in code, logs, or error messages; support revocation without redeploy.

**CK-4 — Cryptographic Key Storage.** Store keys securely with least-privilege access
control. Why: readable keys = readable data. Keep keys in KMS/HSM-backed storage; scope
IAM so the app can *use* keys (encrypt/decrypt/sign) but not export them.

## HTTP security headers

**AS-9 — Content Security Policy.** Set minimally permissive CSP response headers. Why:
CSP is the browser-side backstop against XSS when AS-3 sanitisation slips.

- Set explicit fetch directives — `default-src`, `script-src`, `style-src`,
  `connect-src`, `img-src`, `media-src`, `object-src` — starting from
  `default-src 'self'; object-src 'none'` and loosening only with justification.
- "Minimally permissive" rules out `script-src 'unsafe-inline'`/`'unsafe-eval'` and
  bare wildcards; use nonces or hashes for inline scripts. Reference: OWASP Secure
  Headers Project Best Practices.

**AS-10 — HSTS.** Set `Strict-Transport-Security` with `max-age` ≥ 31536000 (1 year).
Why: shorter or missing HSTS leaves users open to protocol downgrade attacks.

- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (add `preload` when
  the domain is ready). The ≥ 31536000 floor is in the control statement itself — flag
  any lower value in review.
- Set both headers at one layer (framework middleware such as helmet, or the CDN/reverse
  proxy) and verify they actually reach the client on every response, including errors.

## File uploads

**AS-12 — Malware Scanning of Uploaded Files.** Scan uploads for malware **before** the
system processes them further. Why: unscanned files infect downstream consumers.

- Pattern from the control: upload to temporary/quarantine storage → scan on ephemeral
  compute (e.g. serverless + ClamAV or a cloud malware-scanning service) → move clean
  files to processing storage, unsafe files to quarantine. Nothing reads the file before
  the verdict.
- In review: any handler that parses, thumbnails, virus-scans-later, or serves an upload
  before scanning is a finding. Combine with AS-1 validation of file type/size/name.

## Error handling

**AS-13 — Exposure of Internal System Details.** Never disclose internal system details
to public users. Why: stack traces, debug info, and version strings hand attackers a map
of what to exploit.

- Production error responses: generic message + correlation ID; full detail goes to
  server-side logs only (and sanitise logs of classified/sensitive data — LM-19).
- Disable framework debug modes in production (`DEBUG=False`, no dev error pages);
  strip `Server`/`X-Powered-By` headers; keep API error bodies free of SQL fragments,
  file paths, and dependency versions.
- Errors must stay useful: contextually appropriate messages that help the user act
  without revealing internals.

## Review checklist

For diff review, check each row against every changed file; for audits, sweep the
codebase per row. Cite findings as `[AS-n]`/`[CK-n]` with file:line.

| ID | Check | Look for |
|---|---|---|
| AS-1 | All inputs schema-validated at trust boundary | new/changed endpoints, parsers, queue consumers without validation |
| AS-2 | Queries/commands parameterised | string-built SQL/shell/NoSQL, `shell=True`, template interpolation into queries |
| AS-3 | HTML-bound output escaped/sanitised | `dangerouslySetInnerHTML`, `innerHTML`, `\| safe`, disabled autoescape |
| AS-4 | Auth endpoints rate-limited | signup/login/reset/OTP/token routes without limiter or lockout/delay |
| AS-5 | Password rules = SSP params (`as-5_prm_1/2/3`) | hard-coded lengths that don't match SSP; missing common-password screen |
| AS-6 | Salted hash, memory-hard KDF, CSPRNG, ≥32-bit unique salt | MD5/SHA-x passwords, `Math.random`/`java.util.Random`, shared or absent salt |
| AS-7 | AuthZ check on every authenticated request | new routes outside guard middleware; missing object-ownership checks (IDOR) |
| AS-8 | Secrets from a secrets manager, never in code/config | hard-coded keys, committed `.env`, plaintext config credentials, CI variables holding secrets |
| AS-9 | CSP present and minimally permissive | missing CSP; `unsafe-inline`/`unsafe-eval`/`*` in `script-src` |
| AS-10 | HSTS `max-age` ≥ 31536000 | missing header; `max-age` below one year |
| AS-11 | Server-side absolute session timeout = `as-11_prm_1` h | cookie-only expiry, non-expiring JWTs, no re-auth on privilege change |
| AS-12 | Uploads malware-scanned before any processing | handlers touching file content pre-scan; no quarantine path |
| AS-13 | No internal details in public errors | stack traces/debug pages in prod, verbose API errors, version headers |
| AS-14 | Reputable crypto libraries only | hand-rolled crypto, MD5/SHA-1/DES/ECB, abandoned crypto deps |
| AS-15 | Forced password change on suspected compromise | no invalidation flag/flow, sessions survive compromise response |
| CK-1 | Standard key establishment/derivation (SP 800-56) | ad-hoc key exchange, password-derived keys without KDF |
| CK-2 | Keys rotate every `ck-2_prm_1` days | static keys, rotation disabled in KMS, key-version-blind code |
| CK-3 | Keys managed across lifecycle, revocable | keys in code/logs, revocation requires redeploy |
| CK-4 | Keys in KMS/HSM with least-privilege access | exportable keys, broad IAM on key use, keys on disk |

## Related skills and adjacent controls

- **ssp-navigator** — determine which SSP applies and each control's level (0/1/2) for
  this system; run it before asserting anything is optional.
- **secure-pipeline** — SD (secure development) and SC (supply chain) controls: SAST,
  dependency scanning, secret push protection, signing. AS-8 hands off to SD-1/SD-6/SD-7
  there.
- **dss-accessibility** — Digital Service Standards (WCAG 2.2) controls for the same
  services.
- **sg-service-shell** — SG-specific service scaffolding (official banner, footer,
  WOGAA) that pairs with these headers and error pages.
- Adjacent catalog controls to keep in mind while coding: AC-7 (Singpass/Corppass MFA
  for public services needing high identity assurance), LM-19 (sanitise logs of
  classified/sensitive data — pairs with AS-13), ST-5 (severity-based vulnerability
  remediation timeframes for the findings you raise).

---
name: network-security
description: >-
  Design or audit a system's network boundaries against the Singapore Government's
  ICT&SS Policy Reform (IM8 successor) Network Security controls (NS-1..NS-11):
  VPC/VNet segmentation and tiered subnets, access restrictions on CSP resources
  outside the virtual network, deny-by-default security groups and egress
  allowlisting, private inter-network connectivity (PrivateLink, peering, Transit
  Gateway), WAF/DDoS/CDN filtering, valid auto-renewed TLS certificates,
  authenticated and encrypted service-to-service traffic (mTLS, service mesh),
  secure cloud-to-on-premises connectivity, IPS/IDS, hardened remote admin access,
  and firewall-change alerting. Triggers: "network segmentation", security group
  rules, 0.0.0.0/0 ingress, deny by default, egress allowlist, VPC endpoints, WAF in
  front of an agency service, certificate expiry, mTLS between microservices,
  site-to-site VPN / Direct Connect, IDS/IPS, bastion or VPN access to private
  networks, firewall rule change alerts, IM8 network requirements, GCC network
  architecture.
---

# network-security: NS controls for SG government systems

You are designing or auditing the **network boundaries** of a Singapore government
system against the ICT&SS Policy Reform **Network Security family (NS-1..NS-11)**. The
family's scope is *securing the network boundaries of a system* — how the network is
segmented, what may talk to what, how the edge is filtered, how services and sites
connect privately, and how changes and intrusions are detected. Almost all of it is
cloud/IaC configuration — security groups, endpoints, certificates, alert rules — cheap
to get right on day one and exactly what a VAPT or CSPM scan walks through first.

Two facts anchor the family:

1. **Deny by default is the posture, not a control.** NS-3 states it, but NS-1
   segmentation, NS-2 resource policies, NS-9 private connectivity, and CS-9's private
   cluster API are all the same idea applied at different interfaces. An audit that
   finds one `0.0.0.0/0` rule should immediately ask where else the default was left
   open — including **egress**, which teams forget.
2. **The internet is never the transport between trusted parts.** Private-to-private
   (NS-4), service-to-service (NS-7), and cloud-to-on-prem (NS-8) traffic all must move
   over private, authenticated, encrypted paths. "It's HTTPS anyway" does not satisfy
   the private-routing half.

## Source and currency

Control text in this skill and `references/ns-controls.md` is embedded from
**info.standards.tech.gov.sg as of 2026-07-23** (NS family page last updated 5 March
2026). The standards iterate actively. For any compliance-critical decision, verify
against the live page:

- NS: https://info.standards.tech.gov.sg/control-catalog/cybersecurity/ns/

## Reference files

- `references/ns-controls.md` — full text of NS-1..NS-11 (statement, recommendations,
  risk statement) plus cross-family notes. Read it when you need exact wording for an
  audit response or SSP documentation.
- `references/implementation-recipes.md` — concrete config per control: subnet tiering,
  resource policies, deny-by-default rules, PrivateLink/peering/TGW choices, WAF/CDN
  setup, certificate automation, mTLS options, hybrid connectivity, IPS/IDS, remote
  access hardening, and firewall-change alert wiring, with AWS/Azure/GCP specifics.
  Read it when actually building or fixing.

## Before you start: the SSP, and no parameters to invent

No NS control carries an agency-defined parameter — but the project's **System Security
Plan (SSP)** still determines which level each NS control sits at for this system. If
no SSP exists yet, flag that first; the sibling skill **ssp-navigator** determines
which SSP applies. Get the network diagram (or derive one from the IaC) before
auditing: NS findings are topology findings, and a control can only be judged against
where the component actually sits.

## Procedure

Work outside-in — **segment → connect privately → protect the edge → secure the hops →
detect**. For **setup**, produce each configuration. For **audit**, verify each and
record pass / fail / not-applicable-per-SSP with evidence (the SG rule, the route
table, the endpoint config, the certificate chain, the alert rule). Recipes for every
step are in `references/implementation-recipes.md`.

### Stage 1 — Segment and deny (NS-1, NS-2, NS-3)

**1a. Tiered segmentation (NS-1).** Public tier (LB, NAT, WAF-fronted ingress only) →
private app tier → private data tier, in separate subnets with security groups between
them; separate VPCs/accounts per environment. Internet-facing components never share a
segment with sensitive systems. Databases are not `publicly_accessible`, ever.

**1b. Out-of-VPC resources restricted (NS-2).** Resources that live outside the
virtual network — S3/storage buckets, DynamoDB, Lambda, API Gateway, CDN — are governed
by access policy: public-access blocks on, IAM scoped to principals and actions,
an authorizer on every API route. A subnet cannot protect these; only policy can.

**1c. Deny by default, allow by exception (NS-3).** Security groups and ACLs start from
deny-all; every allow rule names a specific port and source (prefer SG references over
CIDRs). **Egress counts**: replace default allow-all egress with specific destinations,
using domain allowlisting at the application/DNS layer for internet egress. Any
`0.0.0.0/0` ingress beyond 443-on-the-edge is a finding.

### Stage 2 — Connect privately (NS-4, NS-8, NS-10)

**2a. Private-to-private without the internet (NS-4).** PrivateLink/private endpoints
for one-service access; VPC peering for a few networks; Transit Gateway hub-and-spoke
at scale, with route tables connecting only the pairs that must talk. Gateway/interface
endpoints so private subnets reach CSP APIs without a public path.

**2b. Cloud ↔ on-premises through a secure intermediary (NS-8).** Site-to-site VPN or
Direct Connect/ExpressRoute landing in a transit/DMZ segment with inspection — never a
workload port exposed to an office CIDR over the internet. Prefer exposing services
(API gateway, private endpoint) over routing whole networks.

**2c. Remote admin access hardened (NS-10).** Developer/maintainer/administrator access
to private resources goes through a VPN or zero-trust proxy with MFA, authorised
devices only, a dedicated landing segment, session re-authentication (≈4-hourly),
failed-attempt lockout, **split tunneling disabled**, and full session logging. The
*accounts and privileges* of those admins are the access-control skill; the network
path is yours.

### Stage 3 — Protect the edge (NS-5, NS-6)

**3a. Filter internet traffic (NS-5).** WAF (managed OWASP rule set + rate limiting) on
every internet-facing entry point, DDoS protection, and a CDN for public content — with
the origin locked to accept traffic only from the CDN/WAF path.

**3b. Valid, trusted, auto-renewed certificates (NS-6).** Certificates signed by a
trusted root CA, matching every served hostname, unexpired, not revoked — via a
certificate manager (ACM or equivalent) with DNS-validated auto-renewal *and* expiry
alerts. A self-signed or lapsed certificate on a .gov.sg endpoint is the
reputational-harm finding the whole family exists to prevent.

### Stage 4 — Secure the hops (NS-7)

Every service-to-service hop — microservice calls, database connections, queues — is
**authenticated, authorised, and encrypted**, and logged for investigation. A service
mesh with mTLS STRICT plus authorization policies gets all four mechanically;
without a mesh, combine TLS-required datastores, IAM/OAuth2 service auth, and
authenticated queues. Plaintext HTTP inside the VPC fails this control *and* DP-3.

### Stage 5 — Detect and alert (NS-9, NS-11)

**5a. IPS/IDS (NS-9).** Network (or host) intrusion detection/prevention watching
traffic to and from untrusted networks — AWS Network Firewall/GuardDuty, Azure Firewall
Premium IDPS, Cloud IDS, or Suricata/Zeek — with findings routed to the central
alerting/GCSOC pipeline (logging-monitoring skill) and an owner for triage.

**5b. Firewall-change alerts (NS-11).** Real-time alerts to appointed administrators on
every firewall/security-group rule create, delete, modify, enable, or disable
(CloudTrail→EventBridge, Activity Log alerts, or log-based alerts), plus alerts on
unusual resource-utilisation spikes or drops. Config-drift rules catch what the alert
stream misses.

## Audit checklist

Verify each row; record evidence (SG/NACL rule, route table, endpoint or policy config,
certificate chain, alert rule, session logs).

| ID | Check | Where |
|---|---|---|
| NS-1 | Tiered public/app/data segmentation; internet-facing and sensitive components separated; DBs private | VPC/subnet layout + SGs |
| NS-2 | Out-of-VPC resources (S3, DynamoDB, API GW, functions) restricted by policy/authorizer; no public buckets or `NONE`-auth routes | Resource policies |
| NS-3 | Deny-by-default ingress **and egress**; exceptions are specific host+port; no stray `0.0.0.0/0` | SG/ACL rules |
| NS-4 | Private-to-private traffic via PrivateLink/peering/TGW, never the internet; endpoints for CSP APIs | Route tables + endpoints |
| NS-5 | WAF + DDoS protection + CDN on internet-facing entry points; origin locked to the CDN path | Edge config |
| NS-6 | Certs CA-signed, matching, unexpired, unrevoked; auto-renewal + expiry alerts | Cert manager |
| NS-7 | Service-to-service hops authenticated, authorised, encrypted, logged (mesh mTLS or equivalent) | Mesh/app/DB config |
| NS-8 | Hybrid traffic via VPN/DX through an inspected intermediary; no direct internet exposure of workloads to on-prem | Hybrid connectivity |
| NS-9 | IPS/IDS deployed on untrusted-network boundaries; findings routed and owned | NFW/IDPS config |
| NS-10 | Remote admin via MFA + managed-device VPN/ZTNA; re-auth interval; no split tunneling; sessions logged | VPN/ZTNA config |
| NS-11 | Real-time alerts on firewall rule changes and unusual utilisation; drift detection | EventBridge/Config etc. |

Report per control ID with pass / fail / not-applicable-per-SSP, the evidence found,
and — for failures — the fix from `references/implementation-recipes.md`. Attribute
in-cluster pod segmentation to CS-10 (container-security) and log-pipeline gaps to LM
(logging-monitoring) rather than double-counting them as NS findings.

## Related skills in this repo

- **ssp-navigator** — which SSP applies and at which level each NS control sits for
  this system. Use it before declaring any NS control out of scope.
- **container-security** — CS-10 owns pod-level segmentation *inside* a cluster
  (namespaces + NetworkPolicy) and CS-9 the private cluster API; this skill owns the
  VPC/subnet/security-group boundary *around* the cluster. Load both for containerised
  workloads.
- **data-protection** — DP-3 mandates that every hop is encrypted in transit and DP-1
  constrains which regions your endpoints and edges may live in; NS-6/NS-7 own the
  certificate validity and authenticated service-to-service mechanics that satisfy it.
- **logging-monitoring** — NS-9 IPS/IDS detections and NS-11 firewall-change alerts are
  log/alert sources; LM owns the central pipeline, retention, and GCSOC forwarding they
  must feed.
- **access-control** — the accounts, MFA policy, and device hardening of the admins who
  use NS-10's remote-access path; AC governs *who*, NS governs *the path*.
- **security-testing** — ST-1 host scans and ST-2 CSPM verify this family from the
  outside and feed the ST-5 remediation SLAs; a network VAPT exercises these controls.

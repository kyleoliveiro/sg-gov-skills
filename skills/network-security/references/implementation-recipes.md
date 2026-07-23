# NS implementation recipes

Concrete configuration per control, cloud-agnostic pattern first with AWS / Azure / GCP
specifics where they differ. Read this when actually building or fixing; use
`ns-controls.md` for exact control wording.

## NS-1 — Segment the network

Tiered VPC/VNet, minimum three tiers:

| Tier | Contains | Reachability |
|---|---|---|
| Public | ALB/appgw, NAT gateway, WAF-fronted ingress only | Internet-facing |
| Private (app) | Compute — ECS/EKS nodes, VMs, functions in-VPC | From public tier only |
| Private (data) | RDS/SQL, caches, message brokers | From app tier only |

```hcl
resource "aws_subnet" "public"  { vpc_id = aws_vpc.main.id; cidr_block = "10.0.0.0/24"; map_public_ip_on_launch = false }
resource "aws_subnet" "app"     { vpc_id = aws_vpc.main.id; cidr_block = "10.0.16.0/20" }
resource "aws_subnet" "data"    { vpc_id = aws_vpc.main.id; cidr_block = "10.0.32.0/20" }
```

- Databases get `publicly_accessible = false` (AWS RDS) / private endpoint (Azure SQL) /
  private IP only (Cloud SQL).
- Separate environments (prod/staging/dev) into separate VPCs or accounts/subscriptions,
  not just subnets.
- Micro-segmentation where warranted: security group per workload referencing other
  security groups (not CIDRs), or a service mesh authorization policy.

## NS-2 — Restrict out-of-VPC CSP resources

Resources that live outside your virtual network (S3, DynamoDB, Lambda, API Gateway,
CloudFront, storage accounts, Cloud Storage) are governed by *access policy*, not
subnets:

- **S3 / Storage / GCS**: enable account-level public access block
  (`aws_s3_account_public_access_block`), bucket policies scoped to principals/VPC
  endpoints, no `"Principal": "*"` grants.
- **DynamoDB / NoSQL**: IAM policies scoped to tables and actions; no wildcard resource.
- **API Gateway / functions**: an authorizer (IAM, JWT/Lambda authorizer, or middleware
  auth) on every route; no `NONE` auth on non-public routes; resource policies limiting
  source where applicable.
- VPC endpoints are for *reaching* these services privately from private subnets (NS-4);
  they do not replace the access policy.

## NS-3 — Deny by default, allow by exception

- Security groups: no `0.0.0.0/0` (or `::/0`) ingress except 443 on the internet-facing
  tier; every rule names a specific port and a specific source (prefer SG references
  over CIDRs).
- **Egress too**: replace the default allow-all egress with specific destinations. For
  internet egress, prefer domain allowlisting at the application/DNS layer (AWS Network
  Firewall domain rules, Azure Firewall FQDN rules, Squid/Envoy egress proxy) over raw
  port-based rules.
- NACLs / subnet-level rules as a coarse second layer; the default NACL allow-all is
  acceptable only if security groups carry the deny-by-default posture.
- Audit query: any SG rule with source `0.0.0.0/0` and port ≠ 443, or egress
  `0.0.0.0/0 all-ports`, is a finding.

## NS-4 — Private-to-private connectivity

- Consumer→producer, one service: **PrivateLink** (AWS) / Private Endpoint (Azure) /
  Private Service Connect (GCP) — unidirectional, no route-table exposure.
- Full L3 between a few VPCs: **VPC peering** (non-transitive; mind CIDR overlap).
- Hub-and-spoke at scale: **Transit Gateway** / Virtual WAN / Network Connectivity
  Center, with route tables that only connect the pairs that must talk.
- Gateway endpoints (S3/DynamoDB) and interface endpoints for CSP APIs so private
  subnets never need a NAT path to reach them.

## NS-5 — Edge filtering

- **WAF** in front of every internet-facing entry point: AWS WAFv2 on
  ALB/CloudFront/API Gateway, Azure WAF on Front Door/AppGW, Cloud Armor on GCLB.
  Start from managed core rule sets (OWASP CRS) + rate-based rules.
- **DDoS**: AWS Shield (Advanced for High Impact services), Azure DDoS Protection,
  Cloud Armor. 
- **CDN** for public content: CloudFront / Front Door / Cloud CDN — also shrinks the
  origin attack surface; lock the origin to accept traffic only from the CDN (origin
  custom header + SG referencing the CDN prefix list).

## NS-6 — Valid, trusted, auto-renewed certificates

- Use the CSP certificate manager (ACM, Azure Key Vault certificates, Google-managed
  certs) with DNS validation so renewal is automatic; alert on expiry anyway
  (ACM emits `DaysToExpiry` CloudWatch metrics; alarm at 30/14 days).
- Public-CA-signed, SAN matches every served hostname, no wildcard sprawl beyond need.
  Self-signed or internal-CA certs on public endpoints are a finding; internal services
  use a managed private CA (ACM-PCA, etc.) that clients actually trust.
- Check revocation posture: don't ship certificates from an untrusted/discontinued CA;
  staple OCSP where the platform supports it.

## NS-7 — Secure inter-service communication

Every service-to-service hop gets **authentication + authorisation + encryption**:

- **Mesh**: Istio/Linkerd/App Mesh with `PeerAuthentication` mTLS STRICT and
  `AuthorizationPolicy` allowlists — the mechanical way to get all three plus logs.
- **No mesh**: TLS to databases (`rds.force_ssl=1`, `require_secure_transport=ON`),
  SigV4/IAM auth between AWS services, OAuth2 client-credentials or mTLS between
  microservices, authenticated queues (SQS/SNS IAM policies, AMQP over TLS with per-app
  credentials).
- Log the calls (mesh access logs, ALB logs, app-level structured logs) — the control
  text asks for communications to be logged for detection and investigation; route them
  per the logging-monitoring skill.

## NS-8 — Cloud ↔ on-premises

- Route hybrid traffic through a **secure managed intermediary**: site-to-site VPN or
  Direct Connect / ExpressRoute / Cloud Interconnect landing in a dedicated transit/DMZ
  VPC, with a firewall or application proxy inspecting flows — never SSH/RDP from
  on-prem straight to workload instances over the internet, never a database port
  exposed to an office CIDR.
- Prefer exposing *services* (API gateway, PrivateLink endpoint) over routing *networks*
  when the integration is a handful of APIs.

## NS-9 — IPS/IDS

- Network IDS/IPS watching traffic to/from untrusted networks: AWS Network Firewall
  (Suricata-compatible IPS rules) or GuardDuty (+ VPC traffic mirroring to
  Suricata/Zeek where deep inspection is required); Azure Firewall Premium IDPS; Cloud
  IDS on GCP.
- Host-based IDS (Wazuh/OSSEC) where network placement can't see the traffic.
- Detections are only useful if someone sees them: route findings to the central
  alerting/GCSOC pipeline (logging-monitoring skill), with an owner for triage.

## NS-10 — Remote access to private networks

For developer/maintainer/administrator access:

- Client VPN or zero-trust access proxy (AWS Client VPN, Azure VPN/Bastion, IAP, or
  Tailscale/ZTNA equivalents approved by the agency) — MFA on every connection,
  federated to the corporate IdP.
- **Session caps + re-authentication** (recommend 4-hour max), lockout after repeated
  failed attempts, **split tunneling disabled**, traffic inspected at the gateway.
- Access only from authorised/managed devices (device posture or certificates); land in
  a dedicated remote-access segment, then jump — no direct route to the data tier.
- Log every session start/end and command path where feasible (SSM Session Manager
  logging beats raw SSH).

## NS-11 — Firewall-change alerts

Real-time alerts to appointed administrators on create/delete/modify/enable/disable of
firewall and security-group rules:

- **AWS**: EventBridge rule on CloudTrail events
  (`AuthorizeSecurityGroupIngress/Egress`, `RevokeSecurityGroup*`,
  `Modify*SecurityGroupRules`, Network Firewall/WAF changes) → SNS/chat webhook; AWS
  Config managed rules (`restricted-ssh`, `vpc-sg-open-only-to-authorized-ports`) for
  drift.
- **Azure**: Activity Log alerts on `Microsoft.Network/networkSecurityGroups/*` writes.
- **GCP**: log-based alert on `compute.firewalls.*` admin activity.
- Include unusual resource-utilisation spikes/drops in the alert set (the control text
  asks for this too — a traffic cliff can mean a rule silently broke).

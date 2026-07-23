# Network Security (NS) — full control text

Embedded from **https://info.standards.tech.gov.sg/control-catalog/cybersecurity/ns/ as
of 2026-07-23** (page last updated 5 March 2026). The standards iterate actively; verify
against the live page for any compliance-critical decision. Each control on the site
publishes a Control Statement, Control Recommendations, and a Risk Statement.

**Family scope:** *Controls to secure the network boundaries of a system.*

The family has **11 controls (NS-1..NS-11)**. None of them carry agency-defined
parameters — the SSP still decides which level each control sits at for a given system.

---

## NS-1 — Network and System Component Segmentation

- **Control Statement:** Segment and isolate system components into separate physical
  and logical networks or environments based on their security requirements and risk
  levels.
- **Control Recommendations:** Deploy firewalls, security groups, and API gateways for
  segmentation. Cloud implementations should use a tiered architecture with
  internet-facing services in public segments and sensitive systems in private segments
  with controlled outbound access. Consider micro-segmentation for granular
  workload-based control.
- **Risk Statement:** Lack of segregation between private and public resources increases
  the risk of unauthorised data access, potentially exposing sensitive information.

## NS-2 — Access Restrictions on CSP Resources Outside Virtual Network

- **Control Statement:** Restrict access to CSP resources outside of a virtual network
  (e.g., Lambda, DynamoDB, API Gateways, S3, CloudFront) using access controls or
  application layer authorisation.
- **Control Recommendations:** Apply resource-appropriate restrictions: IAM policies for
  DynamoDB; Lambda authorizers or middleware for API Gateways; IAM policies and public
  access blocks for S3. VPC endpoints are only necessary for clients in private subnets.
- **Risk Statement:** Insufficient access restrictions create exposure risks including
  unauthorised access, data exposure, and potential misuse of critical services.

## NS-3 — Deny by Default - Allow by Exception

- **Control Statement:** Deny network communications traffic by default and allow
  network communications traffic by exception at managed interfaces.
- **Control Recommendations:** Configure access control lists and security groups
  denying all traffic initially. Allow exceptions only for specific hosts and ports.
  Consider domain whitelisting at the application or DNS layer for internet egress
  rather than transport-layer restrictions.
- **Risk Statement:** Missing controls increase the risk of unauthorised or malicious
  network access, leading to potential security breaches and compromise of system
  integrity.

## NS-4 — Inter-Private Network Connectivity

- **Control Statement:** Route network traffic between private networks without going
  through the internet.
- **Control Recommendations:** Use CSP private endpoint services (e.g., AWS PrivateLink
  with VPC endpoints) for unidirectional access to specific services. Use VPC peering
  and Transit Gateway for layer-3 IP connectivity. See the AWS Multi-VPC whitepaper for
  guidance.
- **Risk Statement:** Internet routing increases vulnerability to man-in-the-middle and
  spoofing attacks. Bidirectional access without fine-grained controls risks
  unauthorised access and potential data exfiltration.

## NS-5 — Network and Application Layer Filtering

- **Control Statement:** Filter direct traffic from the internet to protect against
  network and application layer attacks.
- **Control Recommendations:** Deploy appropriate mechanisms including Web Application
  Firewalls, DDoS protection (e.g., AWS Shield), and Content Delivery Networks (e.g.,
  CloudFront).
- **Risk Statement:** Lacking internet traffic filtering exposes systems to network and
  application layer attacks, increasing the likelihood of unauthorised access and
  denial-of-service incidents.

## NS-6 — Valid and Trusted SSL/TLS Certificates

- **Control Statement:** Deployed certificates must be signed by trusted root
  Certificate Authorities, match the service domain names, remain unexpired, and not be
  revoked.
- **Control Recommendations:** Configure certificate managers providing auto-renewal and
  expiry alerts (e.g., AWS Certificate Manager) or automate these functions separately.
- **Risk Statement:** Invalid certificates introduce risks of compromised encryption,
  man-in-the-middle attacks, and potential unauthorised access to sensitive information.

## NS-7 — Secure Inter-Service Communication

- **Control Statement:** Ensure communications between services are secure by making
  them authenticated, authorised and encrypted.
- **Control Recommendations:** Design inter-service communications (databases,
  microservices) to include authentication, authorisation, and encryption via API
  gateways, proxies, private endpoint services, message queues, or service meshes. Log
  communications for detection and incident investigation.
- **Risk Statement:** Insecure service communications increase the risk of unauthorised
  access, data breaches, and potential manipulation of sensitive information during
  transit.

## NS-8 — Secure Cloud and On-Premises Connectivity

- **Control Statement:** Route network traffic between on-premises systems and cloud
  systems through a secure intermediary.
- **Control Recommendations:** Use managed interfaces with boundary protection (API
  gateways, application proxies, private endpoint services) instead of direct
  connectivity between cloud and on-premises environments.
- **Risk Statement:** Insecure hybrid connectivity risks data breaches, unauthorised
  access, and compromise of both cloud and on-premises resources.

## NS-9 — Intrusion Prevention System (IPS)/Intrusion Detection System (IDS)

- **Control Statement:** Set up and configure an Intrusion Prevention System
  (IPS)/Intrusion Detection System (IDS) in the network.
- **Control Recommendations:** Configure network or host IPS/IDS to detect malicious
  traffic to and from public or untrusted networks.
- **Risk Statement:** Absence of IPS/IDS increases the likelihood of undetected
  intrusions, putting sensitive data and system integrity at risk.

## NS-10 — Private Network Connectivity

- **Control Statement:** Implement strong access controls, encryption, and logging for
  remote developer, maintainer, or administrator access to private network resources.
- **Control Recommendations:** Implement layered security: strong authentication with
  MFA; gateway traffic inspection; dedicated network segments for remote access; strong
  encryption; access from authorised devices only; non-perpetual connections requiring
  periodic re-authentication (four-hour intervals recommended); maximum failed
  authentication attempt policies; disable split tunneling.
- **Risk Statement:** Weak private network security may expose networks to malicious
  activities, compromising the confidentiality, integrity, and availability of critical
  resources.

## NS-11 — Alerts on Firewall Configuration Changes

- **Control Statement:** Generate alerts to inform appointed administrators on changes
  to firewall rules, including the enabling or disabling of rules.
- **Control Recommendations:** Implement real-time alerts for firewall rule creation,
  deletion, modification, enabling, and disabling. Also alert administrators of unusual
  resource utilisation spikes or drops.
- **Risk Statement:** Unintended changes to firewall rules can significantly lower the
  perimeter defence of a network.

---

## Cross-family notes

- **CS-10 (container-security)** owns pod-level segmentation *inside* a cluster
  (namespaces + NetworkPolicy); NS-1/NS-3 own the VPC/subnet/security-group boundary
  *around* it. CS-9's private orchestrator API endpoint is a specific instance of the
  deny-by-default posture NS-3 demands at every managed interface.
- **DP-3 (data-protection)** mandates *that* every hop is encrypted in transit; NS-6
  owns certificate validity and NS-7 the authenticated/authorised/encrypted mechanics of
  service-to-service traffic.
- **LM (logging-monitoring)** owns the alerting pipeline, log retention, and GCSOC
  forwarding that NS-9 detections and NS-11 firewall-change alerts must feed into.
- **AC (access-control)** owns the accounts, MFA policy, and endpoint hardening of the
  people who connect through NS-10's remote-access path; NS-10 owns the network path
  itself.
- **ST (security-testing)** verifies this family from the outside: ST-1 host scans and
  ST-2 CSPM will surface open security groups and public endpoints as findings.

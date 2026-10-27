# AgencyPay network setup — current state

Working notes from the infra team, for the security review.

## Topology

- One VPC (`10.20.0.0/16`) in ap-southeast-1 with a single public subnet. The ALB,
  the two app EC2 instances, and the RDS Postgres instance all sit in that subnet and
  share one security group (see `network.tf`).
- The public ALB terminates TLS with a certificate we generated ourselves in June 2024
  (3-year self-signed cert, imported into ACM). Nobody is watching expiry; we figured
  three years was plenty of runway.
- No WAF, Shield Advanced, or CDN. Traffic from the internet hits the ALB directly.

## Service-to-service

- The app talks to RDS over plain TCP (`sslmode=disable`) — it's all inside the VPC so
  we didn't bother with TLS or forcing it on the DB side.
- The app also calls the notifications microservice (separate VPC, `10.30.0.0/16`,
  same AWS account) over its **public** Elastic IP, plain HTTP on port 8080, no auth
  header — the VPCs aren't peered and nobody set up PrivateLink.
- Batch jobs read/write the `agencypay-statements` S3 bucket. The bucket still has the
  public-read policy from the launch demo.

## On-premises integration

- The agency's legacy mainframe gateway (on-prem) pushes settlement files to the app
  over the internet: we exposed the app instance's SFTP (port 22) to the agency's
  office IP range on the `0.0.0.0/0` SSH rule "temporarily" in 2024. There is no
  site-to-site VPN or Direct Connect.

## Remote access

- The vendor team administers the EC2 instances by SSHing directly from home over the
  internet (same `0.0.0.0/0` port-22 rule) using a shared `ubuntu` key kept in the
  team's password manager. No MFA on the network path, no session recording, no VPN.
  One engineer set up personal split-tunnel VPN software on their laptop so they can
  reach the boxes and their home NAS at the same time.

## Detection and change management

- No IDS/IPS anywhere (no GuardDuty, no Network Firewall). CloudTrail is on
  (management events only).
- Security-group changes are made straight in the console when something breaks;
  there are no alerts or notifications on firewall/SG rule changes and no config-drift
  detection. We usually find out about a rule change when someone can't connect.

## Questions for the reviewers

We know some of this is rough — please tell us what the ICT&SS network security
controls actually require, what fails today, and the order you'd fix it in.

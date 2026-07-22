# DP implementation recipes

Concrete config and artifacts per control. Adapt to the project; `dp-*_prm_*` values must
come from the System Security Plan, not from these examples.

## DP-1 — enforce Singapore residency

Guardrail first: deny every region except Singapore at the organisation level (AWS SCP;
Azure Policy `allowedLocations` and GCP org policy `gcp.resourceLocations` are the
equivalents):

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "DenyNonSingaporeRegions",
    "Effect": "Deny",
    "NotAction": ["iam:*", "organizations:*", "route53:*", "cloudfront:*",
                  "support:*", "sts:*"],
    "Resource": "*",
    "Condition": {"StringNotEquals": {"aws:RequestedRegion": "ap-southeast-1"}}
  }]
}
```

Then hunt the quiet leaks — each is a residency breach with zero code change:

- **Cross-region replication**: S3 CRR rules, RDS cross-region read replicas, DynamoDB
  global tables, ECR replication — destination must be an SG region or the feature off.
- **Backups and DR**: AWS Backup copy jobs, snapshot copies, warm-standby regions.
- **Managed-service processing**: check where the service processes and fails over
  (model inference, transcoding, email sending); an SG endpoint with overseas failover
  is not SG residency for in-scope data.
- **CDN/edge caches**: cache only public (OPEN) content at edge; keep in-scope response
  data uncached or SG-restricted.
- **SaaS**: residency must be contractual (region named in the agreement), and ask about
  support access and subprocessors — "data stored in SG, support from elsewhere" is a
  question for the data owner, not a silent pass.

Evidence: the SCP/policy, per-service region listing, and the replication/backup config.

## DP-2 — validate at-rest encryption per service

Don't trust "the cloud encrypts by default" — enumerate stores and check each:

```hcl
resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
  bucket = aws_s3_bucket.data.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "aws:kms" }
  }
}

resource "aws_db_instance" "app" {
  # ...
  storage_encrypted = true
}

resource "aws_ebs_encryption_by_default" "on" { enabled = true }
```

Checklist per system: block volumes and their **snapshots**, object storage, databases
and **read replicas**, queues (SSE on SQS/SNS), caches (Redis/ElastiCache
at-rest+auth), search indexes, log buckets, container registries, and file shares. A
quick sweep: AWS Config rules `encrypted-volumes`, `rds-storage-encrypted`,
`s3-default-encryption-kms`. Key choice/rotation is CK — record which KMS key, then hand
the key questions to secure-coding-as.

## DP-3 — TLS on every hop

The load balancer is not the end of the job; internal hops count:

- External: TLS 1.2+ at the edge (ALB/CloudFront), HSTS at the app (see
  secure-coding-as).
- **Internal service-to-service**: HTTPS between services (or mTLS via service mesh /
  App Mesh / ECS Service Connect TLS); no plaintext HTTP "because it's inside the VPC".
- Databases: require TLS on the connection (`rds.force_ssl = 1` for Postgres,
  `require_secure_transport = ON` for MySQL) — an encrypted disk with a plaintext wire
  is a DP-3 fail.
- Queues/caches: TLS endpoints for SQS; `transit_encryption_enabled = true` for
  ElastiCache.

Evidence: listener configs, DB parameter groups, mesh/TLS settings.

## DP-4 — central tenancy

The in-scope systems (dp-4_prm_1) live under the central structure (dp-4_prm_2): AWS
Organizations (or Azure Management Groups / GCP Organizations) with a landing zone,
guardrails (the DP-1 SCP above lives here), centralised logging, and a tagging standard.
**GCC tenancies provide the landing zone, guardrails, and central logging by
construction** — the audit question becomes "is every account for this system inside the
GCC/org structure?" A standalone account created on a corporate card for "just a proof of
concept" holding real data is the classic DP-4 finding, and it usually drags DP-1/DP-2
failures with it.

## DP-5 / DP-6 — sanitisation and witnessed destruction SOP

Cloud media is the CSP's responsibility under its certifications; this SOP covers media
the agency controls — on-prem disks, office NAS, USB media, laptops/copiers returned at
contract end.

```markdown
# Storage sanitisation & destruction SOP — <agency/system>

1. Inventory: every device that stored data at rest gets a record (asset ID,
   type, classification of data held).
2. Sanitise using a recognised standard (Gutmann / Schneier / DoD 5220.22-M)
   — or physically shred/incinerate storage meant for retirement. Failed or
   unsanitisable media is always destroyed.
3. WITNESS: an agency staff member observes the sanitisation/destruction and
   signs the record. A vendor certificate alone is not a witnessed process.
4. Record per device: asset ID, method + standard, date, operator,
   agency witness (name, appointment, signature), disposal outcome.
5. Retain records per the agency's schedule; reconcile against the inventory
   so no device leaves unrecorded.
```

Selling, donating, or e-waste-binning storage without steps 2–4 fails DP-5 and DP-6.

## DP-7 — DLP

Prefer built-in platform DLP: **Microsoft Purview** (sensitivity labels + DLP policies
across Exchange/SharePoint/Teams/endpoints) or **Google Workspace DLP rules**; on AWS,
Amazon Macie for S3 sensitive-data discovery feeding blocking automation. Configure to
the actual classifications in play:

- Monitor flows (email, shared drives, endpoints, object storage egress).
- Detect the sensitive patterns that matter here (NRIC numbers, classification
  markings, project codewords) — not just credit-card defaults.
- **Block** unauthorised sharing, don't just alert, for above-threshold matches.
- Review and tune policies on a schedule; log DLP events to the central log platform
  (LM family).

For GenAI upload paths, GA-6 (gen-ai-security) is the control; wire it to the same DLP
engine.

## DP-8 — classification disclosure at input fields

For internal officer-facing apps, at or near every input that accepts free text, audio,
or uploads:

```html
<label for="case-notes">Case notes</label>
<p id="case-notes-hint" class="input-hint">
  Up to <strong>RESTRICTED / Sensitive Normal</strong> information may be
  entered here. Do not enter CONFIDENTIAL or higher.
</p>
<textarea id="case-notes" aria-describedby="case-notes-hint"></textarea>
```

Repeat the ceiling in the user guide. Keep the stated ceiling in sync with what the
system is authorised to hold — wire it to the same config that drives storage/routing
decisions rather than hardcoding prose in two places.

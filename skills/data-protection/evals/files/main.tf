# CaseDesk — internal case management for officers
# Standalone account 4821-XXXX-XXXX ("casedesk-prod", opened by the team in 2025
# to move faster; not part of the agency GCC organisation)

provider "aws" {
  region = "ap-southeast-1"
}

provider "aws" {
  alias  = "dr"
  region = "us-east-1"
}

# --- Case documents (scanned statements, medical reports — CONFIDENTIAL) ---

resource "aws_s3_bucket" "case_documents" {
  bucket = "casedesk-case-documents"
}

resource "aws_s3_bucket" "case_documents_replica" {
  provider = aws.dr
  bucket   = "casedesk-case-documents-replica"
}

# Geographic resilience: keep a copy far away from region-wide outages
resource "aws_s3_bucket_replication_configuration" "dr" {
  bucket = aws_s3_bucket.case_documents.id
  role   = aws_iam_role.replication.arn

  rule {
    id     = "dr-copy"
    status = "Enabled"
    destination {
      bucket = aws_s3_bucket.case_documents_replica.arn
    }
  }
}

# --- Database ---

resource "aws_db_parameter_group" "pg" {
  name   = "casedesk-pg16"
  family = "postgres16"

  # TLS handshakes were adding latency on the batch import path; the VPC is
  # private so connections are internal-only anyway
  parameter {
    name  = "rds.force_ssl"
    value = "0"
  }
}

resource "aws_db_instance" "cases" {
  identifier           = "casedesk-cases"
  engine               = "postgres"
  engine_version       = "16.3"
  instance_class       = "db.m6g.large"
  allocated_storage    = 200
  storage_encrypted    = false
  parameter_group_name = aws_db_parameter_group.pg.name
  username             = "casedesk"
  manage_master_user_password = true
}

# --- Worker instance (OCR + batch import) ---

resource "aws_instance" "worker" {
  ami           = "ami-0f2a1b3c4d5e6f708"
  instance_type = "m6i.large"

  root_block_device {
    volume_size = 100
    encrypted   = false
  }
}

# --- Backups ---

resource "aws_backup_plan" "daily" {
  name = "casedesk-daily"

  rule {
    rule_name         = "daily"
    target_vault_name = aws_backup_vault.local.name
    schedule          = "cron(0 18 * * ? *)"

    copy_action {
      destination_vault_arn = aws_backup_vault.offsite.arn
    }
  }
}

resource "aws_backup_vault" "local" {
  name = "casedesk-sg"
}

resource "aws_backup_vault" "offsite" {
  provider = aws.dr
  name     = "casedesk-dr"
}

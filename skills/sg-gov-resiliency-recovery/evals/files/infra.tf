# Infra for the SchoolPlace placement portal (Singapore government agency, ap-southeast-1)
# Traffic is seasonal: ~2k req/day normally, ~400k req/day during the two-week
# registration window each July.

resource "aws_vpc" "main" {
  cidr_block = "10.40.0.0/16"
}

# One subnet, one AZ.
resource "aws_subnet" "app" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.40.1.0/24"
  availability_zone = "ap-southeast-1a"
}

# Two app servers, fixed size, both in the same AZ. Sized for the July peak;
# they idle at ~3% CPU the other 50 weeks. No auto-scaling group, no load
# balancer health-check failover — DNS round-robins between the two instance IPs.
resource "aws_instance" "app_1" {
  ami               = "ami-0aa7d40eeae50c9a9"
  instance_type     = "c5.4xlarge"
  subnet_id         = aws_subnet.app.id
  availability_zone = "ap-southeast-1a"
}

resource "aws_instance" "app_2" {
  ami               = "ami-0aa7d40eeae50c9a9"
  instance_type     = "c5.4xlarge"
  subnet_id         = aws_subnet.app.id
  availability_zone = "ap-southeast-1a"
}

# Database: single instance, same AZ as the app servers. multi_az was turned
# off in 2024 to save cost after a budget review.
resource "aws_db_instance" "main" {
  identifier              = "schoolplace-db"
  engine                  = "postgres"
  instance_class          = "db.m5.large"
  allocated_storage       = 200
  availability_zone       = "ap-southeast-1a"
  multi_az                = false
  backup_retention_period = 0   # automated backups disabled — see snapshot script
  skip_final_snapshot     = true
}

# "Backups": a nightly cron on app_1 runs pg_dump and copies the file into
# this bucket. Same AWS account, same region, no lifecycle rules beyond the
# 14-day expiry, no object lock. The app servers' EBS volumes and config are
# not backed up at all.
resource "aws_s3_bucket" "db_dumps" {
  bucket = "schoolplace-db-dumps"
}

resource "aws_s3_bucket_lifecycle_configuration" "db_dumps" {
  bucket = aws_s3_bucket.db_dumps.id
  rule {
    id     = "expire-old-dumps"
    status = "Enabled"
    expiration { days = 14 }
  }
}

# Every developer on the team has this role; it can overwrite or delete dumps.
resource "aws_iam_role_policy" "dev_dumps_access" {
  name = "dev-dumps-full-access"
  role = aws_iam_role.developers.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:*"]
      Resource = ["arn:aws:s3:::schoolplace-db-dumps", "arn:aws:s3:::schoolplace-db-dumps/*"]
    }]
  })
}

resource "aws_iam_role" "developers" {
  name               = "schoolplace-developers"
  assume_role_policy = data.aws_iam_policy_document.dev_assume.json
}

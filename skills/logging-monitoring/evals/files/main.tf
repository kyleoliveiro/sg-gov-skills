terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-southeast-1"
}

# ------------------------------------------------------------------
# Network
# ------------------------------------------------------------------

resource "aws_vpc" "granthub" {
  cidr_block           = "10.40.0.0/16"
  enable_dns_hostnames = true

  tags = { Name = "granthub-vpc" }
}

resource "aws_subnet" "public_a" {
  vpc_id            = aws_vpc.granthub.id
  cidr_block        = "10.40.1.0/24"
  availability_zone = "ap-southeast-1a"
}

resource "aws_subnet" "app_a" {
  vpc_id            = aws_vpc.granthub.id
  cidr_block        = "10.40.10.0/24"
  availability_zone = "ap-southeast-1a"
}

# NOTE: no aws_flow_log resources — flow logging has not been enabled.

# ------------------------------------------------------------------
# Load balancer — access logging disabled after the load-test noise
# ------------------------------------------------------------------

resource "aws_lb" "granthub" {
  name               = "granthub-alb"
  internal           = false
  load_balancer_type = "application"
  subnets            = [aws_subnet.public_a.id]

  access_logs {
    bucket  = aws_s3_bucket.logs.id
    prefix  = "alb"
    enabled = false
  }
}

# ------------------------------------------------------------------
# App tier
# ------------------------------------------------------------------

resource "aws_instance" "app" {
  count         = 2
  ami           = "ami-0f9c27b8ba1250e1a"
  instance_type = "m6i.large"
  subnet_id     = aws_subnet.app_a.id

  # App writes logs to /var/log/granthub on the instance root volume.
  root_block_device {
    volume_size = 200 # generous, so logs can stay local
  }

  tags = { Name = "granthub-app-${count.index}" }
}

# ------------------------------------------------------------------
# Database — default parameter group, no log exports
# ------------------------------------------------------------------

resource "aws_db_instance" "granthub" {
  identifier        = "granthub-db"
  engine            = "postgres"
  engine_version    = "16.3"
  instance_class    = "db.m6g.large"
  allocated_storage = 100
  username          = "granthub"
  password          = var.db_password

  # enabled_cloudwatch_logs_exports not set — no database log exports.
}

variable "db_password" {
  type      = string
  sensitive = true
}

# ------------------------------------------------------------------
# Log bucket (from the analytics experiment)
# ------------------------------------------------------------------

resource "aws_s3_bucket" "logs" {
  bucket = "granthub-logs"
  # No server_side_encryption_configuration — encryption still on the backlog.
}

# Developers keep full access so they can clean up test data while debugging.
resource "aws_iam_role_policy" "developer_logs" {
  name = "granthub-developer-logs"
  role = aws_iam_role.developers.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DevLogAccess"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.logs.arn,
          "${aws_s3_bucket.logs.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role" "developers" {
  name = "granthub-developers"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::555566667777:root" }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

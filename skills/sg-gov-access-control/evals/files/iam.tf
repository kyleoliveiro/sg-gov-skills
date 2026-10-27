# ReliefPortal IAM — GCC AWS tenancy

resource "aws_iam_role" "developers" {
  name = "reliefportal-developers"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { AWS = "arn:aws:iam::111122223333:root" }
      Action    = "sts:AssumeRole"
      # NOTE: no MFA condition — virtual MFA enrolment was fiddly, revisit later
    }]
  })
}

# Everyone on the dev team gets this. Small team, keeps velocity up.
resource "aws_iam_role_policy" "developers_all" {
  name = "reliefportal-developers-policy"
  role = aws_iam_role.developers.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "*"
      Resource = "*"
    }]
  })
}

# CI pipeline deploys with this user's access key (created Jan 2024, works fine).
resource "aws_iam_user" "ci_deployer" {
  name = "ci-deployer"
}

resource "aws_iam_user_policy" "ci_deployer_policy" {
  name = "ci-deployer-policy"
  user = aws_iam_user.ci_deployer.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ecs:*", "ecr:*", "s3:*", "cloudformation:*"]
        Resource = "*"
      }
    ]
  })
}

# Console users (one IAM user per developer; MFA optional)
resource "aws_iam_user" "dev_users" {
  for_each = toset([
    "jlim",
    "mkumar",
    "sfaridah",
    "dtan",
    "achew",
    "tan.wl.vendor" # vendor contractor — contract ended Feb 2026, keeping in case we re-engage
  ])
  name = each.key
}

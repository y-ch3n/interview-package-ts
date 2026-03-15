data "aws_caller_identity" "current" {}

locals {
  account_id = data.aws_caller_identity.current.account_id
}

# ── ECR Repositories ───────────────────────────────────────────────────────────

resource "aws_ecr_repository" "backend" {
  name                 = "school-admin-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Service = "backend"
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "school-admin-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Service = "frontend"
  }
}

resource "aws_ecr_repository" "external" {
  name                 = "school-admin-external"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Service = "external"
  }
}

# ECR lifecycle policies — retain last 10 tagged images per repo
resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

resource "aws_ecr_lifecycle_policy" "frontend" {
  repository = aws_ecr_repository.frontend.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

resource "aws_ecr_lifecycle_policy" "external" {
  repository = aws_ecr_repository.external.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

# ── S3 Artifact Bucket ─────────────────────────────────────────────────────────

resource "aws_s3_bucket" "artifacts" {
  bucket        = "school-admin-${var.environment}-pipeline-artifacts-${local.account_id}"
  force_destroy = false

  tags = {
    Name = "school-admin-${var.environment}-pipeline-artifacts"
  }
}

resource "aws_s3_bucket_versioning" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "artifacts" {
  bucket                  = aws_s3_bucket.artifacts.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ── CodeStar GitHub Connection ─────────────────────────────────────────────────
# NOTE: After `terraform apply`, you must manually activate this connection
# in the AWS Console → Developer Tools → Connections before the pipeline can run.

resource "aws_codestarconnections_connection" "github" {
  name          = "school-admin-github"
  provider_type = "GitHub"

  tags = {
    Name = "school-admin-github-connection"
  }
}

# ── Security Group for CodeBuild (VPC access) ──────────────────────────────────

resource "aws_security_group" "codebuild" {
  name        = "school-admin-${var.environment}-codebuild-sg"
  description = "CodeBuild projects — outbound internet via NAT"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "school-admin-${var.environment}-codebuild-sg"
  }
}

# ── IAM: CodeBuild Role ────────────────────────────────────────────────────────

data "aws_iam_policy_document" "codebuild_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["codebuild.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "codebuild" {
  name               = "school-admin-${var.environment}-codebuild-role"
  assume_role_policy = data.aws_iam_policy_document.codebuild_assume.json
}

data "aws_iam_policy_document" "codebuild_policy" {
  # CloudWatch Logs
  statement {
    sid    = "CloudWatchLogs"
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["*"]
  }

  # S3 – artifact bucket access
  statement {
    sid    = "S3ArtifactAccess"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = [
      aws_s3_bucket.artifacts.arn,
      "${aws_s3_bucket.artifacts.arn}/*",
    ]
  }

  # ECR – push and pull images
  statement {
    sid    = "ECRAccess"
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage",
    ]
    resources = ["*"]
  }

  # CodeGuru Security
  statement {
    sid    = "CodeGuruSecurity"
    effect = "Allow"
    actions = [
      "codeguru-security:CreateScan",
      "codeguru-security:GetScan",
      "codeguru-security:GetFindings",
      "codeguru-security:ListFindings",
    ]
    resources = ["*"]
  }

  # VPC access for CodeBuild
  statement {
    sid    = "VPCAccess"
    effect = "Allow"
    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:DescribeDhcpOptions",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DeleteNetworkInterface",
      "ec2:DescribeSubnets",
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeVpcs",
      "ec2:CreateNetworkInterfacePermission",
    ]
    resources = ["*"]
  }

  # Elastic Beanstalk deploy
  statement {
    sid    = "ElasticBeanstalkDeploy"
    effect = "Allow"
    actions = [
      "elasticbeanstalk:CreateApplicationVersion",
      "elasticbeanstalk:UpdateEnvironment",
      "elasticbeanstalk:DescribeEnvironments",
      "elasticbeanstalk:DescribeApplicationVersions",
      "s3:GetObject",
      "s3:GetObjectAcl",
    ]
    resources = ["*"]
  }

  # CodeBuild report groups (for test reports)
  statement {
    sid    = "CodeBuildReports"
    effect = "Allow"
    actions = [
      "codebuild:CreateReportGroup",
      "codebuild:CreateReport",
      "codebuild:UpdateReport",
      "codebuild:BatchPutTestCases",
      "codebuild:BatchPutCodeCoverages",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "codebuild" {
  name   = "school-admin-${var.environment}-codebuild-policy"
  role   = aws_iam_role.codebuild.id
  policy = data.aws_iam_policy_document.codebuild_policy.json
}

# ── IAM: CodePipeline Role ─────────────────────────────────────────────────────

data "aws_iam_policy_document" "codepipeline_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["codepipeline.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "codepipeline" {
  name               = "school-admin-${var.environment}-codepipeline-role"
  assume_role_policy = data.aws_iam_policy_document.codepipeline_assume.json
}

data "aws_iam_policy_document" "codepipeline_policy" {
  statement {
    sid    = "S3ArtifactStore"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:GetBucketVersioning",
      "s3:PutObjectAcl",
      "s3:PutObject",
    ]
    resources = [
      aws_s3_bucket.artifacts.arn,
      "${aws_s3_bucket.artifacts.arn}/*",
    ]
  }

  statement {
    sid    = "CodeBuildAccess"
    effect = "Allow"
    actions = [
      "codebuild:BatchGetBuilds",
      "codebuild:StartBuild",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "CodeStarConnection"
    effect = "Allow"
    actions = [
      "codestar-connections:UseConnection",
    ]
    resources = [aws_codestarconnections_connection.github.arn]
  }

  statement {
    sid    = "IAMPassRole"
    effect = "Allow"
    actions = [
      "iam:PassRole",
    ]
    resources = ["*"]
    condition {
      test     = "StringEqualsIfExists"
      variable = "iam:PassedToService"
      values   = ["codebuild.amazonaws.com", "elasticbeanstalk.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy" "codepipeline" {
  name   = "school-admin-${var.environment}-codepipeline-policy"
  role   = aws_iam_role.codepipeline.id
  policy = data.aws_iam_policy_document.codepipeline_policy.json
}

# ── CodeBuild Projects ─────────────────────────────────────────────────────────

resource "aws_codebuild_project" "security_scan" {
  name          = "school-admin-${var.environment}-security-scan"
  description   = "CodeGuru Security scan stage"
  build_timeout = 30
  service_role  = aws_iam_role.codebuild.arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:7.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"

    environment_variable {
      name  = "ARTIFACT_BUCKET"
      value = aws_s3_bucket.artifacts.bucket
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = file("${path.module}/buildspecs/security_scan.yml")
  }

  vpc_config {
    vpc_id             = var.vpc_id
    subnets            = var.private_subnet_ids
    security_group_ids = [aws_security_group.codebuild.id]
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "/codebuild/school-admin-${var.environment}-security-scan"
      stream_name = "build"
    }
  }
}

resource "aws_codebuild_project" "build" {
  name          = "school-admin-${var.environment}-build"
  description   = "Docker build and ECR push for all three services"
  build_timeout = 30
  service_role  = aws_iam_role.codebuild.arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_MEDIUM"
    image                       = "aws/codebuild/standard:7.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = true # Required for Docker daemon

    environment_variable {
      name  = "AWS_ACCOUNT_ID"
      value = local.account_id
    }

    environment_variable {
      name  = "ECR_BACKEND_URI"
      value = aws_ecr_repository.backend.repository_url
    }

    environment_variable {
      name  = "ECR_FRONTEND_URI"
      value = aws_ecr_repository.frontend.repository_url
    }

    environment_variable {
      name  = "ECR_EXTERNAL_URI"
      value = aws_ecr_repository.external.repository_url
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = file("${path.module}/buildspecs/build.yml")
  }

  vpc_config {
    vpc_id             = var.vpc_id
    subnets            = var.private_subnet_ids
    security_group_ids = [aws_security_group.codebuild.id]
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "/codebuild/school-admin-${var.environment}-build"
      stream_name = "build"
    }
  }
}

resource "aws_codebuild_project" "test" {
  name          = "school-admin-${var.environment}-test"
  description   = "Jest tests and lint checks"
  build_timeout = 20
  service_role  = aws_iam_role.codebuild.arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:7.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = file("${path.module}/buildspecs/test.yml")
  }

  vpc_config {
    vpc_id             = var.vpc_id
    subnets            = var.private_subnet_ids
    security_group_ids = [aws_security_group.codebuild.id]
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "/codebuild/school-admin-${var.environment}-test"
      stream_name = "build"
    }
  }
}

resource "aws_codebuild_project" "deploy" {
  name          = "school-admin-${var.environment}-deploy"
  description   = "Deploy Docker images to Elastic Beanstalk environments"
  build_timeout = 30
  service_role  = aws_iam_role.codebuild.arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:7.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"

    environment_variable {
      name  = "ARTIFACT_BUCKET"
      value = aws_s3_bucket.artifacts.bucket
    }

    environment_variable {
      name  = "EB_APP_NAME"
      value = var.eb_application_name
    }

    environment_variable {
      name  = "EB_BACKEND_ENV"
      value = var.eb_backend_env_name
    }

    environment_variable {
      name  = "EB_FRONTEND_ENV"
      value = var.eb_frontend_env_name
    }

    environment_variable {
      name  = "EB_EXTERNAL_ENV"
      value = var.eb_external_env_name
    }

    environment_variable {
      name  = "ECR_BACKEND_URI"
      value = aws_ecr_repository.backend.repository_url
    }

    environment_variable {
      name  = "ECR_FRONTEND_URI"
      value = aws_ecr_repository.frontend.repository_url
    }

    environment_variable {
      name  = "ECR_EXTERNAL_URI"
      value = aws_ecr_repository.external.repository_url
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = file("${path.module}/buildspecs/deploy.yml")
  }

  vpc_config {
    vpc_id             = var.vpc_id
    subnets            = var.private_subnet_ids
    security_group_ids = [aws_security_group.codebuild.id]
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "/codebuild/school-admin-${var.environment}-deploy"
      stream_name = "build"
    }
  }
}

# ── CodePipeline ───────────────────────────────────────────────────────────────

resource "aws_codepipeline" "this" {
  name     = "school-admin-${var.environment}-pipeline"
  role_arn = aws_iam_role.codepipeline.arn

  artifact_store {
    location = aws_s3_bucket.artifacts.bucket
    type     = "S3"
  }

  # ── Stage 1: Source ─────────────────────────────────────────────────────────
  stage {
    name = "Source"

    action {
      name             = "GitHubSource"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeStarSourceConnection"
      version          = "1"
      output_artifacts = ["source_output"]

      configuration = {
        ConnectionArn        = aws_codestarconnections_connection.github.arn
        FullRepositoryId     = var.github_repo
        BranchName           = var.github_branch
        OutputArtifactFormat = "CODE_ZIP"
      }
    }
  }

  # ── Stage 2: Security Scan ──────────────────────────────────────────────────
  stage {
    name = "SecurityScan"

    action {
      name             = "CodeGuruSecurityScan"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      version          = "1"
      input_artifacts  = ["source_output"]
      output_artifacts = ["security_scan_output"]

      configuration = {
        ProjectName = aws_codebuild_project.security_scan.name
      }
    }
  }

  # ── Stage 3: Build ──────────────────────────────────────────────────────────
  stage {
    name = "Build"

    action {
      name             = "BuildDockerImages"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      version          = "1"
      input_artifacts  = ["source_output"]
      output_artifacts = ["build_output"]

      configuration = {
        ProjectName = aws_codebuild_project.build.name
      }
    }
  }

  # ── Stage 4: Test ───────────────────────────────────────────────────────────
  stage {
    name = "Test"

    action {
      name             = "RunTests"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      version          = "1"
      input_artifacts  = ["source_output"]
      output_artifacts = ["test_output"]

      configuration = {
        ProjectName = aws_codebuild_project.test.name
      }
    }
  }

  # ── Stage 5: Deploy ─────────────────────────────────────────────────────────
  stage {
    name = "Deploy"

    action {
      name            = "DeployToElasticBeanstalk"
      category        = "Build"
      owner           = "AWS"
      provider        = "CodeBuild"
      version         = "1"
      input_artifacts = ["build_output"]

      configuration = {
        ProjectName = aws_codebuild_project.deploy.name
      }
    }
  }

  tags = {
    Name = "school-admin-${var.environment}-pipeline"
  }
}

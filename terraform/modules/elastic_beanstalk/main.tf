# Resolve the latest available Docker on Amazon Linux 2023 platform automatically
data "aws_elastic_beanstalk_solution_stack" "docker" {
  most_recent = true
  name_regex  = "64bit Amazon Linux 2023.*running Docker|Docker.*64bit Amazon Linux 2023"
}

locals {
  eb_platform = data.aws_elastic_beanstalk_solution_stack.docker.name

  # Common EB environment settings shared across all three environments
  common_settings = [
    # ── Network ──────────────────────────────────────────────────────────────
    {
      namespace = "aws:ec2:vpc"
      name      = "VPCId"
      value     = var.vpc_id
    },
    {
      namespace = "aws:ec2:vpc"
      name      = "Subnets"
      value     = join(",", var.public_subnet_ids)
    },
    {
      namespace = "aws:ec2:vpc"
      name      = "ELBSubnets"
      value     = join(",", var.public_subnet_ids)
    },
    {
      namespace = "aws:ec2:vpc"
      name      = "ELBScheme"
      value     = "public"
    },
    {
      namespace = "aws:ec2:vpc"
      name      = "AssociatePublicIpAddress"
      value     = "true"
    },
    # ── Instance ─────────────────────────────────────────────────────────────
    {
      namespace = "aws:autoscaling:launchconfiguration"
      name      = "InstanceType"
      value     = var.instance_type
    },
    {
      namespace = "aws:autoscaling:launchconfiguration"
      name      = "IamInstanceProfile"
      value     = aws_iam_instance_profile.eb.name
    },
    {
      namespace = "aws:autoscaling:launchconfiguration"
      name      = "SecurityGroups"
      value     = var.eb_security_group_id
    },
    # ── Auto Scaling ──────────────────────────────────────────────────────────
    {
      namespace = "aws:autoscaling:asg"
      name      = "MinSize"
      value     = tostring(var.min_instances)
    },
    {
      namespace = "aws:autoscaling:asg"
      name      = "MaxSize"
      value     = tostring(var.max_instances)
    },
    # ── Load Balancer ─────────────────────────────────────────────────────────
    {
      namespace = "aws:elasticbeanstalk:environment"
      name      = "LoadBalancerType"
      value     = "application"
    },
    {
      namespace = "aws:elasticbeanstalk:environment"
      name      = "EnvironmentType"
      value     = "LoadBalanced"
    },
    {
      namespace = "aws:elasticbeanstalk:environment"
      name      = "ServiceRole"
      value     = aws_iam_role.eb_service.arn
    },
    # ── Health Reporting ──────────────────────────────────────────────────────
    {
      namespace = "aws:elasticbeanstalk:healthreporting:system"
      name      = "SystemType"
      value     = "enhanced"
    },
    # ── CloudWatch Logs ───────────────────────────────────────────────────────
    {
      namespace = "aws:elasticbeanstalk:cloudwatch:logs"
      name      = "StreamLogs"
      value     = "true"
    },
    {
      namespace = "aws:elasticbeanstalk:cloudwatch:logs"
      name      = "RetentionInDays"
      value     = "30"
    },
  ]
}

# ── IAM Role for EB service (used by EB control plane + appversion_lifecycle) ──

data "aws_iam_policy_document" "eb_service_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["elasticbeanstalk.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "sts:ExternalId"
      values   = ["elasticbeanstalk"]
    }
  }
}

resource "aws_iam_role" "eb_service" {
  name               = "school-admin-${var.environment}-eb-service-role"
  assume_role_policy = data.aws_iam_policy_document.eb_service_assume_role.json
}

resource "aws_iam_role_policy_attachment" "eb_service_core" {
  role       = aws_iam_role.eb_service.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkService"
}

resource "aws_iam_role_policy_attachment" "eb_service_enhanced_health" {
  role       = aws_iam_role.eb_service.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth"
}

resource "aws_iam_role_policy_attachment" "eb_service_managed_updates" {
  role       = aws_iam_role.eb_service.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy"
}

# ── IAM Role for EB EC2 instances ─────────────────────────────────────────────

data "aws_iam_policy_document" "eb_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "eb_instance" {
  name               = "school-admin-${var.environment}-eb-instance-role"
  assume_role_policy = data.aws_iam_policy_document.eb_assume_role.json
}

resource "aws_iam_role_policy_attachment" "eb_web_tier" {
  role       = aws_iam_role.eb_instance.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_role_policy_attachment" "eb_worker_tier" {
  role       = aws_iam_role.eb_instance.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier"
}

resource "aws_iam_role_policy_attachment" "eb_multicontainer_docker" {
  role       = aws_iam_role.eb_instance.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker"
}

# Allow EB instances to pull images from ECR
data "aws_iam_policy_document" "eb_ecr" {
  statement {
    sid    = "ECRReadAccess"
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "SecretsManagerReadForDB"
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
    ]
    resources = [var.db_secret_arn]
  }
}

resource "aws_iam_role_policy" "eb_ecr" {
  name   = "eb-ecr-and-secrets"
  role   = aws_iam_role.eb_instance.id
  policy = data.aws_iam_policy_document.eb_ecr.json
}

resource "aws_iam_instance_profile" "eb" {
  name = "school-admin-${var.environment}-eb-instance-profile"
  role = aws_iam_role.eb_instance.name
}

# ── Elastic Beanstalk Application ─────────────────────────────────────────────

resource "aws_elastic_beanstalk_application" "this" {
  name        = "school-admin-${var.environment}"
  description = "School Administration System - ${var.environment}"

  appversion_lifecycle {
    service_role          = aws_iam_role.eb_service.arn
    max_count             = 20
    delete_source_from_s3 = true
  }
}

# ── Backend Environment ────────────────────────────────────────────────────────

resource "aws_elastic_beanstalk_environment" "backend" {
  name                = "school-admin-${var.environment}-backend"
  application         = aws_elastic_beanstalk_application.this.name
  solution_stack_name = local.eb_platform
  tier                = "WebServer"

  dynamic "setting" {
    for_each = local.common_settings
    content {
      namespace = setting.value.namespace
      name      = setting.value.name
      value     = setting.value.value
    }
  }

  # Backend-specific: container port
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "PORT"
    value     = "3000"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_HOST"
    value     = var.aurora_endpoint
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_PORT"
    value     = tostring(var.aurora_port)
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_SCHEMA"
    value     = var.db_name
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NODE_ENV"
    value     = var.environment
  }

  # Map the container port so EB health checks work
  setting {
    namespace = "aws:elasticbeanstalk:environment:proxy"
    name      = "ProxyServer"
    value     = "none"
  }

  tags = {
    Service = "backend"
  }
}

# ── External System Environment ────────────────────────────────────────────────

resource "aws_elastic_beanstalk_environment" "external" {
  name                = "school-admin-${var.environment}-external"
  application         = aws_elastic_beanstalk_application.this.name
  solution_stack_name = local.eb_platform
  tier                = "WebServer"

  dynamic "setting" {
    for_each = local.common_settings
    content {
      namespace = setting.value.namespace
      name      = setting.value.name
      value     = setting.value.value
    }
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NODE_ENV"
    value     = var.environment
  }

  tags = {
    Service = "external"
  }
}

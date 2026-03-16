module "vpc" {
  source = "./modules/vpc"

  environment = var.environment
  vpc_cidr    = var.vpc_cidr
}

# The EB instance security group is declared at root level to break the
# circular dependency: aurora needs eb_sg_id, and eb module needs aurora outputs.
resource "aws_security_group" "eb_instances" {
  name        = "school-admin-${var.environment}-eb-instances-sg"
  description = "Elastic Beanstalk EC2 instances - allows HTTP/HTTPS inbound from ALB"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "HTTP from ALB"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from ALB"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "school-admin-${var.environment}-eb-instances-sg"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

module "aurora" {
  source = "./modules/aurora"

  environment          = var.environment
  vpc_id               = module.vpc.vpc_id
  db_subnet_ids        = module.vpc.db_subnet_ids
  eb_security_group_id = aws_security_group.eb_instances.id
  db_name              = var.db_name
  db_master_username   = var.db_master_username
  instance_class       = var.aurora_instance_class
  deletion_protection  = var.aurora_deletion_protection
  skip_final_snapshot  = var.aurora_skip_final_snapshot
}

module "elastic_beanstalk" {
  source = "./modules/elastic_beanstalk"

  environment          = var.environment
  vpc_id               = module.vpc.vpc_id
  public_subnet_ids    = module.vpc.public_subnet_ids
  eb_security_group_id = aws_security_group.eb_instances.id
  instance_type        = var.eb_instance_type
  min_instances        = var.eb_min_instances
  max_instances        = var.eb_max_instances
  db_secret_arn        = module.aurora.db_secret_arn
  aurora_endpoint      = module.aurora.cluster_endpoint
  aurora_port          = module.aurora.cluster_port
  db_name              = var.db_name
}

module "codepipeline" {
  source = "./modules/codepipeline"

  environment         = var.environment
  github_repo         = var.github_repo
  github_branch       = var.github_branch
  eb_application_name = module.elastic_beanstalk.application_name
  eb_backend_env_name = module.elastic_beanstalk.backend_env_name
  eb_external_env_name = module.elastic_beanstalk.external_env_name
  aws_region          = var.aws_region
}

module "amplify" {
  source = "./modules/amplify"

  environment         = var.environment
  github_repo         = var.github_repo
  github_branch       = var.github_branch
  github_access_token = var.github_access_token
  backend_url         = module.elastic_beanstalk.backend_env_url
}

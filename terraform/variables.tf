variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-southeast-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "staging"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod."
  }
}

# ── VPC ────────────────────────────────────────────────────────────────────────

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# ── Elastic Beanstalk ──────────────────────────────────────────────────────────

variable "eb_instance_type" {
  description = "EC2 instance type for Elastic Beanstalk environments"
  type        = string
  default     = "t3.small"
}

variable "eb_min_instances" {
  description = "Minimum number of EC2 instances per EB environment"
  type        = number
  default     = 1
}

variable "eb_max_instances" {
  description = "Maximum number of EC2 instances per EB environment"
  type        = number
  default     = 1
}

# ── Aurora ─────────────────────────────────────────────────────────────────────

variable "aurora_instance_class" {
  description = "Aurora instance class for writer and reader instances"
  type        = string
  default     = "db.t4g.small"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "school_admin"
}

variable "db_master_username" {
  description = "Aurora master username"
  type        = string
  default     = "admin"
  sensitive   = true
}

variable "aurora_deletion_protection" {
  description = "Enable deletion protection on the Aurora cluster"
  type        = bool
  default     = true
}

variable "aurora_skip_final_snapshot" {
  description = "Skip final snapshot on Aurora cluster deletion"
  type        = bool
  default     = false
}

# ── CodePipeline / GitHub ──────────────────────────────────────────────────────

variable "github_repo" {
  description = "GitHub repository in owner/repo format (e.g. acme/school-admin)"
  type        = string
}

variable "github_branch" {
  description = "GitHub branch to track for the pipeline"
  type        = string
  default     = "main"
}

variable "github_access_token" {
  description = "GitHub personal access token for Amplify to pull the repository"
  type        = string
  sensitive   = true
}

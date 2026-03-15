variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for the ALB"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for EC2 instances"
  type        = list(string)
}

variable "instance_type" {
  description = "EC2 instance type for EB environments"
  type        = string
  default     = "t3.medium"
}

variable "min_instances" {
  description = "Minimum number of EC2 instances per environment"
  type        = number
  default     = 2
}

variable "max_instances" {
  description = "Maximum number of EC2 instances per environment"
  type        = number
  default     = 4
}

variable "aurora_endpoint" {
  description = "Aurora cluster writer endpoint"
  type        = string
}

variable "aurora_port" {
  description = "Aurora cluster port"
  type        = number
  default     = 3306
}

variable "db_secret_arn" {
  description = "ARN of Secrets Manager secret for Aurora credentials"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "school_admin"
}

variable "eb_security_group_id" {
  description = "Security group ID for EB EC2 instances (created at root level)"
  type        = string
}

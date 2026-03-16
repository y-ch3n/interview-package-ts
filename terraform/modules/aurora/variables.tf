variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "db_subnet_ids" {
  description = "List of subnet IDs for the Aurora DB subnet group"
  type        = list(string)
}

variable "eb_security_group_id" {
  description = "Security group ID of the Elastic Beanstalk instances (allowed inbound to Aurora)"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_master_username" {
  description = "Aurora master username"
  type        = string
  sensitive   = true
}

variable "instance_class" {
  description = "Aurora instance class"
  type        = string
}

variable "deletion_protection" {
  description = "Enable deletion protection on the Aurora cluster"
  type        = bool
  default     = true
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot when deleting the Aurora cluster"
  type        = bool
  default     = false
}

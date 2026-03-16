variable "environment" {
  description = "Environment name"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository in owner/repo format"
  type        = string
}

variable "github_branch" {
  description = "GitHub branch to track"
  type        = string
  default     = "main"
}

variable "eb_application_name" {
  description = "Elastic Beanstalk application name"
  type        = string
}

variable "eb_backend_env_name" {
  description = "Elastic Beanstalk backend environment name"
  type        = string
}

variable "eb_external_env_name" {
  description = "Elastic Beanstalk external system environment name"
  type        = string
}

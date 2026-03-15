output "eb_security_group_id" {
  description = "Security group ID used by EB EC2 instances (referenced by Aurora SG)"
  value       = var.eb_security_group_id
}

output "application_name" {
  description = "Elastic Beanstalk application name"
  value       = aws_elastic_beanstalk_application.this.name
}

output "backend_env_name" {
  description = "Elastic Beanstalk backend environment name"
  value       = aws_elastic_beanstalk_environment.backend.name
}

output "frontend_env_name" {
  description = "Elastic Beanstalk frontend environment name"
  value       = aws_elastic_beanstalk_environment.frontend.name
}

output "external_env_name" {
  description = "Elastic Beanstalk external system environment name"
  value       = aws_elastic_beanstalk_environment.external.name
}

output "backend_env_url" {
  description = "Elastic Beanstalk backend environment URL"
  value       = "http://${aws_elastic_beanstalk_environment.backend.cname}"
}

output "frontend_env_url" {
  description = "Elastic Beanstalk frontend environment URL"
  value       = "http://${aws_elastic_beanstalk_environment.frontend.cname}"
}

output "external_env_url" {
  description = "Elastic Beanstalk external system environment URL"
  value       = "http://${aws_elastic_beanstalk_environment.external.cname}"
}

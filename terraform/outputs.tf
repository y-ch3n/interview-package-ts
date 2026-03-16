output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "aurora_cluster_endpoint" {
  description = "Aurora cluster writer endpoint"
  value       = module.aurora.cluster_endpoint
}

output "eb_backend_env_url" {
  description = "Elastic Beanstalk backend environment URL"
  value       = module.elastic_beanstalk.backend_env_url
}

output "eb_external_env_url" {
  description = "Elastic Beanstalk external system environment URL"
  value       = module.elastic_beanstalk.external_env_url
}

output "ecr_backend_repository_url" {
  description = "ECR repository URL for the backend service"
  value       = module.codepipeline.ecr_backend_url
}

output "ecr_frontend_repository_url" {
  description = "ECR repository URL for the frontend service"
  value       = module.codepipeline.ecr_frontend_url
}

output "ecr_external_repository_url" {
  description = "ECR repository URL for the external service"
  value       = module.codepipeline.ecr_external_url
}

output "codepipeline_name" {
  description = "Name of the CodePipeline"
  value       = module.codepipeline.pipeline_name
}

output "codestar_connection_arn" {
  description = "CodeStar GitHub connection ARN — must be manually activated in the AWS Console before the pipeline can run"
  value       = module.codepipeline.codestar_connection_arn
}

output "db_secret_arn" {
  description = "ARN of the Secrets Manager secret holding Aurora credentials"
  value       = module.aurora.db_secret_arn
  sensitive   = true
}

output "amplify_frontend_url" {
  description = "Amplify hosted frontend URL"
  value       = module.amplify.frontend_url
}

output "pipeline_name" {
  description = "CodePipeline name"
  value       = aws_codepipeline.this.name
}

output "pipeline_arn" {
  description = "CodePipeline ARN"
  value       = aws_codepipeline.this.arn
}

output "codestar_connection_arn" {
  description = "CodeStar GitHub connection ARN — must be manually activated in the AWS Console"
  value       = aws_codestarconnections_connection.github.arn
}

output "ecr_backend_url" {
  description = "ECR repository URL for the backend image"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  description = "ECR repository URL for the frontend image"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_external_url" {
  description = "ECR repository URL for the external system image"
  value       = aws_ecr_repository.external.repository_url
}

output "artifact_bucket_name" {
  description = "S3 artifact bucket name"
  value       = aws_s3_bucket.artifacts.bucket
}

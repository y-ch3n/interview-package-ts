output "cluster_endpoint" {
  description = "Aurora cluster writer endpoint"
  value       = aws_rds_cluster.this.endpoint
}

output "cluster_port" {
  description = "Aurora cluster port"
  value       = aws_rds_cluster.this.port
}

output "db_secret_arn" {
  description = "ARN of the Secrets Manager secret containing Aurora credentials"
  value       = aws_rds_cluster.this.master_user_secret[0].secret_arn
  sensitive   = true
}

output "aurora_security_group_id" {
  description = "Security group ID attached to the Aurora cluster"
  value       = aws_security_group.aurora.id
}

output "app_id" {
  description = "Amplify app ID"
  value       = aws_amplify_app.frontend.id
}

output "default_domain" {
  description = "Amplify default domain"
  value       = aws_amplify_app.frontend.default_domain
}

output "frontend_url" {
  description = "Amplify frontend URL for the deployed branch"
  value       = "https://${var.github_branch}.${aws_amplify_app.frontend.default_domain}"
}

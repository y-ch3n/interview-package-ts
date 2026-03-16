variable "environment" {
  description = "Environment name"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository in owner/repo format"
  type        = string
}

variable "github_branch" {
  description = "GitHub branch to deploy"
  type        = string
  default     = "main"
}

variable "github_access_token" {
  description = "GitHub access token for Amplify"
  type        = string
}

variable "backend_url" {
  description = "Backend API URL injected as VITE_BACKEND_URL build-time env var"
  type        = string
}

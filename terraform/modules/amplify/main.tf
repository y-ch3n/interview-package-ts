resource "aws_amplify_app" "frontend" {
  name         = "school-admin-${var.environment}-frontend"
  repository   = "https://github.com/${var.github_repo}"
  access_token = var.github_access_token

  # Vite outputs to dist/
  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - cd frontend
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: frontend/dist
        files:
          - '**/*'
      cache:
        paths:
          - frontend/node_modules/**/*
  EOT

  environment_variables = {
    VITE_BACKEND_URL = var.backend_url
    NODE_ENV         = var.environment
  }

  # Redirect all paths to index.html for client-side routing
  custom_rule {
    source = "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>"
    target = "/index.html"
    status = "200"
  }

  tags = {
    Environment = var.environment
  }
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = var.github_branch
  stage       = "PRODUCTION"

  enable_auto_build = true

  environment_variables = {
    VITE_BACKEND_URL = var.backend_url
    NODE_ENV         = var.environment
  }
}

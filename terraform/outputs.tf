# ── Outputs ──────────────────────────────────────────────
# Values Terraform prints after applying infrastructure

output "project_name" {
  description = "The name of the Vogue Events Vercel project"
  value       = vercel_project.vogue_events.name
}

output "project_id" {
  description = "The Vercel project ID"
  value       = vercel_project.vogue_events.id
}

output "production_url" {
  description = "Production deployment URL"
  value       = "https://${var.project_name}.vercel.app"
}

output "environment" {
  description = "Current deployment environment"
  value       = var.environment
}

output "session_secret_length" {
  description = "Length of the generated session secret"
  value       = length(random_password.session_secret.result)
  sensitive   = true
}

output "infrastructure_summary" {
  description = "Summary of provisioned infrastructure"
  value = {
    project     = vercel_project.vogue_events.name
    framework   = "Next.js 16"
    environment = var.environment
    region      = "iad1 (Washington D.C.)"
    env_vars    = 5
  }
}

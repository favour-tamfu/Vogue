# ── Input Variables ─────────────────────────────────────

variable "vercel_api_token" {
  description = "Vercel API token for deployment management"
  type        = string
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel team ID (leave empty for personal account)"
  type        = string
  default     = ""
}

variable "project_name" {
  description = "Name of the Vercel project"
  type        = string
  default     = "vogue-events"
}

variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
  sensitive   = true
}

variable "supabase_anon_key" {
  description = "Supabase anon key"
  type        = string
  sensitive   = true
}

variable "supabase_service_role_key" {
  description = "Supabase service role key"
  type        = string
  sensitive   = true
}

variable "admin_password" {
  description = "Admin panel password"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

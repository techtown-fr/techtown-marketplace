variable "app_name" {
  description = "Nom de l'application (utilisé comme préfixe pour toutes les ressources)"
  type        = string
}

variable "container_image" {
  description = "Image Docker à déployer sur Cloud Run (ex: europe-west1-docker.pkg.dev/project/repo/app:latest)"
  type        = string
}

variable "environment" {
  description = "Environnement de déploiement"
  type        = string
  default     = "production"
}

variable "project_id" {
  description = "ID du projet GCP"
  type        = string
}

variable "region" {
  description = "Région GCP (doit être europe-west*)"
  type        = string
  default     = "europe-west1"

  validation {
    condition     = can(regex("^europe-west[1-9]$", var.region))
    error_message = "La région doit être europe-west1 à europe-west9."
  }
}

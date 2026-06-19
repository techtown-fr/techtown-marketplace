terraform {
  required_version = ">= 1.7"

  backend "gcs" {
    bucket = "<PROJECT_ID>-tfstate"
    prefix = "terraform/state"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_project_service" "apis" {
  for_each = toset([
    "cloudrun.googleapis.com",
    "secretmanager.googleapis.com",
    "sqladmin.googleapis.com",
  ])

  service            = each.key
  disable_on_destroy = false
}

locals {
  common_labels = {
    app     = var.app_name
    env     = var.environment
    managed = "terraform"
    team    = "techtown"
  }
}

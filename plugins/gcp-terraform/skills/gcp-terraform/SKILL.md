---
name: gcp-terraform
description: TechTown Terraform conventions for GCP infrastructure (Cloud Run, Cloud SQL, Secret Manager). USE WHEN writing Terraform for GCP, setting up Cloud Run, Cloud SQL PostgreSQL, Secret Manager, or any TechTown IaC infrastructure. Covers conventions HashiCorp TechTown, security rules, and europe-west region constraint.
allowed-tools: Read, Write, Edit, Bash, AskUserQuestion
---

# GCP Terraform — Conventions TechTown

## Conventions obligatoires

- **Style** : [HashiCorp Style Guide](https://developer.hashicorp.com/terraform/language/style)
- **Un fichier par ressource** : `cloud-run.tf`, `cloud-sql.tf`, `secrets.tf`, etc.
- **`for_each` plutôt que `count`** — toujours
- **`labels = local.common_labels`** sur TOUTES les ressources
- **`depends_on` explicite** pour les APIs et les IAM bindings
- **Ordre alphabétique** pour les variables et les outputs
- **Région** : `europe-west[1-9]` uniquement

## Fichiers standards

| Fichier | Rôle |
|---------|------|
| `main.tf` | APIs GCP activées + `locals` |
| `cloud-run.tf` | Service Cloud Run |
| `cloud-sql.tf` | Instance Cloud SQL PostgreSQL |
| `secrets.tf` | Secrets Manager + passwords |
| `service-account.tf` | Comptes de service + IAM |
| `variables.tf` | Variables d'entrée (ordre alphabétique) |
| `outputs.tf` | Valeurs exportées (ordre alphabétique) |
| `terraform.tf` | Bloc `terraform` + `required_providers` |

## `locals` standard

```hcl
locals {
  common_labels = {
    app     = var.app_name
    env     = var.environment
    managed = "terraform"
    team    = "techtown"
  }
}
```

## Cloud Run pattern

```hcl
resource "google_cloud_run_v2_service" "app" {
  name     = var.app_name
  location = var.region
  labels   = local.common_labels

  template {
    service_account = google_service_account.app.email

    containers {
      image = var.container_image

      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.db_url.secret_id
            version = "latest"
          }
        }
      }
    }
  }

  depends_on = [
    google_project_service.apis,
    google_secret_manager_secret_iam_member.app_db_url,
  ]
}

resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  name     = google_cloud_run_v2_service.app.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}
```

## Cloud SQL pattern

```hcl
resource "google_sql_database_instance" "main" {
  name             = "${var.app_name}-db"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = "db-f1-micro"

    backup_configuration {
      enabled    = true
      start_time = "03:00"
    }

    ip_configuration {
      ipv4_enabled = false
    }
  }

  deletion_protection = true  # OBLIGATOIRE

  depends_on = [google_project_service.apis]
}
```

## Secret Manager pattern

```hcl
resource "random_password" "db" {
  length  = 32
  special = true
}

resource "google_secret_manager_secret" "db_password" {
  secret_id = "${var.app_name}-db-password"
  labels    = local.common_labels

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db.result
}
```

## Règles de sécurité

- `deletion_protection = true` sur Cloud SQL — JAMAIS désactiver en prod
- Secrets via Secret Manager uniquement — jamais de valeur en dur dans les `.tf`
- Utiliser `random_password` pour les mots de passe auto-générés
- Comptes de service avec le principe du moindre privilège
- `terraform.tfvars` dans `.gitignore` (contient des valeurs spécifiques)
- État Terraform dans un bucket GCS (`state_bucket` dans `terraform.tf`)

## Variables obligatoires

```hcl
variable "app_name"   { type = string }
variable "environment" { type = string; default = "production" }
variable "project_id" { type = string }
variable "region"     { type = string; default = "europe-west1" }
```

## Commandes

```bash
terraform init
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
```

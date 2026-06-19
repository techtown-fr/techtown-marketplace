# gcp-terraform

Conventions Terraform TechTown pour GCP : Cloud Run, Cloud SQL PostgreSQL, Secret Manager.

## Templates fournis

| Fichier | Ressource |
|---------|-----------|
| `main.tf` | Provider, APIs, locals |
| `cloud-run.tf` | Service Cloud Run v2 |
| `cloud-sql.tf` | Instance PostgreSQL 15 |
| `secrets.tf` | Secret Manager + passwords |
| `service-account.tf` | SA + IAM bindings |
| `variables.tf` | Variables typées avec validations |
| `outputs.tf` | URLs et noms exportés |
| `terraform.tfvars.example` | Exemple de valeurs |

## Invariants

- `deletion_protection = true` sur Cloud SQL — jamais désactivé en prod
- Région `europe-west[1-9]` uniquement (validation Terraform incluse)
- Secrets via Secret Manager uniquement

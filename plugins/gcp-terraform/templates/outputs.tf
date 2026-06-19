output "cloud_run_url" {
  description = "URL du service Cloud Run"
  value       = google_cloud_run_v2_service.app.uri
}

output "database_instance_name" {
  description = "Nom de l'instance Cloud SQL"
  value       = google_sql_database_instance.main.name
}

output "service_account_email" {
  description = "Email du compte de service applicatif"
  value       = google_service_account.app.email
}

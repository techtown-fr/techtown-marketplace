resource "google_service_account" "app" {
  account_id   = var.app_name
  display_name = "${var.app_name} Service Account"
  project      = var.project_id
}

resource "google_project_iam_member" "app_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.app.email}"
}

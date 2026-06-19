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

  deletion_protection = true

  depends_on = [google_project_service.apis]
}

resource "google_sql_database" "app" {
  name     = var.app_name
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "app" {
  name     = var.app_name
  instance = google_sql_database_instance.main.name
  password = random_password.db.result
}

resource "google_sql_database_instance" "pgsql-db" {
  name                = "${local.name}-pgsql-14"
  database_version    = "POSTGRES_14"
  region              = local.gcp_region
  deletion_protection = true

  settings {
    tier              = "db-g1-small"
    availability_type = "ZONAL"
    disk_autoresize   = true
    disk_type         = "PD_SSD"

    insights_config {
      query_insights_enabled = true
    }

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      start_time                     = "00:00"
      location                       = local.gcp_region
    }

    maintenance_window {
      day  = 7
      hour = 0
    }

    ip_configuration {
      authorized_networks {
        name  = "smartive AG"
        value = "85.195.221.58/32"
      }
    }
  }
}

output "pgsql-db-name" {
  value = google_sql_database_instance.pgsql-db.name
}

output "pgsql-db-instance-connection-name" {
  value = google_sql_database_instance.pgsql-db.connection_name
}

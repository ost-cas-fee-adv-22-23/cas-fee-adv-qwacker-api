resource "google_cloud_run_service" "api" {
  for_each = {
    http = {
      port_type = "http1"
      port      = 8080
    },
    grpc = {
      port_type = "h2c"
      port      = 5000
    },
  }

  name                       = "${local.name}-${each.key}-${local.env}"
  location                   = local.gcp_region
  autogenerate_revision_name = true

  template {
    metadata {
      annotations = {
        "run.googleapis.com/cloudsql-instances" = data.terraform_remote_state.shared.outputs.pgsql-db-instance-connection-name
      }
    }

    spec {
      containers {
        image = "europe-west6-docker.pkg.dev/ost-cas-adv-fee/qwacker-api-docker/cas-fee-adv-qwacker-api:${var.release_version}"

        resources {
          limits = {
            "memory" = "256Mi"
          }
        }

        ports {
          name           = each.value.port_type
          container_port = each.value.port
        }

        env {
          name  = "HTTP_PORT"
          value = "8080"
        }

        env {
          name  = "GRPC_PORT"
          value = "5000"
        }

        env {
          name  = "DATABASE_HOST"
          value = data.terraform_remote_state.shared.outputs.pgsql-db-instance-connection-name
        }

        env {
          name  = "DATABASE_PORT"
          value = "5432"
        }

        env {
          name  = "DATABASE_NAME"
          value = google_sql_database.db.name
        }

        env {
          name  = "DATABASE_USER"
          value = google_sql_user.db-user.name
        }

        env {
          name = "DATABASE_PASS"
          value_from {
            secret_key_ref {
              key  = "latest"
              name = google_secret_manager_secret.db-pass.secret_id
            }
          }
        }

        env {
          name  = "STORAGE_BUCKET_NAME"
          value = google_storage_bucket.gcs-bucket.name
        }

        env {
          name = "STORAGE_SERVICE_ACCOUNT"
          value_from {
            secret_key_ref {
              key  = "latest"
              name = google_secret_manager_secret.storage-access.secret_id
            }
          }
        }

        env {
          name  = "AUTH_ISSUER"
          value = "https://${local.zitadel_issuer}"
        }

        env {
          name = "AUTH_JWT_KEY"
          value_from {
            secret_key_ref {
              key  = "latest"
              name = google_secret_manager_secret.api-auth-jwt.secret_id
            }
          }
        }

      }

      service_account_name = data.terraform_remote_state.shared.outputs.cloud-runner-email
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [
    google_secret_manager_secret_version.db-pass,
    google_secret_manager_secret_iam_member.db-pass,
    google_secret_manager_secret_version.storage-access,
    google_secret_manager_secret_iam_member.storage-access,
    google_secret_manager_secret_version.api-auth-jwt,
    google_secret_manager_secret_iam_member.api-auth-jwt,
  ]
}

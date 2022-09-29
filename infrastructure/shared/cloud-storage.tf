resource "google_storage_bucket" "gcs-bucket-local-dev" {
  name     = "local-dev-${local.name}-data"
  location = local.gcp_region
}

resource "google_storage_bucket_access_control" "gcs-bucket-local-dev" {
  bucket = google_storage_bucket.gcs-bucket-local-dev.name
  role   = "READER"
  entity = "allUsers"
}

resource "google_service_account" "local-dev-gcs-access" {
  account_id   = "${local.name}-gcs-local"
  display_name = "Storage Access Local Development"
  description  = "Account to access the local dev gcs bucket."
}

resource "google_storage_bucket_iam_member" "local-dev-gcs-iam" {
  bucket = google_storage_bucket.gcs-bucket-local-dev.name
  role   = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.local-dev-gcs-access.email}"
}

resource "google_service_account_key" "local-dev-gcs-access-key" {
  service_account_id = google_service_account.local-dev-gcs-access.id
}

resource "google_storage_bucket_object" "local-dev-gcs-access-key-file" {
  name         = "local-dev-sa-key.json"
  content_type = "application/json; charset=utf-8"
  bucket       = data.google_storage_bucket.terraform.name
  content      = base64decode(google_service_account_key.local-dev-gcs-access-key.private_key)
}

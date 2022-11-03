resource "google_storage_bucket" "gcs-bucket" {
  name                        = "${local.name}-${local.env}-data"
  location                    = local.gcp_region
  uniform_bucket_level_access = false
}

resource "google_storage_bucket_access_control" "gcs-bucket" {
  for_each = toset([
    "READER",
    "roles/storage.objectViewer",
  ])
  role   = each.key
  bucket = google_storage_bucket.gcs-bucket.name
  entity = "allUsers"
}

resource "google_service_account" "gcs-access" {
  account_id   = "${local.name}-${local.env}-gcs"
  display_name = "Storage Access ${local.env}"
  description  = "Account to access the ${local.env} gcs bucket."
}

resource "google_storage_bucket_iam_member" "gcs-iam" {
  bucket = google_storage_bucket.gcs-bucket.name
  role   = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.gcs-access.email}"
}

resource "google_service_account_key" "gcs-access-key" {
  service_account_id = google_service_account.gcs-access.id
}

# Resources that allow automated deployment of the infrastructure

data "google_storage_bucket" "terraform" {
  name = "cas-fee-adv-qwacker-api-terraform"
}

resource "google_service_account" "tf-deployer" {
  account_id   = "${local.name}-terraform-deployer"
  display_name = "Terraform Deployer"
  description  = "Account to deploy terraform stuff in this project."
}

resource "google_service_account_key" "tf-deployer-key" {
  service_account_id = google_service_account.tf-deployer.id
}

resource "google_storage_bucket_object" "tf-deployer-key-file" {
  name         = "tf-deployer.json"
  content_type = "application/json; charset=utf-8"
  bucket       = data.google_storage_bucket.terraform.name
  content      = base64decode(google_service_account_key.tf-deployer-key.private_key)
}

resource "google_project_iam_binding" "tf-deployer-owner" {
  role    = "roles/owner"
  members = ["serviceAccount:${google_service_account.tf-deployer.email}"]
  project = data.google_project.project.id
}

output "tf-deployer-email" {
  value = google_service_account.tf-deployer.email
}

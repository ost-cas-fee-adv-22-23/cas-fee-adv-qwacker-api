resource "google_artifact_registry_repository" "docker" {
  location      = local.gcp_region
  repository_id = "${local.name}-docker"
  description   = "Docker related repository for ${local.name} images."
  format        = "DOCKER"
}

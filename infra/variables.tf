variable "aws_region" {
  description = "AWS region to deploy into."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource names and the Project tag."
  type        = string
  default     = "hotel-rooms"

  validation {
    condition     = can(regex("^[a-z0-9-]{3,32}$", var.project_name))
    error_message = "project_name must be 3-32 chars: lowercase letters, digits and hyphens."
  }
}

variable "environment" {
  description = "Environment name used for the Environment tag."
  type        = string
  default     = "dev"
}

variable "instance_type" {
  description = "EC2 instance type. t3.small (2 GB RAM) is recommended to build the images; t3.micro / t2.micro are free-tier alternatives but may be slow or run low on memory during builds (a swap file is created)."
  type        = string
  default     = "t3.small"

  validation {
    condition     = can(regex("^[a-z][a-z0-9]*\\.[a-z0-9]+$", var.instance_type))
    error_message = "instance_type must look like 't3.small'."
  }
}

variable "root_volume_size" {
  description = "Root EBS volume size in GB (gp3, encrypted)."
  type        = number
  default     = 20

  validation {
    condition     = var.root_volume_size >= 8 && var.root_volume_size <= 200
    error_message = "root_volume_size must be between 8 and 200 GB."
  }
}

variable "swap_size_mb" {
  description = "Size in MB of the swap file created on the instance. Set 0 to disable."
  type        = number
  default     = 1024

  validation {
    condition     = var.swap_size_mb >= 0
    error_message = "swap_size_mb must be >= 0."
  }
}

variable "ssh_allowed_cidr" {
  description = "CIDR allowed to reach SSH (port 22). WARNING: the default 0.0.0.0/0 exposes SSH to the whole internet; restrict it to your IP (e.g. 203.0.113.10/32) whenever possible."
  type        = string
  default     = "0.0.0.0/0"

  validation {
    condition     = can(cidrhost(var.ssh_allowed_cidr, 0))
    error_message = "ssh_allowed_cidr must be a valid IPv4 CIDR block, e.g. 203.0.113.10/32."
  }
}

variable "create_key_pair" {
  description = "If true, Terraform generates an SSH key pair and writes the private key to a local .pem file. If false, set existing_key_name."
  type        = bool
  default     = true
}

variable "existing_key_name" {
  description = "Name of an existing EC2 key pair. Only used when create_key_pair = false."
  type        = string
  default     = ""
}

variable "private_key_path" {
  description = "Local path where the generated private key (.pem) is written when create_key_pair = true."
  type        = string
  default     = "./hotel-key.pem"
}

variable "repo_url" {
  description = "HTTPS URL of the public Git repository containing the app (docker-compose.yml at the root)."
  type        = string

  validation {
    condition     = can(regex("^https://", var.repo_url))
    error_message = "repo_url must be an https:// URL, e.g. https://github.com/<user>/crud-hotel.git."
  }
}

variable "repo_branch" {
  description = "Git branch to deploy."
  type        = string
  default     = "main"
}

variable "compose_version" {
  description = "Docker Compose plugin release to install (GitHub release tag)."
  type        = string
  default     = "v2.29.7"

  validation {
    condition     = can(regex("^v[0-9]+\\.[0-9]+\\.[0-9]+$", var.compose_version))
    error_message = "compose_version must look like v2.29.7."
  }
}

variable "db_name" {
  description = "PostgreSQL database name."
  type        = string
  default     = "hotel"
}

variable "db_user" {
  description = "PostgreSQL user."
  type        = string
  default     = "hotel"
}

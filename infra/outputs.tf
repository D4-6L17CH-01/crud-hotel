output "public_ip" {
  description = "Elastic IP of the instance."
  value       = aws_eip.app.public_ip
}

output "app_url" {
  description = "URL of the application (allow a few minutes after apply for the first build)."
  value       = "http://${aws_eip.app.public_ip}"
}

output "private_key_path" {
  description = "Local path of the generated SSH private key (null if not generated)."
  value       = var.create_key_pair ? var.private_key_path : null
}

output "ssh_command" {
  description = "Command to SSH into the instance."
  value       = var.create_key_pair ? "ssh -i ${var.private_key_path} ec2-user@${aws_eip.app.public_ip}" : "ssh -i <path-to-${var.existing_key_name}.pem> ec2-user@${aws_eip.app.public_ip}"
}

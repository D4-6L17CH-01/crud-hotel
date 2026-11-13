# Infra: Hotel Rooms on AWS EC2

Terraform (>= 1.5, AWS provider ~> 5.0) creates: security group (80 open, 22 from `ssh_allowed_cidr`), one Amazon Linux 2023 EC2 instance in the default VPC (gp3 20 GB encrypted, IMDSv2), an Elastic IP, and optionally an SSH key pair written to a local `.pem`. On first boot, `user_data` installs Docker + Compose, clones `repo_url` into `/opt/hotel`, writes `.env` (random DB password) and runs `docker compose up -d --build`.

## Prerequisites
- AWS credentials configured (`aws configure` or env vars).
- The app pushed to a **public** Git repo with `docker-compose.yml` at its root.

## Usage
```bash
cd infra
cp terraform.tfvars.example terraform.tfvars   # set repo_url, ssh_allowed_cidr
terraform init
terraform plan
terraform apply
```
Outputs: `public_ip`, `app_url`, `ssh_command`, `private_key_path`. The first build takes several minutes after `apply` returns; follow it with:
```bash
ssh -i hotel-key.pem ec2-user@<public_ip> 'sudo tail -f /var/log/user-data.log'
```

Tear down everything (also releases the Elastic IP):
```bash
terraform destroy
```

## Notes
- Cost: t3.small is roughly US$0.02/h (~US$15/month) plus EBS and a public IPv4 charge (~US$3.6/month). Use `instance_type = "t3.micro"` (or `t2.micro`) for free-tier eligible accounts; builds will be slower. Run `terraform destroy` when done.
- Security: `ssh_allowed_cidr` defaults to `0.0.0.0/0`; set it to your IP (`x.x.x.x/32`).
- State and the `.pem` contain secrets (DB password, private key) and are git-ignored; do not commit them.
- Changing `user_data` inputs (repo, branch, DB settings) replaces the instance.
- On Windows the `0400` file mode is not enforced by the OS.

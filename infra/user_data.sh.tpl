#!/bin/bash
# Rendered by Terraform templatefile(). Literal shell variables use $${...} to escape.
set -euxo pipefail
exec > >(tee -a /var/log/user-data.log) 2>&1
echo "=== user-data start: $(date -u) ==="

# --- Swap (helps image builds on small instances) ---
if [ "${swap_size_mb}" -gt 0 ] && [ ! -f /swapfile ]; then
  dd if=/dev/zero of=/swapfile bs=1M count=${swap_size_mb} status=none
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# --- Docker + git ---
dnf install -y docker git
systemctl enable --now docker
usermod -aG docker ec2-user

# --- Docker Compose plugin ---
ARCH="$(uname -m)"
mkdir -p /usr/local/lib/docker/cli-plugins
curl -fsSL "https://github.com/docker/compose/releases/download/${compose_version}/docker-compose-linux-$${ARCH}" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
docker compose version

# --- App ---
rm -rf /opt/hotel
git clone --depth 1 --branch "${repo_branch}" "${repo_url}" /opt/hotel
cd /opt/hotel

cat > .env <<ENVEOF
POSTGRES_USER=${db_user}
POSTGRES_PASSWORD=${db_password}
POSTGRES_DB=${db_name}
DB_HOST=db
DB_PORT=5432
DB_USER=${db_user}
DB_PASSWORD=${db_password}
DB_NAME=${db_name}
ENVEOF
chmod 600 .env

docker compose up -d --build

echo "=== user-data done: $(date -u) ==="

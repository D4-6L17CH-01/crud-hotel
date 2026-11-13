# Hotel Rooms CRUD

Cloud Computing course project: a room-management CRUD for a hotel, packaged as a
three-container Docker Compose service and deployed to an AWS EC2 instance with Terraform.

| Layer    | Technology                      | Notes                                         |
| -------- | ------------------------------- | --------------------------------------------- |
| Frontend | Next.js (App Router) + Tailwind | Only published service (host port 80)         |
| Backend  | NestJS + TypeORM                | REST API under `/api`, internal network only  |
| Database | PostgreSQL 16                   | Persisted in the named volume `pgdata`        |
| Infra    | Terraform (AWS)                 | EC2 + Elastic IP + security group + key pair  |

The browser only talks to the frontend. Next.js rewrites `/api/*` to `http://backend:3001/api/*`
inside the Docker network, so there is no CORS and the API and database are never exposed.

## Run locally

Requires Docker Desktop running.

```bash
cp example.env .env      # then edit POSTGRES_PASSWORD
docker compose up --build
```

Open http://localhost:8080 (`APP_PORT` in `.env`).

Data survives `docker compose down`; use `docker compose down -v` to wipe the volume.

## API

| Method | Path             | Description        |
| ------ | ---------------- | ------------------ |
| GET    | `/api/rooms`     | List rooms         |
| GET    | `/api/rooms/:id` | Get one room       |
| POST   | `/api/rooms`     | Create a room      |
| PATCH  | `/api/rooms/:id` | Update a room      |
| DELETE | `/api/rooms/:id` | Delete (204)       |
| GET    | `/api/health`    | Health check       |

Room fields: `number`, `type` (single | double | suite), `pricePerNight`, `capacity`,
`status` (available | occupied | maintenance), `description`.

## Deploy to AWS

1. Push this repository to a **public** GitHub repo (the EC2 instance clones it over HTTPS).
2. Install Terraform and the AWS CLI, then run `aws configure`.
3. Deploy:

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars   # set repo_url
terraform init
terraform plan
terraform apply
```

4. Wait a few minutes for the first boot (Docker install + image build), then open the
   `app_url` output. Debug with `ssh` (output `ssh_command`) and `/var/log/user-data.log`.
5. Remove everything when done to avoid charges: `terraform destroy`.

See [infra/README.md](infra/README.md) for variables and cost notes.

## Project layout

```
backend/            NestJS API + Dockerfile
frontend/           Next.js UI + Dockerfile
infra/              Terraform
docker-compose.yml  The three services
```

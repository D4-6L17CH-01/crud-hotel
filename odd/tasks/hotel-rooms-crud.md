# Feature: hotel-rooms-crud

Objective: Hotel Rooms CRUD, 3 containers (Postgres, NestJS, Next.js) via Docker Compose, deployed to AWS EC2 with Terraform.

## Contract (shared by all writers)
- Entity `Room`: id (uuid), number (string, unique, 1-10 chars), type (`single|double|suite`), pricePerNight (number, >0, 2 decimals), capacity (int 1-10), status (`available|occupied|maintenance`, default available), description (string, optional, max 300), createdAt, updatedAt.
- REST (backend port 3001, global prefix `/api`): GET /api/rooms, GET /api/rooms/:id, POST /api/rooms, PATCH /api/rooms/:id, DELETE /api/rooms/:id (204). GET /api/health -> {status:"ok"}.
- Frontend (Next.js App Router, port 3000) calls same-origin `/api/*`; next.config rewrites `/api/:path*` -> `http://backend:3001/api/:path*`.
- Compose services: `db` (postgres:16-alpine, named volume `pgdata`), `backend`, `frontend` (host port 80 -> 3000). Only frontend is published.
- DB env: POSTGRES_USER/PASSWORD/DB via `.env`; backend uses DB_HOST=db, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME.

## Tasks
- [ ] T1 backend/ NestJS + TypeORM + validation + Dockerfile (route: delegated, writer)
- [ ] T2 frontend/ Next.js + Tailwind UI + Dockerfile (route: delegated, writer)
- [ ] T3 infra/ Terraform (VPC default, SG, EC2 + user_data, EIP) (route: delegated, writer)
- [ ] T4 docker-compose.yml, .env.example, README (route: inline)
- [ ] T5 Local verification: compose build/up + CRUD smoke test

TDD: not configured; functional checks only (build + smoke test).

# fastly-ts-api

Small, production-leaning **Task API** built with **Fastify + TypeScript + Prisma + Postgres**.

I put this together as a clean backend reference: auth, validation, DB access, error handling, and a structure that is easy to talk through in a review.

---

## What’s actually in here

- Fastify server (TypeScript)
- Prisma for DB access
- Postgres database
- JWT auth (register/login)
- Tasks CRUD
- Zod input validation
- Centralized error handling
- Minimal tests

---

## Repo layout (short version)

apps/
  api/                 # Fastify API (TypeScript + Prisma)
  web/                 # Optional React client to test the API
infra/                 # Docker Compose files
packages/
  types/               # Shared TypeScript types (API + Web)

App-specific docs:
- API: apps/api/README-api.md
- Web: apps/web/README-web.md

---

## If you want to reproduce this setup (copy/paste friendly)

This is the exact order I used to get Fastify + Prisma running. It’s written to be copied into a new project and tweaked.

### 1) Bootstrap the project

```bash
mkdir fastify-ts-api
cd fastify-ts-api
pnpm init
```

### 2) Install runtime deps

```bash
pnpm add fastify fastify-plugin @fastify/jwt @fastify/sensible @fastify/rate-limit zod dotenv pino pg @prisma/client @prisma/adapter-pg argon2
```

### 3) Install dev deps

```bash
pnpm add -D typescript tsx @types/node prisma eslint vitest
```

### 4) Initialize Prisma

```bash
pnpm prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma`. Define your models there. Mine are `User` and `Task`.

### 5) Create the database tables

```bash
pnpm prisma migrate dev --name init
```

### 6) Add env vars

Create a `.env` file (example from this repo):

```bash
NODE_ENV=development
PORT=3000
APP_PATH=/
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fastly_ts_api?schema=public
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=15m
```

### 7) Wire Fastify + Prisma

What I did in code:
- Create the Fastify app in `src/app.ts`
- Register plugins (JWT, sensible, rate-limit)
- Create a Prisma client in `src/lib/prisma.ts`
- Mount routes under a single `APP_PATH` prefix

### 8) Run the API

```bash
pnpm tsx watch src/index.ts
```

Health check:

```
GET /health
```

---

## API Examples

I keep these in curl form so I can paste them quickly when I’m testing.

Register:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"super-secret"}'
```

Login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"super-secret"}'
```

Create task (replace TOKEN):

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Ship v1"}'
```

List tasks (replace TOKEN):

```bash
curl http://localhost:3000/tasks \
  -H "Authorization: Bearer TOKEN"
```

---

## Common setups

```
APP_PATH=/
APP_PATH=/api
```

---

## Running this repo locally (no Docker)

```bash
pnpm install
pnpm dev:api
```

You still need Postgres running and a valid `DATABASE_URL` in `apps/api/.env`.

---

## Running with Docker (API only)

```bash
docker compose -f infra/docker-compose.api.yml up --build
```

The API is at:
- `http://localhost:3000` when `APP_PATH=/`
- `http://localhost:3000/api` when `APP_PATH=/api`

---

## Hosting under a subpath (APP_PATH)

If you want `/api` instead of `/`, set:

```
APP_PATH=/api
```

I keep internal route definitions prefix-free and mount everything under a single prefix. Makes reverse proxies much easier.

---

## Why this exists

I wanted a backend template that feels realistic but still easy to review. No framework hype — just a small API with clean, explainable pieces.

---

## License

MIT

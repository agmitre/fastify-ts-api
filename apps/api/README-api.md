# fastly-ts-api API (apps/api)

This is the Fastify + TypeScript API for **fastly-ts-api**. I kept it small on purpose, but the structure is real-world: auth, validation, DB access, errors, and clean routing.

---

## Stack

- Fastify (HTTP server)
- TypeScript
- Prisma (DB access)
- Postgres (database)
- JWT (auth)
- Zod (validation)

---

## If you want to recreate this API from scratch

This is the exact order I used. You can copy/paste it into a new repo and tweak names.

### 1) Create the project and install deps

```bash
mkdir fastify-ts-api
cd fastify-ts-api
pnpm init
pnpm add fastify fastify-plugin @fastify/jwt @fastify/sensible @fastify/rate-limit zod dotenv pino pg @prisma/client @prisma/adapter-pg argon2
pnpm add -D typescript tsx @types/node prisma eslint vitest
```

### 2) Initialize Prisma and define models

```bash
pnpm prisma init --datasource-provider postgresql
```

Open `prisma/schema.prisma` and define your models. In this repo I use `User` and `Task`.

### 3) Create the database schema

```bash
pnpm prisma migrate dev --name init
```

This generates a migration under `prisma/migrations/`.

### 4) Add env vars

Create `.env`:

```bash
NODE_ENV=development
PORT=3000
APP_PATH=/
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fastly_ts_api?schema=public
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=15m
```

### 5) Wire the app

What I did in code:
- Build the Fastify instance in `src/app.ts`
- Register plugins (JWT, sensible, rate-limit)
- Create the Prisma client in `src/lib/prisma.ts`
- Use a single `APP_PATH` prefix when registering routes

### 6) Run it

```bash
pnpm tsx watch src/index.ts
```

Health check:

```
GET /health
```

---

## Running this repo

From repo root:

```bash
pnpm install
pnpm dev:api
```

You still need Postgres running and a valid `DATABASE_URL` in `apps/api/.env`.

---

## Docker (recommended for local dev)

```bash
docker compose -f infra/docker-compose.api.yml up --build
```

The API will be available at:
- `http://localhost:3000` when `APP_PATH=/`
- `http://localhost:3000/api` when `APP_PATH=/api`

Health:
- `GET /health` (or `/api/health`)

---

## Environment variables

Set via `.env` or Docker Compose:

- `NODE_ENV`: `development | test | production`
- `PORT`: default `3000`
- `APP_PATH`: base path (`/` or `/api`)
- `DATABASE_URL`: Postgres connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: JWT TTL (example: `15m`)

---

## Routes

Base prefix depends on `APP_PATH`.

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /tasks` (auth)
- `POST /tasks` (auth)
- `PATCH /tasks/:id` (auth)
- `DELETE /tasks/:id` (auth)

---

## Auth flow

Short version:

- Register
- Login
- Use `Authorization: Bearer <token>` on any `/tasks` request

---

## Code layout

```txt
apps/api/
  prisma/
    schema.prisma
  src/
    app.ts            # build Fastify instance (plugins, routes)
    index.ts          # start server
    config/           # env parsing, constants
    lib/              # prisma client, logger
    middleware/       # auth hook, error handler, rate limit
    routes/           # auth, tasks, health
    errors/           # typed errors (optional)
  test/               # minimal endpoint tests
```

---

## Notes on APP_PATH

`APP_PATH` controls where the API is mounted.

Examples:
- Subdomain: `api.example.com` with `APP_PATH=/`
- Subpath: `example.com/api` with `APP_PATH=/api`

Implementation approach:
- Build the Fastify app normally
- Register routes under a single prefix derived from `APP_PATH`
- Keep internal route definitions prefix-free

---

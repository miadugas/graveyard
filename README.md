# Grave Goods Ecommerce (Vite + React + TS)

## Stack
- Frontend: Vite, React, TypeScript, Tailwind CSS
- Client state: Zustand
- Server state and API caching: TanStack Query
- Backend: Express + TypeScript
- Database: PostgreSQL

## Setup
1. Install dependencies:
   npm install
2. Create env file:
   cp .env.example .env
3. Ensure Postgres is running and create DB `grave_goods`.
4. Run schema:
   psql "$DATABASE_URL" -f server/db/schema.sql

## Run
- API server:
  npm run dev:api
- Frontend:
  npm run dev

Vite runs on http://localhost:5173 and proxies `/api` to the API server on port 4000.

## Admin Auth (RBAC)
- Roles: `admin`, `customer`
- The Admin page and admin-write API routes are restricted to `admin` sessions.
- Login uses `POST /api/auth/login` with an `httpOnly` session cookie.
- Default bootstrap admin (for local dev) is controlled by:
  - `ADMIN_EMAIL` (default `admin@gravegoods.local`)
  - `ADMIN_PASSWORD` (default `change-me-admin`)

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

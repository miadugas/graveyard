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
- Customer account creation uses `POST /api/auth/register`.
- Orders are linked to the authenticated user and exposed via:
  - `GET /api/orders/me`
  - `GET /api/orders/:id` (owner or admin)
- Default bootstrap admin (for local dev) is controlled by:
  - `ADMIN_EMAIL` (default `admin@gravegoods.local`)
  - `ADMIN_PASSWORD` (default `change-me-admin`)
  - `ADMIN_FULL_NAME` (default `Store Admin`)

## Product Images (Cloudinary)
- Admin image upload uses a signed backend endpoint: `POST /api/uploads/sign`
- Required env vars:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `CLOUDINARY_UPLOAD_FOLDER` (default `grave-goods/products`)
- In Admin > Add Item, use **Upload to Cloudinary** to upload and auto-fill `Image URL`.

## Payments (Stripe Checkout)
- Required server env vars:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `FRONTEND_URL` (for checkout success/cancel redirects)
- Create checkout session endpoint:
  - `POST /api/payments/checkout-session` (authenticated)
- Webhook endpoint:
  - `POST /api/stripe/webhook`
- In Stripe dashboard, configure webhook to your API domain:
  - `https://<api-domain>/api/stripe/webhook`
  - Subscribe to `checkout.session.completed`

## Inventory & Product Management
- Admin can create, edit, delete, and toggle sold-out status for products.
- Product inventory is tracked by `stockQuantity`.
- Checkout enforces stock limits and decrements stock on successful orders.
- Cross-user \"items in other carts\" is not tracked yet because carts are currently client-side.

## V2 Backlog
- Shopper signup modal: move from frontend-only `localStorage` gating to a backend-driven `isNewShopper` boolean in the auth/register/login response, derived from `users.created_at` and/or whether the customer has placed any orders yet.

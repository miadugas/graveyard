# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Grave Goods is a full-stack ecommerce app for a sticker and button shop. React/TypeScript frontend (Vite) with an Express/PostgreSQL backend. Deployed to Vercel (frontend) and Render (backend).

## Commands

```bash
npm run dev:all       # Run frontend (port 5173) + backend (port 4000) concurrently
npm run dev           # Frontend only (Vite dev server)
npm run dev:api       # Backend only (Express via tsx)
npm run build         # Production frontend build (vite build)
npm run typecheck     # TypeScript type checking (tsc --noEmit)
npm run start         # Production backend start
```

No test runner is configured. No linter is configured.

## Architecture

### Frontend (`src/`)
- **Routing**: Hash-based SPA routing in `App.tsx` — parses `window.location.hash` for routes (`#/shop`, `#/admin`, `#/checkout`, `#/orders/:id`, `#/about`)
- **State**: Zustand for client state (cart only, persisted to localStorage as `grave-goods-cart`), TanStack React Query for server state (products, orders, auth, specials)
- **API client**: `src/lib/api.ts` — fetch-based with `credentials: "include"` for httpOnly cookie auth. Parses Zod validation errors from backend.
- **Pricing logic**: `src/lib/pricing.ts` — shared pricing calculations including "buy 5 stickers get 1 free" promo. Functions: `getChargeableQuantity()`, `getLineTotal()`, `getDisplayLabel()`. This logic is duplicated in the backend.
- **Styling**: Tailwind CSS + DaisyUI (night theme). Custom colors: `ember` (purple), `soot` (dark grays). Fonts: Poppins (body), Anton SC (poster). Config in `tailwind.config.ts`.
- **Path alias**: `@/*` maps to `src/*` (configured in both tsconfig.json and vite.config.ts)

### Backend (`server/`)
- **Entry**: `server/src/index.ts` — single Express file (~600 lines) with all routes
- **Database**: `server/src/db.ts` — PostgreSQL pool via `pg`. Schema in `server/db/schema.sql`
- **Auth**: httpOnly session cookies (`gravegoods_session`), scrypt password hashing, RBAC with `admin`/`customer` roles
- **Payments**: Stripe Checkout sessions with webhook at `POST /api/stripe/webhook` for order creation and stock decrement
- **Images**: Cloudinary upload via signed endpoint `POST /api/uploads/sign`

### Database Tables
`products`, `orders`, `order_items`, `specials`, `users`, `sessions` — see `server/db/schema.sql` for full schema.

### Product Types
- **sticker**: Two sizes — 3"x3" ($4.99) and 2.5"x2.5" ($3.99)
- **button**: $2.99
- **bundle**: Custom pricing

## Key Patterns

- Vite dev server proxies `/api` requests to `localhost:4000`
- React Query keys: `["products"]`, `["auth", "me"]`, `["orders", "me"]`, `["orders", id]`, `["specials"]`
- Guest checkout supported — orders with `userId: null`
- Admin bootstrap credentials set via `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_FULL_NAME` env vars
- Production API rewrites configured in `vercel.json` pointing to Render

## Working Style (from AGENTS.md)

- Plan first, code second — propose approach before implementing
- Minimal and surgical changes over full rewrites
- No extra summaries or change indexes unless asked
- Prefer working functional solutions over over-engineered ones
- Full optional chaining on nested array access
- Avoid `void` in useEffect async code — use try/catch wrapper pattern

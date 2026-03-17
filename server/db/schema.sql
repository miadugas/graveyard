CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sticker', 'button', 'bundle')),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  size_label TEXT,
  description TEXT NOT NULL,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 25 CHECK (stock_quantity >= 0),
  is_sold_out BOOLEAN NOT NULL DEFAULT FALSE,
  is_disabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE products
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS size_label TEXT;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 25;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_sold_out BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE products
SET is_sold_out = TRUE
WHERE stock_quantity <= 0;

WITH ranked_products AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, name ASC) - 1 AS rank_order
  FROM products
)
UPDATE products p
SET display_order = rp.rank_order
FROM ranked_products rp
WHERE p.id = rp.id
  AND p.display_order = 0;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS specials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  discount_percent NUMERIC(5,2) NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  holiday_key TEXT,
  notes TEXT,
  banner_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  banner_shape TEXT NOT NULL DEFAULT 'pill',
  banner_theme TEXT NOT NULL DEFAULT 'none',
  banner_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS full_name TEXT;

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_session_id_uidx ON orders(stripe_session_id) WHERE stripe_session_id IS NOT NULL;

ALTER TABLE specials
ADD COLUMN IF NOT EXISTS banner_enabled BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE specials
ADD COLUMN IF NOT EXISTS banner_shape TEXT NOT NULL DEFAULT 'pill';

ALTER TABLE specials
ADD COLUMN IF NOT EXISTS banner_theme TEXT NOT NULL DEFAULT 'none';

ALTER TABLE specials
ADD COLUMN IF NOT EXISTS banner_text TEXT;

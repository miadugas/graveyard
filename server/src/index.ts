import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { pool } from "./db";
import { seedProductsIfEmpty } from "./seedProducts";

const scrypt = promisify(scryptCallback);

const app = express();
const port = Number(process.env.PORT ?? 4000);

const SESSION_COOKIE_NAME = "gravegoods_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type UserRole = "admin" | "customer";

interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthenticatedRequest extends Request {
  authUser?: SessionUser;
}

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json());

function todayIsoLocal() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function getCookieValue(req: Request, cookieName: string) {
  const header = req.headers.cookie;
  if (!header) {
    return null;
  }

  const pairs = header.split(";");
  for (const pair of pairs) {
    const [name, ...valueParts] = pair.trim().split("=");
    if (name === cookieName) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS
  });
}

function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hashed = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hashed.toString("hex")}`;
}

async function verifyPassword(password: string, storedHash: string) {
  const [salt, hashHex] = storedHash.split(":");
  if (!salt || !hashHex) {
    return false;
  }

  const incomingHash = (await scrypt(password, salt, 64)) as Buffer;
  const expectedHash = Buffer.from(hashHex, "hex");

  if (incomingHash.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(incomingHash, expectedHash);
}

async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const sessionToken = getCookieValue(req, SESSION_COOKIE_NAME);
  if (!sessionToken) {
    return null;
  }

  const result = await pool.query<SessionUser>(
    `SELECT u.id, u.email, u.role
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.session_token = $1
       AND s.expires_at > NOW()
     LIMIT 1`,
    [sessionToken]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
}

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    (req as AuthenticatedRequest).authUser = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to validate session" });
  }
}

function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).authUser;
    if (!user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (user.role !== role) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
}

async function seedAdminUserIfNeeded() {
  const existing = await pool.query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
  if (existing.rowCount && existing.rowCount > 0) {
    return;
  }

  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@gravegoods.local").trim().toLowerCase();
  const adminPassword = (process.env.ADMIN_PASSWORD ?? "change-me-admin").trim();

  if (adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  const passwordHash = await hashPassword(adminPassword);

  await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (email)
     DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       role = 'admin'`,
    [adminEmail, passwordHash]
  );

  if (!process.env.ADMIN_PASSWORD) {
    console.warn(
      `Admin user bootstrapped with default password. Set ADMIN_PASSWORD in environment for ${adminEmail}.`
    );
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200)
});

const orderSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive()
    })
  )
});

const productSchema = z.object({
  id: z
    .string()
    .min(3)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "id must use lowercase letters, numbers, and dashes"),
  name: z.string().min(2).max(120),
  type: z.enum(["sticker", "button", "bundle"]),
  price: z.number().nonnegative(),
  description: z.string().min(8).max(500),
  imageUrl: z
    .union([z.string().trim().max(1000), z.null(), z.undefined()])
    .transform((value) => {
      if (value === undefined || value === null || value === "") {
        return null;
      }
      return value;
    })
    .refine((value) => value === null || z.string().url().safeParse(value).success, {
      message: "imageUrl must be a valid URL"
    })
});

const specialSchema = z
  .object({
    name: z.string().trim().min(3).max(120),
    discountPercent: z.number().min(10).max(20),
    startDate: z.string().date(),
    endDate: z.string().date(),
    holidayKey: z
      .union([z.string().trim().min(1).max(64), z.null(), z.undefined()])
      .transform((value) => (value === undefined ? null : value)),
    notes: z
      .union([z.string().trim().max(500), z.null(), z.undefined()])
      .transform((value) => (value === undefined || value === "" ? null : value))
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"]
  })
  .refine((data) => data.startDate >= todayIsoLocal(), {
    message: "startDate cannot be in the past",
    path: ["startDate"]
  })
  .refine((data) => data.endDate >= todayIsoLocal(), {
    message: "endDate cannot be in the past",
    path: ["endDate"]
  });

const specialIdSchema = z.string().uuid();

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/auth/me", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to resolve current user" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid login payload", issues: parsed.error.flatten() });
    return;
  }

  try {
    const email = parsed.data.email.trim().toLowerCase();

    const found = await pool.query<{
      id: string;
      email: string;
      role: UserRole;
      passwordHash: string;
    }>(
      `SELECT id, email, role, password_hash AS "passwordHash"
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    if (found.rowCount === 0) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const user = found.rows[0];
    const validPassword = await verifyPassword(parsed.data.password, user.passwordHash);

    if (!validPassword) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const sessionToken = randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await pool.query(
      `INSERT INTO sessions (user_id, session_token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, sessionToken, expiresAt]
    );

    setSessionCookie(res, sessionToken);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to sign in" });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  const sessionToken = getCookieValue(req, SESSION_COOKIE_NAME);

  try {
    if (sessionToken) {
      await pool.query("DELETE FROM sessions WHERE session_token = $1", [sessionToken]);
    }

    clearSessionCookie(res);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to sign out" });
  }
});

app.get("/api/products", async (_req, res) => {
  const result = await pool.query(
    'SELECT id, name, type, price::float8 AS price, description, image_url AS "imageUrl" FROM products ORDER BY name ASC'
  );
  res.json(result.rows);
});

app.post("/api/products", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = productSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid product payload", issues: parsed.error.flatten() });
    return;
  }

  try {
    const insert = await pool.query(
      `INSERT INTO products (id, name, type, price, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, type, price::float8 AS price, description, image_url AS "imageUrl"`,
      [parsed.data.id, parsed.data.name, parsed.data.type, parsed.data.price, parsed.data.description, parsed.data.imageUrl]
    );

    res.status(201).json(insert.rows[0]);
  } catch (error) {
    const code = (error as { code?: string } | null)?.code;
    if (code === "23505") {
      res.status(409).json({ message: "Product id already exists. Try a different product name." });
      return;
    }

    console.error(error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

app.get("/api/specials", async (_req, res) => {
  const result = await pool.query(
    `SELECT
      id,
      name,
      discount_percent::float8 AS "discountPercent",
      start_date::text AS "startDate",
      end_date::text AS "endDate",
      holiday_key AS "holidayKey",
      notes
     FROM specials
     ORDER BY start_date ASC`
  );
  res.json(result.rows);
});

app.post("/api/specials", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = specialSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid special payload", issues: parsed.error.flatten() });
    return;
  }

  try {
    const insert = await pool.query(
      `INSERT INTO specials (name, discount_percent, start_date, end_date, holiday_key, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING
         id,
         name,
         discount_percent::float8 AS "discountPercent",
         start_date::text AS "startDate",
         end_date::text AS "endDate",
         holiday_key AS "holidayKey",
         notes`,
      [
        parsed.data.name,
        parsed.data.discountPercent,
        parsed.data.startDate,
        parsed.data.endDate,
        parsed.data.holidayKey,
        parsed.data.notes
      ]
    );

    res.status(201).json(insert.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create special" });
  }
});

app.put("/api/specials/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const parsedId = specialIdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    res.status(400).json({ message: "Invalid special id" });
    return;
  }

  const parsed = specialSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid special payload", issues: parsed.error.flatten() });
    return;
  }

  try {
    const update = await pool.query(
      `UPDATE specials
       SET name = $1,
           discount_percent = $2,
           start_date = $3,
           end_date = $4,
           holiday_key = $5,
           notes = $6
       WHERE id = $7
       RETURNING
         id,
         name,
         discount_percent::float8 AS "discountPercent",
         start_date::text AS "startDate",
         end_date::text AS "endDate",
         holiday_key AS "holidayKey",
         notes`,
      [
        parsed.data.name,
        parsed.data.discountPercent,
        parsed.data.startDate,
        parsed.data.endDate,
        parsed.data.holidayKey,
        parsed.data.notes,
        parsedId.data
      ]
    );

    if (update.rowCount === 0) {
      res.status(404).json({ message: "Special not found" });
      return;
    }

    res.json(update.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update special" });
  }
});

app.delete("/api/specials/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const parsedId = specialIdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    res.status(400).json({ message: "Invalid special id" });
    return;
  }

  try {
    const del = await pool.query("DELETE FROM specials WHERE id = $1", [parsedId.data]);
    if (del.rowCount === 0) {
      res.status(404).json({ message: "Special not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete special" });
  }
});

app.post("/api/orders", async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid order payload", issues: parsed.error.flatten() });
    return;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderInsert = await client.query(
      `INSERT INTO orders (customer_name, customer_email)
       VALUES ($1, $2)
       RETURNING id`,
      [parsed.data.customerName, parsed.data.customerEmail]
    );

    const orderId: string = orderInsert.rows[0].id;

    for (const item of parsed.data.items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity)
         VALUES ($1, $2, $3)`,
        [orderId, item.productId, item.quantity]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ orderId });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Failed to save order" });
  } finally {
    client.release();
  }
});

async function boot() {
  await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS specials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      discount_percent NUMERIC(5,2) NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      holiday_key TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      session_token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query("CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id)");
  await pool.query("CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at)");
  await pool.query("DELETE FROM sessions WHERE expires_at <= NOW()");

  await seedProductsIfEmpty();
  await seedAdminUserIfNeeded();

  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

boot().catch((error) => {
  console.error("Failed to boot server", error);
  process.exit(1);
});

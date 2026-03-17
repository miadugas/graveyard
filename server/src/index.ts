import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { pool } from "./db.js";
import { seedProductsIfEmpty } from "./seedProducts.js";

const scrypt = promisify(scryptCallback);

const app = express();
const port = Number(process.env.PORT ?? 4000);
const frontendUrl = (process.env.FRONTEND_URL ?? "http://localhost:5173").replace(/\/$/, "");
const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" }) : null;

const SESSION_COOKIE_NAME = "gravegoods_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type UserRole = "admin" | "customer";

interface SessionUser {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
}

interface CustomerOrderIdentity {
  userId: string | null;
  customerName: string;
  customerEmail: string;
}

interface AuthenticatedRequest extends Request {
  authUser?: SessionUser;
}

const STICKER_PRICE = 4.99;
const SMALL_STICKER_PRICE = 3.99;
const BUTTON_PRICE = 2.99;
const STICKER_PROMO_GROUP_SIZE = 5;
const DEFAULT_STICKER_SIZE_LABEL = '3" x 3"';
const SMALL_STICKER_SIZE_LABEL = '2.5" x 2.5"';

function normalizeSizeLabel(sizeLabel: string | null | undefined) {
  return sizeLabel?.trim().toLowerCase().replace(/\s+/g, "") ?? "";
}

function getDisplayLabel(type: "sticker" | "button" | "bundle", sizeLabel?: string | null) {
  if (type === "sticker") {
    return sizeLabel?.trim() || DEFAULT_STICKER_SIZE_LABEL;
  }

  return sizeLabel?.trim() || null;
}

function isSmallSticker(sizeLabel?: string | null) {
  return normalizeSizeLabel(sizeLabel) === normalizeSizeLabel(SMALL_STICKER_SIZE_LABEL);
}

function normalizeProductPrice(type: "sticker" | "button" | "bundle", price: number, sizeLabel?: string | null) {
  if (type === "sticker") {
    if (isSmallSticker(getDisplayLabel(type, sizeLabel))) {
      return SMALL_STICKER_PRICE;
    }

    return STICKER_PRICE;
  }

  if (type === "button") {
    return BUTTON_PRICE;
  }

  return price;
}

function getChargeableQuantity(type: "sticker" | "button" | "bundle", quantity: number) {
  if (type !== "sticker") {
    return quantity;
  }

  return quantity - Math.floor(quantity / STICKER_PROMO_GROUP_SIZE);
}

function getLineTotal(type: "sticker" | "button" | "bundle", unitPrice: number, quantity: number, sizeLabel?: string | null) {
  return Number((normalizeProductPrice(type, unitPrice, sizeLabel) * getChargeableQuantity(type, quantity)).toFixed(2));
}

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  if (!stripe || !stripeWebhookSecret) {
    res.status(500).json({ message: "Stripe webhook is not configured on the server" });
    return;
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || Array.isArray(signature)) {
    res.status(400).json({ message: "Missing Stripe signature header" });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
  } catch (error) {
    console.error("Invalid Stripe webhook signature", error);
    res.status(400).json({ message: "Invalid Stripe signature" });
    return;
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") {
        const userId = session.metadata?.userId ?? null;
        const itemsRaw = session.metadata?.items;
        const guestName = session.metadata?.guestName?.trim() ?? "";
        const guestEmail = session.metadata?.guestEmail?.trim() ?? session.customer_details?.email?.trim() ?? "";

        if (itemsRaw) {
          const parsedItems = JSON.parse(itemsRaw) as unknown;
          const parsedOrder = orderSchema.safeParse({ items: parsedItems });
          if (parsedOrder.success) {
            if (userId) {
              const userResult = await pool.query<SessionUser>(
                `SELECT id, email, full_name AS "fullName", role
                 FROM users
                 WHERE id = $1
                 LIMIT 1`,
                [userId]
              );

              if (userResult.rowCount && userResult.rows[0]) {
                await createOrderForCustomer(
                  {
                    userId: userResult.rows[0].id,
                    customerName: userResult.rows[0].fullName?.trim() || userResult.rows[0].email,
                    customerEmail: userResult.rows[0].email
                  },
                  parsedOrder.data.items,
                  session.id
                );
              }
            } else if (guestName && guestEmail) {
              await createOrderForCustomer(
                {
                  userId: null,
                  customerName: guestName,
                  customerEmail: guestEmail
                },
                parsedOrder.data.items,
                session.id
              );
            }
          }
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed", error);
    res.status(500).json({ message: "Failed to process Stripe webhook" });
  }
});

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
    `SELECT u.id, u.email, u.full_name AS "fullName", u.role
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
  const adminFullName = (process.env.ADMIN_FULL_NAME ?? "Store Admin").trim();

  if (adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  const passwordHash = await hashPassword(adminPassword);

  await pool.query(
    `INSERT INTO users (email, full_name, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email)
     DO UPDATE SET
       full_name = EXCLUDED.full_name,
       password_hash = EXCLUDED.password_hash,
       role = 'admin'`,
    [adminEmail, adminFullName, passwordHash]
  );

  if (!process.env.ADMIN_PASSWORD) {
    console.warn(`Admin user bootstrapped with default password for ${adminEmail}. Set ADMIN_PASSWORD in .env.`);
  }
}

const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(200)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200)
});

const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive()
    })
  )
});

const checkoutIdentitySchema = z.object({
  customerName: z
    .union([z.string().trim().min(2).max(120), z.null(), z.undefined()])
    .transform((value) => (value === undefined ? null : value)),
  customerEmail: z
    .union([z.string().trim().email().max(320), z.null(), z.undefined()])
    .transform((value) => (value === undefined ? null : value))
});

type OrderItemInput = z.infer<typeof orderSchema>["items"][number];
async function createOrderForCustomer(customer: CustomerOrderIdentity, items: OrderItemInput[], stripeSessionId?: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (stripeSessionId) {
      const existing = await client.query<{ id: string }>(
        "SELECT id FROM orders WHERE stripe_session_id = $1 LIMIT 1",
        [stripeSessionId]
      );
      if (existing.rowCount && existing.rows[0]) {
        await client.query("COMMIT");
        return existing.rows[0].id;
      }
    }

    const orderInsert = await client.query<{ id: string }>(
      `INSERT INTO orders (user_id, customer_name, customer_email, stripe_session_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [customer.userId, customer.customerName, customer.customerEmail, stripeSessionId ?? null]
    );

    const orderId = orderInsert.rows[0].id;

    for (const item of items) {
      const productResult = await client.query<{
        stockQuantity: number;
        isSoldOut: boolean;
        isDisabled: boolean;
      }>(
        `SELECT
          stock_quantity AS "stockQuantity",
          is_sold_out AS "isSoldOut",
          is_disabled AS "isDisabled"
         FROM products
         WHERE id = $1
         FOR UPDATE`,
        [item.productId]
      );

      if (productResult.rowCount === 0) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const product = productResult.rows[0];
      if (product.isDisabled || product.isSoldOut || product.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }

      await client.query(
        `UPDATE products
         SET stock_quantity = stock_quantity - $1,
             is_sold_out = CASE WHEN stock_quantity - $1 <= 0 THEN TRUE ELSE is_sold_out END,
             updated_at = NOW()
         WHERE id = $2`,
        [item.quantity, item.productId]
      );

      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity)
         VALUES ($1, $2, $3)`,
        [orderId, item.productId, item.quantity]
      );
    }

    await client.query("COMMIT");
    return orderId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

const productSchema = z.object({
  id: z
    .string()
    .min(3)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "id must use lowercase letters, numbers, and dashes"),
  name: z.string().min(2).max(120),
  type: z.enum(["sticker", "button", "bundle"]),
  price: z.number().nonnegative(),
  sizeLabel: z
    .union([z.string().trim().max(80), z.null(), z.undefined()])
    .transform((value) => {
      if (value === undefined || value === null || value === "") {
        return null;
      }
      return value;
    }),
  description: z.string().min(8).max(2000),
  displayOrder: z.number().int().nonnegative().optional(),
  stockQuantity: z.number().int().min(0),
  isSoldOut: z.boolean(),
  isDisabled: z.boolean(),
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
const productUpdateSchema = productSchema.omit({ id: true });
const productSoldOutSchema = z.object({ isSoldOut: z.boolean() });
const productDisabledSchema = z.object({ isDisabled: z.boolean() });
const productOrderSchema = z.object({ displayOrder: z.number().int().nonnegative() });
const productIdSchema = z
  .string()
  .min(3)
  .max(64)
  .regex(/^[a-z0-9-]+$/);

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
      .transform((value) => (value === undefined || value === "" ? null : value)),
    bannerEnabled: z.boolean().optional().default(false),
    bannerShape: z.enum(["pill", "ribbon", "ticket", "burst"]).optional().default("pill"),
    bannerTheme: z.enum(["none", "coffin", "tombstone", "bat", "spiderweb"]).optional().default("none"),
    bannerText: z
      .union([z.string().trim().max(180), z.null(), z.undefined()])
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
const orderIdSchema = z.string().uuid();

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

app.post("/api/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid register payload", issues: parsed.error.flatten() });
    return;
  }

  try {
    const email = parsed.data.email.trim().toLowerCase();
    const passwordHash = await hashPassword(parsed.data.password);

    const created = await pool.query<SessionUser>(
      `INSERT INTO users (email, full_name, password_hash, role)
       VALUES ($1, $2, $3, 'customer')
       RETURNING id, email, full_name AS "fullName", role`,
      [email, parsed.data.fullName, passwordHash]
    );

    const user = created.rows[0];
    const sessionToken = randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await pool.query(
      `INSERT INTO sessions (user_id, session_token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, sessionToken, expiresAt]
    );

    setSessionCookie(res, sessionToken);
    res.status(201).json({ user });
  } catch (error) {
    const code = (error as { code?: string } | null)?.code;
    if (code === "23505") {
      res.status(409).json({ message: "Email is already registered" });
      return;
    }

    console.error(error);
    res.status(500).json({ message: "Unable to create account" });
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
      fullName: string | null;
      role: UserRole;
      passwordHash: string;
    }>(
      `SELECT id, email, full_name AS "fullName", role, password_hash AS "passwordHash"
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
        fullName: user.fullName,
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

app.post("/api/uploads/sign", requireAuth, requireRole("admin"), async (_req, res) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const folder = (process.env.CLOUDINARY_UPLOAD_FOLDER ?? "grave-goods/products").trim();

  if (!cloudName || !apiKey || !apiSecret) {
    res.status(500).json({ message: "Cloudinary is not configured on the server" });
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signatureBase = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(signatureBase).digest("hex");

  res.json({
    cloudName,
    apiKey,
    folder,
    timestamp,
    signature
  });
});

app.get("/api/products", async (_req, res) => {
  const result = await pool.query(
    `SELECT
      id,
      name,
      type,
      price::float8 AS price,
      size_label AS "sizeLabel",
      description,
      image_url AS "imageUrl",
      display_order AS "displayOrder",
      stock_quantity AS "stockQuantity",
      is_sold_out AS "isSoldOut",
      is_disabled AS "isDisabled"
     FROM products
     ORDER BY display_order ASC, name ASC`
  );
  res.json(
    result.rows.map((row: { type: "sticker" | "button" | "bundle"; price: number; sizeLabel: string | null }) => ({
      ...row,
      sizeLabel: getDisplayLabel(row.type, row.sizeLabel),
      price: normalizeProductPrice(row.type, row.price, row.sizeLabel)
    }))
  );
});

app.post("/api/products", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = productSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid product payload", issues: parsed.error.flatten() });
    return;
  }

  try {
    const orderResult = await pool.query<{ nextOrder: number }>(
      "SELECT COALESCE(MAX(display_order), -1) + 1 AS \"nextOrder\" FROM products"
    );
    const nextOrder = orderResult.rows[0]?.nextOrder ?? 0;

    const insert = await pool.query(
      `INSERT INTO products (id, name, type, price, size_label, description, image_url, display_order, stock_quantity, is_sold_out, is_disabled, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       RETURNING
         id,
         name,
         type,
         price::float8 AS price,
         size_label AS "sizeLabel",
         description,
         image_url AS "imageUrl",
         display_order AS "displayOrder",
         stock_quantity AS "stockQuantity",
         is_sold_out AS "isSoldOut",
         is_disabled AS "isDisabled"`,
      [
        parsed.data.id,
        parsed.data.name,
        parsed.data.type,
        normalizeProductPrice(parsed.data.type, parsed.data.price, parsed.data.sizeLabel),
        getDisplayLabel(parsed.data.type, parsed.data.sizeLabel),
        parsed.data.description,
        parsed.data.imageUrl,
        parsed.data.displayOrder ?? nextOrder,
        parsed.data.stockQuantity,
        parsed.data.isSoldOut || parsed.data.stockQuantity <= 0,
        parsed.data.isDisabled
      ]
    );

    res.status(201).json({
      ...insert.rows[0],
      sizeLabel: getDisplayLabel(insert.rows[0].type, insert.rows[0].sizeLabel),
      price: normalizeProductPrice(insert.rows[0].type, insert.rows[0].price, insert.rows[0].sizeLabel)
    });
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

app.put("/api/products/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const parsedId = productIdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    res.status(400).json({ message: "Invalid product id" });
    return;
  }

  const parsed = productUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid product payload", issues: parsed.error.flatten() });
    return;
  }

  try {
    const update = await pool.query(
      `UPDATE products
       SET name = $1,
           type = $2,
           price = $3,
           size_label = $4,
           description = $5,
           image_url = $6,
           display_order = $7,
           stock_quantity = $8,
           is_sold_out = $9,
           is_disabled = $10,
           updated_at = NOW()
       WHERE id = $11
       RETURNING
         id,
         name,
         type,
         price::float8 AS price,
         size_label AS "sizeLabel",
         description,
         image_url AS "imageUrl",
         display_order AS "displayOrder",
         stock_quantity AS "stockQuantity",
         is_sold_out AS "isSoldOut",
         is_disabled AS "isDisabled"`,
      [
        parsed.data.name,
        parsed.data.type,
        normalizeProductPrice(parsed.data.type, parsed.data.price, parsed.data.sizeLabel),
        getDisplayLabel(parsed.data.type, parsed.data.sizeLabel),
        parsed.data.description,
        parsed.data.imageUrl,
        parsed.data.displayOrder ?? 0,
        parsed.data.stockQuantity,
        parsed.data.isSoldOut || parsed.data.stockQuantity <= 0,
        parsed.data.isDisabled,
        parsedId.data
      ]
    );

    if (update.rowCount === 0) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json({
      ...update.rows[0],
      sizeLabel: getDisplayLabel(update.rows[0].type, update.rows[0].sizeLabel),
      price: normalizeProductPrice(update.rows[0].type, update.rows[0].price, update.rows[0].sizeLabel)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

app.patch("/api/products/:id/order", requireAuth, requireRole("admin"), async (req, res) => {
  const parsedId = productIdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    res.status(400).json({ message: "Invalid product id" });
    return;
  }

  const parsed = productOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid order payload", issues: parsed.error.flatten() });
    return;
  }

  try {
    const update = await pool.query(
      `UPDATE products
       SET display_order = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING
         id,
         name,
         type,
         price::float8 AS price,
         size_label AS "sizeLabel",
         description,
         image_url AS "imageUrl",
         display_order AS "displayOrder",
         stock_quantity AS "stockQuantity",
         is_sold_out AS "isSoldOut",
         is_disabled AS "isDisabled"`,
      [parsed.data.displayOrder, parsedId.data]
    );

    if (update.rowCount === 0) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json({
      ...update.rows[0],
      sizeLabel: getDisplayLabel(update.rows[0].type, update.rows[0].sizeLabel),
      price: normalizeProductPrice(update.rows[0].type, update.rows[0].price, update.rows[0].sizeLabel)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update product order" });
  }
});

app.patch("/api/products/:id/sold-out", requireAuth, requireRole("admin"), async (req, res) => {
  const parsedId = productIdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    res.status(400).json({ message: "Invalid product id" });
    return;
  }

  const parsed = productSoldOutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid sold-out payload", issues: parsed.error.flatten() });
    return;
  }

  try {
    const update = await pool.query(
      `UPDATE products
       SET is_sold_out = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING
         id,
         name,
         type,
         price::float8 AS price,
         size_label AS "sizeLabel",
         description,
         image_url AS "imageUrl",
         stock_quantity AS "stockQuantity",
         is_sold_out AS "isSoldOut",
         is_disabled AS "isDisabled"`,
      [parsed.data.isSoldOut, parsedId.data]
    );

    if (update.rowCount === 0) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json({
      ...update.rows[0],
      sizeLabel: getDisplayLabel(update.rows[0].type, update.rows[0].sizeLabel),
      price: normalizeProductPrice(update.rows[0].type, update.rows[0].price, update.rows[0].sizeLabel)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update sold-out status" });
  }
});

app.patch("/api/products/:id/disabled", requireAuth, requireRole("admin"), async (req, res) => {
  const parsedId = productIdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    res.status(400).json({ message: "Invalid product id" });
    return;
  }

  const parsed = productDisabledSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid disabled payload", issues: parsed.error.flatten() });
    return;
  }

  try {
    const update = await pool.query(
      `UPDATE products
       SET is_disabled = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING
         id,
         name,
         type,
         price::float8 AS price,
         size_label AS "sizeLabel",
         description,
         image_url AS "imageUrl",
         display_order AS "displayOrder",
         stock_quantity AS "stockQuantity",
         is_sold_out AS "isSoldOut",
         is_disabled AS "isDisabled"`,
      [parsed.data.isDisabled, parsedId.data]
    );

    if (update.rowCount === 0) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json({
      ...update.rows[0],
      sizeLabel: getDisplayLabel(update.rows[0].type, update.rows[0].sizeLabel),
      price: normalizeProductPrice(update.rows[0].type, update.rows[0].price, update.rows[0].sizeLabel)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update disabled status" });
  }
});

app.delete("/api/products/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const parsedId = productIdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    res.status(400).json({ message: "Invalid product id" });
    return;
  }

  try {
    const del = await pool.query("DELETE FROM products WHERE id = $1", [parsedId.data]);
    if (del.rowCount === 0) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    const code = (error as { code?: string } | null)?.code;
    if (code === "23503") {
      res.status(409).json({ message: "Cannot delete product with existing order history" });
      return;
    }
    console.error(error);
    res.status(500).json({ message: "Failed to delete product" });
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
      notes,
      banner_enabled AS "bannerEnabled",
      banner_shape AS "bannerShape",
      banner_theme AS "bannerTheme",
      banner_text AS "bannerText"
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
      `INSERT INTO specials (name, discount_percent, start_date, end_date, holiday_key, notes, banner_enabled, banner_shape, banner_theme, banner_text)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING
         id,
         name,
         discount_percent::float8 AS "discountPercent",
         start_date::text AS "startDate",
         end_date::text AS "endDate",
         holiday_key AS "holidayKey",
         notes,
         banner_enabled AS "bannerEnabled",
         banner_shape AS "bannerShape",
         banner_theme AS "bannerTheme",
         banner_text AS "bannerText"`,
      [
        parsed.data.name,
        parsed.data.discountPercent,
        parsed.data.startDate,
        parsed.data.endDate,
        parsed.data.holidayKey,
        parsed.data.notes,
        parsed.data.bannerEnabled,
        parsed.data.bannerShape,
        parsed.data.bannerTheme,
        parsed.data.bannerText
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
           notes = $6,
           banner_enabled = $7,
           banner_shape = $8,
           banner_theme = $9,
           banner_text = $10
       WHERE id = $11
       RETURNING
         id,
         name,
         discount_percent::float8 AS "discountPercent",
         start_date::text AS "startDate",
         end_date::text AS "endDate",
         holiday_key AS "holidayKey",
         notes,
         banner_enabled AS "bannerEnabled",
         banner_shape AS "bannerShape",
         banner_theme AS "bannerTheme",
         banner_text AS "bannerText"`,
      [
        parsed.data.name,
        parsed.data.discountPercent,
        parsed.data.startDate,
        parsed.data.endDate,
        parsed.data.holidayKey,
        parsed.data.notes,
        parsed.data.bannerEnabled,
        parsed.data.bannerShape,
        parsed.data.bannerTheme,
        parsed.data.bannerText,
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
  const parsed = orderSchema.merge(checkoutIdentitySchema).safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid order payload", issues: parsed.error.flatten() });
    return;
  }

  try {
    const user = await getSessionUser(req);
    const customer = user
      ? {
          userId: user.id,
          customerName: user.fullName?.trim() || user.email,
          customerEmail: user.email
        }
      : parsed.data.customerName && parsed.data.customerEmail
        ? {
            userId: null,
            customerName: parsed.data.customerName,
            customerEmail: parsed.data.customerEmail
          }
        : null;

    if (!customer) {
      res.status(400).json({ message: "Guest checkout requires name and email" });
      return;
    }

    const orderId = await createOrderForCustomer(customer, parsed.data.items);
    res.status(201).json({ orderId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save order";
    if (message.startsWith("Insufficient stock")) {
      res.status(409).json({ message });
      return;
    }
    if (message.startsWith("Product not found")) {
      res.status(404).json({ message });
      return;
    }
    console.error(error);
    res.status(500).json({ message: "Failed to save order" });
  }
});

app.post("/api/payments/checkout-session", async (req, res) => {
  if (!stripe) {
    res.status(500).json({ message: "Stripe is not configured on the server" });
    return;
  }

  const parsed = orderSchema.merge(checkoutIdentitySchema).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid order payload", issues: parsed.error.flatten() });
    return;
  }

  try {
    const user = await getSessionUser(req);
    const customer = user
      ? {
          userId: user.id,
          customerName: user.fullName?.trim() || user.email,
          customerEmail: user.email
        }
      : parsed.data.customerName && parsed.data.customerEmail
        ? {
            userId: null,
            customerName: parsed.data.customerName,
            customerEmail: parsed.data.customerEmail
          }
        : null;

    if (!customer) {
      res.status(400).json({ message: "Guest checkout requires name and email" });
      return;
    }

    const productIds = parsed.data.items.map((item) => item.productId);
    const productsResult = await pool.query<{
      id: string;
      name: string;
      type: "sticker" | "button" | "bundle";
      sizeLabel: string | null;
      description: string;
      imageUrl: string | null;
      price: number;
      stockQuantity: number;
      isSoldOut: boolean;
      isDisabled: boolean;
    }>(
      `SELECT
        id,
        name,
        type,
        size_label AS "sizeLabel",
        description,
        image_url AS "imageUrl",
        price::float8 AS price,
        stock_quantity AS "stockQuantity",
        is_sold_out AS "isSoldOut",
        is_disabled AS "isDisabled"
       FROM products
       WHERE id = ANY($1::text[])`,
      [productIds]
    );

    const productsById = new Map(productsResult.rows.map((row) => [row.id, row]));

    const lineItems = parsed.data.items.map((item) => {
      const product = productsById.get(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (product.isDisabled || product.isSoldOut || product.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }

      return {
        quantity: getChargeableQuantity(product.type, item.quantity),
        price_data: {
          currency: "usd",
          unit_amount: Math.round(normalizeProductPrice(product.type, product.price, product.sizeLabel) * 100),
          product_data: {
            name: product.name,
            description: `${product.description.slice(0, 420)}${product.type === "sticker" ? " Buy 4 get 1 free applied at checkout." : ""}`,
            images: product.imageUrl ? [product.imageUrl] : undefined
          }
        }
      } satisfies Stripe.Checkout.SessionCreateParams.LineItem;
    });

    const itemsMetadata = JSON.stringify(parsed.data.items);
    if (itemsMetadata.length > 500) {
      res.status(400).json({ message: "Cart is too large for checkout metadata" });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: user ? `${frontendUrl}/#/orders?checkout=success` : `${frontendUrl}/#/checkout?checkout=success`,
      cancel_url: `${frontendUrl}/#/checkout`,
      customer_email: customer.customerEmail,
      client_reference_id: user?.id ?? undefined,
      metadata: {
        userId: user?.id ?? "",
        guestName: user ? "" : customer.customerName,
        guestEmail: user ? "" : customer.customerEmail,
        items: itemsMetadata
      }
    });

    if (!session.url) {
      res.status(500).json({ message: "Stripe checkout URL was not returned" });
      return;
    }

    res.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start Stripe checkout";
    if (message.startsWith("Insufficient stock")) {
      res.status(409).json({ message });
      return;
    }
    if (message.startsWith("Product not found")) {
      res.status(404).json({ message });
      return;
    }

    console.error(error);
    res.status(500).json({ message: "Unable to start Stripe checkout" });
  }
});

app.get("/api/orders/me", requireAuth, async (req, res) => {
  const user = (req as AuthenticatedRequest).authUser;
  if (!user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const result = await pool.query(
    `SELECT
      o.id,
      o.created_at AS "createdAt",
      COALESCE(SUM(oi.quantity), 0)::int AS "totalQuantity",
      COALESCE(COUNT(oi.id), 0)::int AS "lineItemCount",
      COALESCE(
        SUM(
          (
            CASE
              WHEN p.type = 'sticker' AND REPLACE(LOWER(COALESCE(p.size_label, '')), ' ', '') IN ('2.5"x2.5"', '2.5x2.5')
                THEN 3.99 * (oi.quantity - FLOOR(oi.quantity / 5.0))
              WHEN p.type = 'sticker' THEN 4.99 * (oi.quantity - FLOOR(oi.quantity / 5.0))
              WHEN p.type = 'button' THEN 2.99 * oi.quantity
              ELSE p.price * oi.quantity
            END
          )::numeric
        ),
        0
      )::float8 AS "totalAmount"
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE o.user_id = $1
     GROUP BY o.id, o.created_at
     ORDER BY o.created_at DESC`,
    [user.id]
  );

  res.json(result.rows);
});

app.get("/api/orders", requireAuth, requireRole("admin"), async (_req, res) => {
  const result = await pool.query(
    `SELECT
      o.id,
      o.user_id AS "userId",
      o.customer_name AS "customerName",
      o.customer_email AS "customerEmail",
      o.created_at AS "createdAt",
      COALESCE(SUM(oi.quantity), 0)::int AS "totalQuantity",
      COALESCE(
        SUM(
          (
            CASE
              WHEN p.type = 'sticker' AND REPLACE(LOWER(COALESCE(p.size_label, '')), ' ', '') IN ('2.5"x2.5"', '2.5x2.5')
                THEN 3.99 * (oi.quantity - FLOOR(oi.quantity / 5.0))
              WHEN p.type = 'sticker' THEN 4.99 * (oi.quantity - FLOOR(oi.quantity / 5.0))
              WHEN p.type = 'button' THEN 2.99 * oi.quantity
              ELSE p.price * oi.quantity
            END
          )::numeric
        ),
        0
      )::float8 AS "totalAmount"
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN products p ON p.id = oi.product_id
     GROUP BY o.id
     ORDER BY o.created_at DESC`
  );

  res.json(result.rows);
});

app.get("/api/orders/:id", requireAuth, async (req, res) => {
  const parsedId = orderIdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    res.status(400).json({ message: "Invalid order id" });
    return;
  }

  const user = (req as AuthenticatedRequest).authUser;
  if (!user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const orderResult = await pool.query<{
    id: string;
    userId: string | null;
    customerName: string;
    customerEmail: string;
    createdAt: string;
  }>(
    `SELECT
      id,
      user_id AS "userId",
      customer_name AS "customerName",
      customer_email AS "customerEmail",
      created_at AS "createdAt"
     FROM orders
     WHERE id = $1
     LIMIT 1`,
    [parsedId.data]
  );

  if (orderResult.rowCount === 0) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  const order = orderResult.rows[0];

  if (user.role !== "admin" && order.userId !== user.id) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const itemsResult = await pool.query<{
    id: string;
    productId: string;
    productName: string;
    productType: "sticker" | "button" | "bundle";
    sizeLabel: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>(
    `SELECT
      oi.id::text AS id,
      oi.product_id AS "productId",
      p.name AS "productName",
      p.type AS "productType",
      p.size_label AS "sizeLabel",
      oi.quantity,
      CASE
        WHEN p.type = 'sticker' AND REPLACE(LOWER(COALESCE(p.size_label, '')), ' ', '') IN ('2.5"x2.5"', '2.5x2.5') THEN 3.99
        WHEN p.type = 'sticker' THEN 4.99
        WHEN p.type = 'button' THEN 2.99
        ELSE p.price::float8
      END AS "unitPrice",
      CASE
        WHEN p.type = 'sticker' AND REPLACE(LOWER(COALESCE(p.size_label, '')), ' ', '') IN ('2.5"x2.5"', '2.5x2.5')
          THEN (3.99 * (oi.quantity - FLOOR(oi.quantity / 5.0)))::float8
        WHEN p.type = 'sticker' THEN (4.99 * (oi.quantity - FLOOR(oi.quantity / 5.0)))::float8
        WHEN p.type = 'button' THEN (2.99 * oi.quantity)::float8
        ELSE (p.price * oi.quantity)::float8
      END AS "lineTotal"
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1
     ORDER BY oi.id ASC`,
    [parsedId.data]
  );

  const totals = itemsResult.rows.reduce<{ totalQuantity: number; totalAmount: number }>(
    (acc: { totalQuantity: number; totalAmount: number }, item: { quantity: number; lineTotal: number }) => {
      acc.totalQuantity += item.quantity;
      acc.totalAmount += item.lineTotal;
      return acc;
    },
    { totalQuantity: 0, totalAmount: 0 }
  );

  res.json({
    ...order,
    items: itemsResult.rows,
    totalQuantity: totals.totalQuantity,
    totalAmount: Number(totals.totalAmount.toFixed(2))
  });
});

async function boot() {
  await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT");
  await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS size_label TEXT");
  await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0");
  await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 25");
  await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_sold_out BOOLEAN NOT NULL DEFAULT FALSE");
  await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN NOT NULL DEFAULT FALSE");
  await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()");
  await pool.query("UPDATE products SET is_sold_out = TRUE WHERE stock_quantity <= 0");
  await pool.query(`
    WITH ranked_products AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, name ASC) - 1 AS rank_order
      FROM products
    )
    UPDATE products p
    SET display_order = rp.rank_order
    FROM ranked_products rp
    WHERE p.id = rp.id
      AND p.display_order = 0
  `);
  await pool.query(`
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
    )
  `);
  await pool.query("ALTER TABLE specials ADD COLUMN IF NOT EXISTS banner_enabled BOOLEAN NOT NULL DEFAULT FALSE");
  await pool.query("ALTER TABLE specials ADD COLUMN IF NOT EXISTS banner_shape TEXT NOT NULL DEFAULT 'pill'");
  await pool.query("ALTER TABLE specials ADD COLUMN IF NOT EXISTS banner_theme TEXT NOT NULL DEFAULT 'none'");
  await pool.query("ALTER TABLE specials ADD COLUMN IF NOT EXISTS banner_text TEXT");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      full_name TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      session_token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL");
  await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT");
  await pool.query("CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id)");
  await pool.query("CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at)");
  await pool.query("CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id)");
  await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_session_id_uidx ON orders(stripe_session_id) WHERE stripe_session_id IS NOT NULL");
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

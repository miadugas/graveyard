import express from "express";
import cors from "cors";
import { z } from "zod";
import { pool } from "./db";
import { seedProductsIfEmpty } from "./seedProducts";
const app = express();
const port = Number(process.env.PORT ?? 4000);
app.use(cors());
app.use(express.json());
function todayIsoLocal() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
}
const orderSchema = z.object({
    customerName: z.string().min(2),
    customerEmail: z.string().email(),
    items: z.array(z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive()
    }))
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
app.get("/api/products", async (_req, res) => {
    const result = await pool.query('SELECT id, name, type, price::float8 AS price, description, image_url AS "imageUrl" FROM products ORDER BY name ASC');
    res.json(result.rows);
});
app.post("/api/products", async (req, res) => {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ message: "Invalid product payload", issues: parsed.error.flatten() });
        return;
    }
    try {
        const insert = await pool.query(`INSERT INTO products (id, name, type, price, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, type, price::float8 AS price, description, image_url AS "imageUrl"`, [parsed.data.id, parsed.data.name, parsed.data.type, parsed.data.price, parsed.data.description, parsed.data.imageUrl]);
        res.status(201).json(insert.rows[0]);
    }
    catch (error) {
        const code = error?.code;
        if (code === "23505") {
            res.status(409).json({ message: "Product id already exists. Try a different product name." });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Failed to create product" });
    }
});
app.get("/api/specials", async (_req, res) => {
    const result = await pool.query(`SELECT
      id,
      name,
      discount_percent::float8 AS "discountPercent",
      start_date::text AS "startDate",
      end_date::text AS "endDate",
      holiday_key AS "holidayKey",
      notes
     FROM specials
     ORDER BY start_date ASC`);
    res.json(result.rows);
});
app.post("/api/specials", async (req, res) => {
    const parsed = specialSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ message: "Invalid special payload", issues: parsed.error.flatten() });
        return;
    }
    try {
        const insert = await pool.query(`INSERT INTO specials (name, discount_percent, start_date, end_date, holiday_key, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING
         id,
         name,
         discount_percent::float8 AS "discountPercent",
         start_date::text AS "startDate",
         end_date::text AS "endDate",
         holiday_key AS "holidayKey",
         notes`, [
            parsed.data.name,
            parsed.data.discountPercent,
            parsed.data.startDate,
            parsed.data.endDate,
            parsed.data.holidayKey,
            parsed.data.notes
        ]);
        res.status(201).json(insert.rows[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create special" });
    }
});
app.put("/api/specials/:id", async (req, res) => {
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
        const update = await pool.query(`UPDATE specials
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
         notes`, [
            parsed.data.name,
            parsed.data.discountPercent,
            parsed.data.startDate,
            parsed.data.endDate,
            parsed.data.holidayKey,
            parsed.data.notes,
            parsedId.data
        ]);
        if (update.rowCount === 0) {
            res.status(404).json({ message: "Special not found" });
            return;
        }
        res.json(update.rows[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update special" });
    }
});
app.delete("/api/specials/:id", async (req, res) => {
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
    }
    catch (error) {
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
        const orderInsert = await client.query(`INSERT INTO orders (customer_name, customer_email)
       VALUES ($1, $2)
       RETURNING id`, [parsed.data.customerName, parsed.data.customerEmail]);
        const orderId = orderInsert.rows[0].id;
        for (const item of parsed.data.items) {
            await client.query(`INSERT INTO order_items (order_id, product_id, quantity)
         VALUES ($1, $2, $3)`, [orderId, item.productId, item.quantity]);
        }
        await client.query("COMMIT");
        res.status(201).json({ orderId });
    }
    catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ message: "Failed to save order" });
    }
    finally {
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
    await seedProductsIfEmpty();
    app.listen(port, () => {
        console.log(`API listening on http://localhost:${port}`);
    });
}
boot().catch((error) => {
    console.error("Failed to boot server", error);
    process.exit(1);
});

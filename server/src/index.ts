import express from "express";
import cors from "cors";
import { z } from "zod";
import { pool } from "./db";
import { seedProductsIfEmpty } from "./seedProducts";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

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

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/products", async (_req, res) => {
  const result = await pool.query(
    "SELECT id, name, type, price::float8 AS price, description FROM products ORDER BY name ASC"
  );
  res.json(result.rows);
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
  await seedProductsIfEmpty();
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

boot().catch((error) => {
  console.error("Failed to boot server", error);
  process.exit(1);
});

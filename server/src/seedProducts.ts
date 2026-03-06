import { pool } from "./db";

const seedData = [
  ["stkr-midnight-moth", "Midnight Moth Sticker", "sticker", 4, "Weatherproof vinyl decal for bottles and laptops."],
  ["stkr-bone-bouquet", "Bone Bouquet Sticker", "sticker", 5, "3.5-inch floral skeleton sticker with matte laminate."],
  ["btn-hollow-heart", "Hollow Heart Button", "button", 3, "1.5-inch pinback in deep crimson and ivory tones."],
  ["btn-ghost-smile", "Ghost Smile Button", "button", 3, "Cute haunt-core icon button for jackets and totes."],
  ["bundle-night-shift", "Night Shift Bundle", "bundle", 16, "Four stickers and two buttons from the monthly drop."],
  ["bundle-gift-pack", "Tiny Grave Gift Pack", "bundle", 22, "Gift-ready set with 6 stickers and 3 buttons."]
] as const;

export async function seedProductsIfEmpty() {
  const count = await pool.query("SELECT COUNT(*)::int AS total FROM products");
  if (count.rows[0].total > 0) {
    return;
  }

  for (const [id, name, type, price, description] of seedData) {
    await pool.query(
      `INSERT INTO products (id, name, type, price, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, name, type, price, description]
    );
  }
}

import { pool } from "./db.js";

const seedData = [
  ["stkr-midnight-moth", "Midnight Moth Sticker", "sticker", 4, "3-inch weather-resistant vinyl decal for bottles, laptops, and helmets."],
  ["stkr-bone-bouquet", "Bone Bouquet Sticker", "sticker", 5, "3-inch custom vinyl sticker with matte laminate and sharp black-and-white detail."],
  ["btn-hollow-heart", "Hollow Heart Button", "button", 3, "1.5-inch pinback in deep crimson and ivory tones."],
  ["btn-ghost-smile", "Ghost Smile Button", "button", 3, "Cute haunt-core icon button for jackets and totes."],
  ["bundle-night-shift", "Night Shift Bundle", "bundle", 16, "Four stickers and two buttons from the monthly drop."],
  ["bundle-gift-pack", "Tiny Grave Gift Pack", "bundle", 22, "Gift-ready set with 6 stickers and 3 buttons."]
] as const;

export async function seedProductsIfEmpty() {
  for (const [id, name, type, price, description] of seedData) {
    await pool.query(
      `INSERT INTO products (id, name, type, price, description)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id)
       DO UPDATE SET
         name = EXCLUDED.name,
         type = EXCLUDED.type,
         price = EXCLUDED.price,
         description = EXCLUDED.description`,
      [id, name, type, price, description]
    );
  }
}

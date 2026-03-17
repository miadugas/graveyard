import type { Product } from "@/types";

export const STICKER_UNIT_PRICE = 4.99;
export const SMALL_STICKER_UNIT_PRICE = 3.99;
export const BUTTON_UNIT_PRICE = 2.99;
const STICKER_PROMO_GROUP_SIZE = 5;
const STICKER_PROMO_PAID_UNITS = 4;
export const DEFAULT_STICKER_SIZE_LABEL = '3" x 3"';
export const SMALL_STICKER_SIZE_LABEL = '2.5" x 2.5"';

function normalizeSizeLabel(sizeLabel: string | null | undefined) {
  return sizeLabel?.trim().toLowerCase().replace(/\s+/g, "") ?? "";
}

export function getDisplayLabel(product: Pick<Product, "type" | "sizeLabel">) {
  if (product.type === "sticker") {
    return product.sizeLabel?.trim() || DEFAULT_STICKER_SIZE_LABEL;
  }

  return product.sizeLabel?.trim() || null;
}

function isSmallSticker(sizeLabel: string | null | undefined) {
  const normalizedSize = normalizeSizeLabel(sizeLabel);
  return normalizedSize === normalizeSizeLabel(SMALL_STICKER_SIZE_LABEL);
}

export function getUnitPrice(product: Pick<Product, "type" | "price" | "sizeLabel">) {
  if (product.type === "sticker") {
    if (isSmallSticker(getDisplayLabel(product))) {
      return SMALL_STICKER_UNIT_PRICE;
    }

    return STICKER_UNIT_PRICE;
  }

  if (product.type === "button") {
    return BUTTON_UNIT_PRICE;
  }

  return product.price;
}

export function getChargeableQuantity(product: Pick<Product, "type">, quantity: number) {
  if (product.type !== "sticker") {
    return quantity;
  }

  return quantity - Math.floor(quantity / STICKER_PROMO_GROUP_SIZE);
}

export function getLineTotal(product: Pick<Product, "type" | "price" | "sizeLabel">, quantity: number) {
  return Number((getUnitPrice(product) * getChargeableQuantity(product, quantity)).toFixed(2));
}

export function getStickerPromoLabel(product: Pick<Product, "type">) {
  return product.type === "sticker" ? `Buy ${STICKER_PROMO_PAID_UNITS}, get 1 free` : null;
}

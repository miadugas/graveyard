import type { CreateOrderInput, Product } from "@/types";

const jsonHeaders = {
  "Content-Type": "application/json"
};

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) {
    throw new Error("Unable to load products");
  }
  return res.json();
}

export async function createOrder(payload: CreateOrderInput): Promise<{ orderId: string }> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unable to place order" }));
    throw new Error(error.message ?? "Unable to place order");
  }

  return res.json();
}

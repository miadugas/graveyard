export type ProductType = "sticker" | "button" | "bundle";

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  price: number;
  description: string;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  items: OrderItemInput[];
}

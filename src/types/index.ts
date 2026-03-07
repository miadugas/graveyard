export type ProductType = "sticker" | "button" | "bundle";

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  price: number;
  description: string;
  imageUrl: string | null;
}

export interface CreateProductInput {
  id: string;
  name: string;
  type: ProductType;
  price: number;
  description: string;
  imageUrl: string | null;
}

export interface Special {
  id: string;
  name: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  holidayKey: string | null;
  notes: string | null;
}

export interface CreateSpecialInput {
  name: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  holidayKey: string | null;
  notes: string | null;
}

export interface UpdateSpecialInput extends CreateSpecialInput {
  id: string;
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

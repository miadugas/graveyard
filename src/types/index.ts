export type ProductType = "sticker" | "button" | "bundle";
export type UserRole = "admin" | "customer";

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
  items: OrderItemInput[];
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

export interface OrderSummary {
  id: string;
  createdAt: string;
  totalQuantity: number;
  lineItemCount: number;
  totalAmount: number;
}

export interface OrderDetailItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDetail {
  id: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  items: OrderDetailItem[];
  totalQuantity: number;
  totalAmount: number;
}

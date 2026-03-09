import type {
  AuthUser,
  CreateOrderInput,
  CreateProductInput,
  CreateSpecialInput,
  LoginInput,
  OrderDetail,
  OrderSummary,
  Product,
  RegisterInput,
  Special,
  UpdateProductInput,
  UpdateSpecialInput
} from "@/types";

const jsonHeaders = {
  "Content-Type": "application/json"
};

const withCredentials = {
  credentials: "include" as const
};

interface ApiErrorPayload {
  message?: string;
  issues?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[] | undefined>;
  };
}

async function throwApiError(res: Response, fallback: string): Promise<never> {
  const payload = (await res.json().catch(() => ({}))) as ApiErrorPayload;
  const message = payload.message ?? fallback;

  const formErrors = payload.issues?.formErrors?.filter(Boolean) ?? [];
  const fieldErrors = Object.entries(payload.issues?.fieldErrors ?? {})
    .flatMap(([field, messages]) => (messages ?? []).filter(Boolean).map((entry) => `${field}: ${entry}`));
  const details = [...formErrors, ...fieldErrors];

  if (details.length > 0) {
    throw new Error(`${message}. ${details.join(" | ")}`);
  }

  throw new Error(message);
}

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
}

export interface CheckoutSessionResponse {
  url: string;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me", withCredentials);

  if (!res.ok) {
    throw new Error("Unable to load current user");
  }

  const data = (await res.json()) as { user: AuthUser | null };
  return data.user;
}

export async function login(payload: LoginInput): Promise<AuthUser> {
  const res = await fetch("/api/auth/login", {
    ...withCredentials,
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    await throwApiError(res, "Unable to sign in");
  }

  const data = (await res.json()) as { user: AuthUser };
  return data.user;
}

export async function register(payload: RegisterInput): Promise<AuthUser> {
  const res = await fetch("/api/auth/register", {
    ...withCredentials,
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    await throwApiError(res, "Unable to create account");
  }

  const data = (await res.json()) as { user: AuthUser };
  return data.user;
}

export async function logout(): Promise<void> {
  const res = await fetch("/api/auth/logout", {
    ...withCredentials,
    method: "POST"
  });

  if (!res.ok) {
    await throwApiError(res, "Unable to sign out");
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products", withCredentials);
  if (!res.ok) {
    throw new Error("Unable to load products");
  }
  return res.json();
}

export async function createOrder(payload: CreateOrderInput): Promise<{ orderId: string }> {
  const res = await fetch("/api/orders", {
    ...withCredentials,
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    await throwApiError(res, "Unable to place order");
  }

  return res.json();
}

export async function createCheckoutSession(payload: CreateOrderInput): Promise<CheckoutSessionResponse> {
  const res = await fetch("/api/payments/checkout-session", {
    ...withCredentials,
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    await throwApiError(res, "Unable to start checkout");
  }

  return res.json();
}

export async function fetchMyOrders(): Promise<OrderSummary[]> {
  const res = await fetch("/api/orders/me", withCredentials);
  if (!res.ok) {
    await throwApiError(res, "Unable to load orders");
  }
  return res.json();
}

export async function fetchOrderById(id: string): Promise<OrderDetail> {
  const res = await fetch(`/api/orders/${id}`, withCredentials);
  if (!res.ok) {
    await throwApiError(res, "Unable to load order detail");
  }
  return res.json();
}

export async function fetchUploadSignature(): Promise<UploadSignature> {
  const res = await fetch("/api/uploads/sign", {
    ...withCredentials,
    method: "POST"
  });

  if (!res.ok) {
    await throwApiError(res, "Unable to prepare image upload");
  }

  return res.json();
}

export async function createProduct(payload: CreateProductInput): Promise<Product> {
  const res = await fetch("/api/products", {
    ...withCredentials,
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    await throwApiError(res, "Unable to create product");
  }

  return res.json();
}

export async function updateProduct(payload: UpdateProductInput): Promise<Product> {
  const res = await fetch(`/api/products/${payload.id}`, {
    ...withCredentials,
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify({
      name: payload.name,
      type: payload.type,
      price: payload.price,
      description: payload.description,
      imageUrl: payload.imageUrl,
      stockQuantity: payload.stockQuantity,
      isSoldOut: payload.isSoldOut
    })
  });

  if (!res.ok) {
    await throwApiError(res, "Unable to update product");
  }

  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, { ...withCredentials, method: "DELETE" });
  if (!res.ok) {
    await throwApiError(res, "Unable to delete product");
  }
}

export async function setProductSoldOut(id: string, isSoldOut: boolean): Promise<Product> {
  const res = await fetch(`/api/products/${id}/sold-out`, {
    ...withCredentials,
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ isSoldOut })
  });

  if (!res.ok) {
    await throwApiError(res, "Unable to update sold-out status");
  }

  return res.json();
}

export async function setProductDisplayOrder(id: string, displayOrder: number): Promise<Product> {
  const res = await fetch(`/api/products/${id}/order`, {
    ...withCredentials,
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ displayOrder })
  });

  if (!res.ok) {
    await throwApiError(res, "Unable to update display order");
  }

  return res.json();
}

export async function fetchSpecials(): Promise<Special[]> {
  const res = await fetch("/api/specials", withCredentials);
  if (!res.ok) {
    throw new Error("Unable to load specials");
  }
  return res.json();
}

export async function createSpecial(payload: CreateSpecialInput): Promise<Special> {
  const res = await fetch("/api/specials", {
    ...withCredentials,
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    await throwApiError(res, "Unable to create special");
  }

  return res.json();
}

export async function updateSpecial(payload: UpdateSpecialInput): Promise<Special> {
  const res = await fetch(`/api/specials/${payload.id}`, {
    ...withCredentials,
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify({
      name: payload.name,
      discountPercent: payload.discountPercent,
      startDate: payload.startDate,
      endDate: payload.endDate,
      holidayKey: payload.holidayKey,
      notes: payload.notes
    })
  });

  if (!res.ok) {
    await throwApiError(res, "Unable to update special");
  }

  return res.json();
}

export async function deleteSpecial(id: string): Promise<void> {
  const res = await fetch(`/api/specials/${id}`, { ...withCredentials, method: "DELETE" });
  if (!res.ok) {
    await throwApiError(res, "Unable to delete special");
  }
}

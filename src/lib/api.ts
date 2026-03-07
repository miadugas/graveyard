import type {
  AuthUser,
  CreateOrderInput,
  CreateProductInput,
  CreateSpecialInput,
  LoginInput,
  Product,
  Special,
  UpdateSpecialInput
} from "@/types";

const jsonHeaders = {
  "Content-Type": "application/json"
};

const withCredentials = {
  credentials: "include" as const
};

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
    const error = await res.json().catch(() => ({ message: "Unable to sign in" }));
    throw new Error(error.message ?? "Unable to sign in");
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
    const error = await res.json().catch(() => ({ message: "Unable to sign out" }));
    throw new Error(error.message ?? "Unable to sign out");
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
    const error = await res.json().catch(() => ({ message: "Unable to place order" }));
    throw new Error(error.message ?? "Unable to place order");
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
    const error = await res.json().catch(() => ({ message: "Unable to create product" }));
    throw new Error(error.message ?? "Unable to create product");
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
    const error = await res.json().catch(() => ({ message: "Unable to create special" }));
    throw new Error(error.message ?? "Unable to create special");
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
    const error = await res.json().catch(() => ({ message: "Unable to update special" }));
    throw new Error(error.message ?? "Unable to update special");
  }

  return res.json();
}

export async function deleteSpecial(id: string): Promise<void> {
  const res = await fetch(`/api/specials/${id}`, { ...withCredentials, method: "DELETE" });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unable to delete special" }));
    throw new Error(error.message ?? "Unable to delete special");
  }
}

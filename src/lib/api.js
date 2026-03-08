const jsonHeaders = {
    "Content-Type": "application/json"
};
const withCredentials = {
    credentials: "include"
};
async function throwApiError(res, fallback) {
    const payload = (await res.json().catch(() => ({})));
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
export async function fetchCurrentUser() {
    const res = await fetch("/api/auth/me", withCredentials);
    if (!res.ok) {
        throw new Error("Unable to load current user");
    }
    const data = (await res.json());
    return data.user;
}
export async function login(payload) {
    const res = await fetch("/api/auth/login", {
        ...withCredentials,
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        await throwApiError(res, "Unable to sign in");
    }
    const data = (await res.json());
    return data.user;
}
export async function register(payload) {
    const res = await fetch("/api/auth/register", {
        ...withCredentials,
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        await throwApiError(res, "Unable to create account");
    }
    const data = (await res.json());
    return data.user;
}
export async function logout() {
    const res = await fetch("/api/auth/logout", {
        ...withCredentials,
        method: "POST"
    });
    if (!res.ok) {
        await throwApiError(res, "Unable to sign out");
    }
}
export async function fetchProducts() {
    const res = await fetch("/api/products", withCredentials);
    if (!res.ok) {
        throw new Error("Unable to load products");
    }
    return res.json();
}
export async function createOrder(payload) {
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
export async function fetchMyOrders() {
    const res = await fetch("/api/orders/me", withCredentials);
    if (!res.ok) {
        await throwApiError(res, "Unable to load orders");
    }
    return res.json();
}
export async function fetchOrderById(id) {
    const res = await fetch(`/api/orders/${id}`, withCredentials);
    if (!res.ok) {
        await throwApiError(res, "Unable to load order detail");
    }
    return res.json();
}
export async function fetchUploadSignature() {
    const res = await fetch("/api/uploads/sign", {
        ...withCredentials,
        method: "POST"
    });
    if (!res.ok) {
        await throwApiError(res, "Unable to prepare image upload");
    }
    return res.json();
}
export async function createProduct(payload) {
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
export async function updateProduct(payload) {
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
export async function deleteProduct(id) {
    const res = await fetch(`/api/products/${id}`, { ...withCredentials, method: "DELETE" });
    if (!res.ok) {
        await throwApiError(res, "Unable to delete product");
    }
}
export async function setProductSoldOut(id, isSoldOut) {
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
export async function setProductDisplayOrder(id, displayOrder) {
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
export async function fetchSpecials() {
    const res = await fetch("/api/specials", withCredentials);
    if (!res.ok) {
        throw new Error("Unable to load specials");
    }
    return res.json();
}
export async function createSpecial(payload) {
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
export async function updateSpecial(payload) {
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
export async function deleteSpecial(id) {
    const res = await fetch(`/api/specials/${id}`, { ...withCredentials, method: "DELETE" });
    if (!res.ok) {
        await throwApiError(res, "Unable to delete special");
    }
}

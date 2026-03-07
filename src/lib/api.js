const jsonHeaders = {
    "Content-Type": "application/json"
};
export async function fetchProducts() {
    const res = await fetch("/api/products");
    if (!res.ok) {
        throw new Error("Unable to load products");
    }
    return res.json();
}
export async function createOrder(payload) {
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
export async function createProduct(payload) {
    const res = await fetch("/api/products", {
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
export async function fetchSpecials() {
    const res = await fetch("/api/specials");
    if (!res.ok) {
        throw new Error("Unable to load specials");
    }
    return res.json();
}
export async function createSpecial(payload) {
    const res = await fetch("/api/specials", {
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
export async function updateSpecial(payload) {
    const res = await fetch(`/api/specials/${payload.id}`, {
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
export async function deleteSpecial(id) {
    const res = await fetch(`/api/specials/${id}`, { method: "DELETE" });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Unable to delete special" }));
        throw new Error(error.message ?? "Unable to delete special");
    }
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProduct, createSpecial, deleteProduct, deleteSpecial, fetchProducts, fetchSpecials, fetchUploadSignature, setProductDisplayOrder, setProductSoldOut, updateProduct, updateSpecial } from "@/lib/api";
function slugify(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);
}
function toIsoDate(year, month, day) {
    return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}
function durationDays(startDate, endDate) {
    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T00:00:00Z`);
    const ms = end.getTime() - start.getTime();
    return Math.max(1, Math.floor(ms / 86400000) + 1);
}
function formatDateRange(startDate, endDate) {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${fmt.format(start)} - ${fmt.format(end)}`;
}
function toDateOnly(value) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}
function addDays(base, days) {
    const next = new Date(base);
    next.setDate(next.getDate() + days);
    return next;
}
function toIsoLocal(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}
const typeOptions = ["sticker", "button", "bundle"];
const holidayPresets = [
    { key: "lupercalia", label: "Lupercalia", start: [2, 14], end: [2, 15] },
    { key: "all-snakes-day", label: "All Snakes Day", start: [3, 17], end: [3, 17] },
    { key: "hexennacht", label: "Hexennacht", start: [4, 30], end: [4, 30] },
    { key: "pride-month", label: "Pride Month", start: [6, 1], end: [6, 30] },
    { key: "juneteenth", label: "Juneteenth", start: [6, 19], end: [6, 19] },
    { key: "litha", label: "Litha", start: [6, 20], end: [6, 22] },
    { key: "halloween", label: "Halloween", start: [10, 31], end: [10, 31] },
    { key: "krampusnacht", label: "Krampusnacht", start: [12, 5], end: [12, 5] },
    { key: "yule", label: "Yule", start: [12, 21], end: [1, 1] }
];
const bannerShapeOptions = ["pill", "ribbon", "ticket", "burst"];
const bannerThemeOptions = ["none", "coffin", "tombstone", "bat", "spiderweb"];
export function AdminPage() {
    const calendarDialogTitleId = useId();
    const deleteDialogTitleId = useId();
    const calendarCloseButtonRef = useRef(null);
    const deleteCancelButtonRef = useRef(null);
    const previousCalendarFocusRef = useRef(null);
    const previousDeleteFocusRef = useRef(null);
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [type, setType] = useState("sticker");
    const [price, setPrice] = useState("5.00");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [displayOrder, setDisplayOrder] = useState("0");
    const [stockQuantity, setStockQuantity] = useState("25");
    const [productSoldOut, setProductSoldOutState] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const currentYear = new Date().getFullYear();
    const todayIso = toIsoLocal(new Date());
    const [holidayPreset, setHolidayPreset] = useState("custom");
    const [specialName, setSpecialName] = useState("");
    const [discountPercent, setDiscountPercent] = useState("15");
    const [startDate, setStartDate] = useState(toIsoDate(currentYear, 10, 31));
    const [endDate, setEndDate] = useState(toIsoDate(currentYear, 10, 31));
    const [notes, setNotes] = useState("");
    const [bannerEnabled, setBannerEnabled] = useState(false);
    const [bannerShape, setBannerShape] = useState("pill");
    const [bannerTheme, setBannerTheme] = useState("none");
    const [bannerText, setBannerText] = useState("");
    const [editingSpecialId, setEditingSpecialId] = useState(null);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [calendarMode, setCalendarMode] = useState("view");
    const [calendarCursor, setCalendarCursor] = useState(() => new Date(currentYear, new Date().getMonth(), 1));
    const [pendingDeleteSpecial, setPendingDeleteSpecial] = useState(null);
    const [deletingSpecialId, setDeletingSpecialId] = useState(null);
    const [specialFormError, setSpecialFormError] = useState(null);
    const [imageUploadError, setImageUploadError] = useState(null);
    const [isUploadingImage, setUploadingImage] = useState(false);
    const [productFormError, setProductFormError] = useState(null);
    const { data: products = [] } = useQuery({
        queryKey: ["products"],
        queryFn: fetchProducts
    });
    const { data: specials = [], isLoading: specialsLoading, isFetching: specialsFetching } = useQuery({
        queryKey: ["specials"],
        queryFn: fetchSpecials
    });
    const derivedId = useMemo(() => {
        const base = slugify(name || "new-item");
        return `${type}-${base}`;
    }, [name, type]);
    const createProductMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            setName("");
            setPrice("5.00");
            setDescription("");
            setImageUrl("");
            setDisplayOrder("0");
            setStockQuantity("25");
            setProductSoldOutState(false);
            setEditingProductId(null);
            setProductFormError(null);
            queryClient.invalidateQueries({ queryKey: ["products"] });
        }
    });
    const updateProductMutation = useMutation({
        mutationFn: updateProduct,
        onSuccess: () => {
            setName("");
            setPrice("5.00");
            setDescription("");
            setImageUrl("");
            setDisplayOrder("0");
            setStockQuantity("25");
            setProductSoldOutState(false);
            setEditingProductId(null);
            setProductFormError(null);
            queryClient.invalidateQueries({ queryKey: ["products"] });
        }
    });
    const deleteProductMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        }
    });
    const toggleSoldOutMutation = useMutation({
        mutationFn: ({ id, isSoldOut }) => setProductSoldOut(id, isSoldOut),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        }
    });
    const reorderProductMutation = useMutation({
        mutationFn: ({ id, displayOrder }) => setProductDisplayOrder(id, displayOrder),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        }
    });
    const createSpecialMutation = useMutation({
        mutationFn: createSpecial,
        onSuccess: () => {
            setSpecialName("");
            setDiscountPercent("15");
            setNotes("");
            setHolidayPreset("custom");
            setBannerEnabled(false);
            setBannerShape("pill");
            setBannerTheme("none");
            setBannerText("");
            queryClient.invalidateQueries({ queryKey: ["specials"] });
        }
    });
    const updateSpecialMutation = useMutation({
        mutationFn: updateSpecial,
        onSuccess: () => {
            setEditingSpecialId(null);
            setSpecialName("");
            setDiscountPercent("15");
            setNotes("");
            setHolidayPreset("custom");
            setBannerEnabled(false);
            setBannerShape("pill");
            setBannerTheme("none");
            setBannerText("");
            queryClient.invalidateQueries({ queryKey: ["specials"] });
        }
    });
    const deleteSpecialMutation = useMutation({
        mutationFn: deleteSpecial,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["specials"] });
        }
    });
    const specialsBusy = createSpecialMutation.isPending ||
        updateSpecialMutation.isPending ||
        deleteSpecialMutation.isPending ||
        (specialsFetching && !specialsLoading);
    const specialsByMonth = useMemo(() => {
        return specials.reduce((acc, special) => {
            const monthKey = new Date(`${special.startDate}T00:00:00`).toLocaleString("en-US", {
                month: "long",
                year: "numeric"
            });
            if (!acc[monthKey]) {
                acc[monthKey] = [];
            }
            acc[monthKey].push(special);
            return acc;
        }, {});
    }, [specials]);
    const specialsByDate = useMemo(() => {
        const map = new Map();
        for (const special of specials) {
            const start = toDateOnly(new Date(`${special.startDate}T00:00:00`));
            const end = toDateOnly(new Date(`${special.endDate}T00:00:00`));
            for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
                const key = toIsoLocal(cursor);
                const bucket = map.get(key) ?? [];
                bucket.push({ id: special.id, name: special.name, discountPercent: special.discountPercent });
                map.set(key, bucket);
            }
        }
        return map;
    }, [specials]);
    const monthLabel = useMemo(() => new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(calendarCursor), [calendarCursor]);
    const calendarDays = useMemo(() => {
        const monthStart = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
        const monthEnd = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 0);
        const startOffset = monthStart.getDay();
        const gridStart = addDays(monthStart, -startOffset);
        const days = [];
        for (let i = 0; i < 42; i += 1) {
            days.push(addDays(gridStart, i));
        }
        return { days, monthStart, monthEnd };
    }, [calendarCursor]);
    useEffect(() => {
        if (!calendarOpen) {
            return;
        }
        previousCalendarFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const frameId = window.requestAnimationFrame(() => {
            calendarCloseButtonRef.current?.focus();
        });
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                setCalendarOpen(false);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener("keydown", onKeyDown);
            previousCalendarFocusRef.current?.focus();
        };
    }, [calendarOpen]);
    useEffect(() => {
        if (!pendingDeleteSpecial) {
            return;
        }
        previousDeleteFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const frameId = window.requestAnimationFrame(() => {
            deleteCancelButtonRef.current?.focus();
        });
        const onKeyDown = (event) => {
            if (event.key === "Escape" && !deleteSpecialMutation.isPending) {
                setPendingDeleteSpecial(null);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener("keydown", onKeyDown);
            previousDeleteFocusRef.current?.focus();
        };
    }, [deleteSpecialMutation.isPending, pendingDeleteSpecial]);
    function handleHolidayPresetChange(value) {
        setHolidayPreset(value);
        if (value === "custom") {
            return;
        }
        const preset = holidayPresets.find((entry) => entry.key === value);
        if (!preset) {
            return;
        }
        const pickDatesForYear = (year) => {
            const start = toIsoDate(year, preset.start[0], preset.start[1]);
            const endYear = preset.end[0] < preset.start[0] ? year + 1 : year;
            const end = toIsoDate(endYear, preset.end[0], preset.end[1]);
            return { start, end };
        };
        let { start, end } = pickDatesForYear(currentYear);
        if (end < todayIso) {
            const next = pickDatesForYear(currentYear + 1);
            start = next.start;
            end = next.end;
        }
        setSpecialName(`${preset.label} Special`);
        setStartDate(start);
        setEndDate(end);
        setSpecialFormError(null);
    }
    function handleCreateProduct(event) {
        event.preventDefault();
        setProductFormError(null);
        const stock = Number(stockQuantity);
        if (!Number.isInteger(stock) || stock < 0) {
            setProductFormError("Stock quantity must be a non-negative whole number.");
            return;
        }
        const payload = {
            id: editingProductId ?? derivedId,
            name: name.trim(),
            type,
            price: Number(price),
            description: description.trim(),
            imageUrl: imageUrl.trim(),
            displayOrder: Number(displayOrder),
            stockQuantity: stock,
            isSoldOut: productSoldOut || stock <= 0
        };
        if (editingProductId) {
            updateProductMutation.mutate({
                id: editingProductId,
                name: payload.name,
                type: payload.type,
                price: payload.price,
                description: payload.description,
                imageUrl: payload.imageUrl,
                displayOrder: payload.displayOrder,
                stockQuantity: payload.stockQuantity,
                isSoldOut: payload.isSoldOut
            });
            return;
        }
        createProductMutation.mutate(payload);
    }
    function handleStartEditProduct(product) {
        setEditingProductId(product.id);
        setName(product.name);
        setType(product.type);
        setPrice(String(product.price));
        setDescription(product.description);
        setImageUrl(product.imageUrl ?? "");
        setDisplayOrder(String(product.displayOrder));
        setStockQuantity(String(product.stockQuantity));
        setProductSoldOutState(product.isSoldOut);
        setProductFormError(null);
        setImageUploadError(null);
    }
    function handleCancelEditProduct() {
        setEditingProductId(null);
        setName("");
        setType("sticker");
        setPrice("5.00");
        setDescription("");
        setImageUrl("");
        setDisplayOrder("0");
        setStockQuantity("25");
        setProductSoldOutState(false);
        setProductFormError(null);
        setImageUploadError(null);
    }
    async function handleUploadImage(event) {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        setImageUploadError(null);
        setUploadingImage(true);
        try {
            const signed = await fetchUploadSignature();
            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", signed.apiKey);
            formData.append("timestamp", String(signed.timestamp));
            formData.append("signature", signed.signature);
            formData.append("folder", signed.folder);
            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, {
                method: "POST",
                body: formData
            });
            if (!uploadRes.ok) {
                const error = await uploadRes.json().catch(() => ({ error: { message: "Image upload failed" } }));
                throw new Error(error.error?.message ?? "Image upload failed");
            }
            const uploadData = (await uploadRes.json());
            if (!uploadData.secure_url) {
                throw new Error("Cloudinary did not return an image URL");
            }
            setImageUrl(uploadData.secure_url);
        }
        catch (error) {
            setImageUploadError(error instanceof Error ? error.message : "Unable to upload image");
        }
        finally {
            setUploadingImage(false);
            event.target.value = "";
        }
    }
    function handleCreateSpecial(event) {
        event.preventDefault();
        setSpecialFormError(null);
        if (startDate < todayIso || endDate < todayIso) {
            setSpecialFormError("Special dates cannot be in the past.");
            return;
        }
        if (endDate < startDate) {
            setSpecialFormError("End date must be on or after start date.");
            return;
        }
        const payload = {
            name: specialName.trim(),
            discountPercent: Number(discountPercent),
            startDate,
            endDate,
            holidayKey: holidayPreset === "custom" ? null : holidayPreset,
            notes: notes.trim() || null,
            bannerEnabled,
            bannerShape,
            bannerTheme,
            bannerText: bannerText.trim() || null
        };
        if (editingSpecialId) {
            const updatePayload = { id: editingSpecialId, ...payload };
            updateSpecialMutation.mutate(updatePayload);
            return;
        }
        createSpecialMutation.mutate(payload);
    }
    function handleStartEditSpecial(special) {
        setEditingSpecialId(special.id);
        setSpecialName(special.name);
        setDiscountPercent(String(special.discountPercent));
        setStartDate(special.startDate);
        setEndDate(special.endDate);
        setNotes(special.notes ?? "");
        setBannerEnabled(special.bannerEnabled);
        setBannerShape(special.bannerShape);
        setBannerTheme(special.bannerTheme);
        setBannerText(special.bannerText ?? "");
        setSpecialFormError(null);
        const isKnownHoliday = holidayPresets.some((preset) => preset.key === special.holidayKey);
        if (special.holidayKey && isKnownHoliday) {
            setHolidayPreset(special.holidayKey);
        }
        else {
            setHolidayPreset("custom");
        }
    }
    function handleCancelEditSpecial() {
        setEditingSpecialId(null);
        setHolidayPreset("custom");
        setSpecialName("");
        setDiscountPercent("15");
        setStartDate(toIsoDate(currentYear, 10, 31));
        setEndDate(toIsoDate(currentYear, 10, 31));
        setNotes("");
        setBannerEnabled(false);
        setBannerShape("pill");
        setBannerTheme("none");
        setBannerText("");
        setSpecialFormError(null);
    }
    function handleRequestDeleteSpecial(special) {
        setPendingDeleteSpecial(special);
    }
    function handleConfirmDeleteSpecial() {
        if (!pendingDeleteSpecial) {
            return;
        }
        const targetId = pendingDeleteSpecial.id;
        setDeletingSpecialId(targetId);
        deleteSpecialMutation.mutate(targetId, {
            onSuccess: () => {
                setPendingDeleteSpecial(null);
                setDeletingSpecialId(null);
            },
            onError: () => {
                setDeletingSpecialId(null);
            }
        });
    }
    function openCalendar(mode, isoDate) {
        setCalendarMode(mode);
        if (isoDate) {
            const cursor = new Date(`${isoDate}T00:00:00`);
            if (!Number.isNaN(cursor.getTime())) {
                setCalendarCursor(new Date(cursor.getFullYear(), cursor.getMonth(), 1));
            }
        }
        setCalendarOpen(true);
    }
    function handleCalendarDaySelect(iso) {
        if (iso < todayIso) {
            return;
        }
        if (calendarMode === "pickStart") {
            setStartDate(iso);
            if (endDate < iso) {
                setEndDate(iso);
            }
            setCalendarOpen(false);
            return;
        }
        if (calendarMode === "pickEnd") {
            setEndDate(iso);
            if (startDate > iso) {
                setStartDate(iso);
            }
            setCalendarOpen(false);
        }
    }
    const totalInStock = useMemo(() => products.reduce((sum, product) => sum + product.stockQuantity, 0), [products]);
    const soldOutCount = useMemo(() => products.filter((product) => product.isSoldOut || product.stockQuantity <= 0).length, [products]);
    const lowStockCount = useMemo(() => products.filter((product) => !product.isSoldOut && product.stockQuantity > 0 && product.stockQuantity <= 5).length, [products]);
    const sortedProducts = useMemo(() => [...products].sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name)), [products]);
    return (_jsxs("main", { className: "gg-page", children: [_jsxs("section", { className: "grid gap-6 lg:grid-cols-[0.9fr_1.1fr]", children: [_jsxs("article", { className: "gg-panel", children: [_jsx("p", { className: "gg-kicker", children: "Admin" }), _jsx("h2", { className: "mt-2 font-display text-3xl text-white", children: editingProductId ? "Edit Item" : "Add Item" }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: "Create, edit, and stock stickers, buttons, and bundles." }), _jsxs("div", { className: "mt-3 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-zinc-300 sm:grid-cols-4", children: [_jsxs("p", { children: ["Total products: ", _jsx("span", { className: "font-semibold text-white", children: products.length })] }), _jsxs("p", { children: ["Total stock: ", _jsx("span", { className: "font-semibold text-white", children: totalInStock })] }), _jsxs("p", { children: ["Sold out: ", _jsx("span", { className: "font-semibold text-white", children: soldOutCount })] }), _jsxs("p", { children: ["Low stock: ", _jsx("span", { className: "font-semibold text-white", children: lowStockCount })] })] }), _jsxs("form", { className: "mt-5 grid gap-3", onSubmit: handleCreateProduct, children: [_jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Name" }), _jsx("input", { className: "rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1", onChange: (event) => setName(event.target.value), required: true, type: "text", value: name })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Type" }), _jsx("select", { className: "rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1", onChange: (event) => setType(event.target.value), value: type, children: typeOptions.map((option) => (_jsx("option", { value: option, children: option }, option))) })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Price (USD)" }), _jsx("input", { className: "rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1", min: "0", onChange: (event) => setPrice(event.target.value), required: true, step: "0.01", type: "number", value: price })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Display Order" }), _jsx("input", { className: "rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1", min: "0", onChange: (event) => setDisplayOrder(event.target.value), required: true, step: "1", type: "number", value: displayOrder }), _jsx("span", { className: "text-xs text-zinc-500", children: "Lower numbers appear first on the storefront." })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Stock Quantity" }), _jsx("input", { className: "rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1", min: "0", onChange: (event) => setStockQuantity(event.target.value), required: true, step: "1", type: "number", value: stockQuantity }), _jsx("span", { className: "text-xs text-zinc-500", children: "Set to 0 to force sold-out behavior automatically." })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Description" }), _jsx("textarea", { className: "min-h-24 rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1", onChange: (event) => setDescription(event.target.value), required: true, value: description })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Image URL" }), _jsx("input", { className: "rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1", onChange: (event) => setImageUrl(event.target.value), placeholder: "https://...", type: "url", value: imageUrl }), _jsx("span", { className: "text-xs text-zinc-500", children: "Paste a full URL or use the Cloudinary upload button below." })] }), _jsxs("div", { className: "grid gap-2", children: [_jsxs("label", { className: "inline-flex w-fit cursor-pointer items-center rounded-full border border-white/25 px-3 py-1.5 text-sm text-zinc-200 transition hover:bg-white hover:text-black", children: [_jsx("input", { accept: "image/*", className: "hidden", onChange: handleUploadImage, type: "file" }), isUploadingImage ? "Uploading image..." : "Upload to Cloudinary"] }), imageUploadError ? _jsx("p", { className: "text-sm text-zinc-300", children: imageUploadError }) : null] }), _jsxs("div", { className: "rounded-lg border border-dashed border-white/20 bg-black/25 px-3 py-2 text-xs text-zinc-400", children: ["Product ID: ", _jsx("span", { className: "font-semibold text-zinc-200", children: editingProductId ?? derivedId })] }), _jsxs("label", { className: "inline-flex items-center gap-2 text-sm text-zinc-300", children: [_jsx("input", { checked: productSoldOut, className: "h-4 w-4 rounded border-white/30 bg-black/40", onChange: (event) => setProductSoldOutState(event.target.checked), type: "checkbox" }), "Mark as sold out"] }), _jsx("p", { className: "text-xs text-zinc-500", children: "Use sold-out toggle for pauses even when stock is above zero." }), createProductMutation.isError ? (_jsx("p", { className: "text-sm text-zinc-300", children: createProductMutation.error.message })) : null, updateProductMutation.isError ? (_jsx("p", { className: "text-sm text-zinc-300", children: updateProductMutation.error.message })) : null, deleteProductMutation.isError ? (_jsx("p", { className: "text-sm text-zinc-300", children: deleteProductMutation.error.message })) : null, toggleSoldOutMutation.isError ? (_jsx("p", { className: "text-sm text-zinc-300", children: toggleSoldOutMutation.error.message })) : null, reorderProductMutation.isError ? (_jsx("p", { className: "text-sm text-zinc-300", children: reorderProductMutation.error.message })) : null, productFormError ? _jsx("p", { className: "text-sm text-zinc-300", children: productFormError }) : null, _jsxs("div", { className: "mt-1 flex flex-wrap gap-2", children: [_jsx("button", { className: "gg-btn-primary", disabled: createProductMutation.isPending || updateProductMutation.isPending, type: "submit", children: createProductMutation.isPending || updateProductMutation.isPending
                                                    ? "Saving..."
                                                    : editingProductId
                                                        ? "Save Product"
                                                        : "Add Product" }), editingProductId ? (_jsx("button", { className: "gg-btn-secondary", onClick: handleCancelEditProduct, type: "button", children: "Cancel" })) : null] })] })] }), _jsxs("article", { className: "gg-panel", children: [_jsx("h3", { className: "font-display text-2xl text-white", children: "Current Catalog" }), _jsxs("p", { className: "mt-1 text-sm text-zinc-300", children: [products.length, " products, sorted by display order"] }), _jsx("div", { className: "mt-4 max-h-[540px] space-y-2 overflow-y-auto pr-1", children: sortedProducts.map((product) => (_jsxs("div", { className: "rounded-xl border border-white/10 bg-black/30 p-3", children: [product.imageUrl ? (_jsx("img", { alt: product.name, className: "mb-2 h-24 w-full rounded-md border border-white/15 object-cover", src: product.imageUrl })) : null, _jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: product.type }), _jsx("p", { className: "font-semibold text-white", children: product.name }), _jsxs("p", { className: "text-sm text-zinc-300", children: ["$", product.price.toFixed(2)] }), _jsxs("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: ["Order: ", product.displayOrder] }), _jsxs("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: ["Stock: ", product.stockQuantity, " ", product.isSoldOut || product.stockQuantity <= 0 ? "(Sold Out)" : ""] }), !product.isSoldOut && product.stockQuantity > 0 && product.stockQuantity <= 5 ? (_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-amber-300", children: "Low Stock Alert" })) : null, _jsx("p", { className: "mt-1 text-sm text-zinc-300", children: product.description }), _jsx("p", { className: "mt-1 text-xs text-zinc-500", children: product.id }), _jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [_jsx("button", { className: "rounded-full border border-white/25 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white hover:text-black", onClick: () => handleStartEditProduct(product), type: "button", children: "Edit" }), _jsx("button", { className: "rounded-full border border-white/25 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white hover:text-black disabled:opacity-50", disabled: reorderProductMutation.isPending, onClick: () => reorderProductMutation.mutate({
                                                        id: product.id,
                                                        displayOrder: Math.max(0, product.displayOrder - 1)
                                                    }), type: "button", children: "Move Up" }), _jsx("button", { className: "rounded-full border border-white/25 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white hover:text-black disabled:opacity-50", disabled: reorderProductMutation.isPending, onClick: () => reorderProductMutation.mutate({
                                                        id: product.id,
                                                        displayOrder: product.displayOrder + 1
                                                    }), type: "button", children: "Move Down" }), _jsx("button", { className: "rounded-full border border-white/25 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white hover:text-black disabled:opacity-50", disabled: toggleSoldOutMutation.isPending, onClick: () => toggleSoldOutMutation.mutate({
                                                        id: product.id,
                                                        isSoldOut: !(product.isSoldOut || product.stockQuantity <= 0)
                                                    }), type: "button", children: product.isSoldOut || product.stockQuantity <= 0 ? "Mark Active" : "Mark Sold Out" }), _jsx("button", { className: "rounded-full border border-white/25 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white hover:text-black disabled:opacity-50", disabled: deleteProductMutation.isPending, onClick: () => deleteProductMutation.mutate(product.id), type: "button", children: "Delete" })] })] }, product.id))) })] })] }), _jsxs("section", { className: "mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]", children: [_jsxs("article", { className: "gg-panel", children: [_jsx("p", { className: "gg-kicker", children: "Specials" }), _jsx("h3", { className: "mt-2 font-display text-2xl text-white", children: editingSpecialId ? "Edit Holiday Discount" : "Schedule Holiday Discount" }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: "Recommended range is 10% to 20% off." }), _jsxs("form", { className: "mt-4 grid gap-3", onSubmit: handleCreateSpecial, children: [_jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Holiday Preset" }), _jsxs("select", { className: "rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1", onChange: (event) => handleHolidayPresetChange(event.target.value), value: holidayPreset, children: [_jsx("option", { value: "custom", children: "Custom Special" }), holidayPresets.map((preset) => (_jsx("option", { value: preset.key, children: preset.label }, preset.key)))] })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Special Name" }), _jsx("input", { className: "rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1", onChange: (event) => setSpecialName(event.target.value), required: true, type: "text", value: specialName })] }), _jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [_jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Discount %" }), _jsx("input", { className: "rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1", max: "20", min: "10", onChange: (event) => setDiscountPercent(event.target.value), required: true, step: "1", type: "number", value: discountPercent })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Start" }), _jsx("button", { className: "rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-left text-white outline-none ring-white transition focus:ring-1", onClick: () => openCalendar("pickStart", startDate), type: "button", children: startDate })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "End" }), _jsx("button", { className: "rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-left text-white outline-none ring-white transition focus:ring-1", onClick: () => openCalendar("pickEnd", endDate), type: "button", children: endDate })] })] }), _jsx("button", { className: "w-fit rounded-full border border-white/25 px-3 py-1 text-xs text-zinc-200 transition hover:bg-white hover:text-black", onClick: () => openCalendar("view"), type: "button", children: "Open Specials Calendar" }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Notes" }), _jsx("textarea", { className: "min-h-20 rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1", onChange: (event) => setNotes(event.target.value), placeholder: "Optional campaign notes...", value: notes })] }), _jsxs("label", { className: "inline-flex items-center gap-2 text-sm text-zinc-300", children: [_jsx("input", { checked: bannerEnabled, className: "h-4 w-4 rounded border-white/30 bg-black/40", onChange: (event) => setBannerEnabled(event.target.checked), type: "checkbox" }), "Show discount banner on shop"] }), _jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [_jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Banner Shape" }), _jsx("select", { className: "rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1", disabled: !bannerEnabled, onChange: (event) => setBannerShape(event.target.value), value: bannerShape, children: bannerShapeOptions.map((shape) => (_jsx("option", { value: shape, children: shape }, shape))) })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Spooky Theme" }), _jsx("select", { className: "rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1", disabled: !bannerEnabled, onChange: (event) => setBannerTheme(event.target.value), value: bannerTheme, children: bannerThemeOptions.map((theme) => (_jsx("option", { value: theme, children: theme }, theme))) })] })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Banner Text Override" }), _jsx("input", { className: "rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1", disabled: !bannerEnabled, maxLength: 180, onChange: (event) => setBannerText(event.target.value), placeholder: "Optional custom banner copy...", type: "text", value: bannerText })] }), createSpecialMutation.isError ? _jsx("p", { className: "text-sm text-zinc-300", children: createSpecialMutation.error.message }) : null, updateSpecialMutation.isError ? _jsx("p", { className: "text-sm text-zinc-300", children: updateSpecialMutation.error.message }) : null, specialFormError ? _jsx("p", { className: "text-sm text-zinc-300", children: specialFormError }) : null, _jsxs("div", { className: "mt-1 flex gap-2", children: [_jsx("button", { className: "rounded-full border border-white bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50", disabled: createSpecialMutation.isPending || updateSpecialMutation.isPending, type: "submit", children: editingSpecialId
                                                    ? updateSpecialMutation.isPending
                                                        ? "Saving..."
                                                        : "Save Changes"
                                                    : createSpecialMutation.isPending
                                                        ? "Saving..."
                                                        : "Schedule Special" }), editingSpecialId ? (_jsx("button", { className: "rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white hover:text-black", onClick: handleCancelEditSpecial, type: "button", children: "Cancel" })) : null] })] })] }), _jsxs("article", { className: "gg-panel", children: [_jsx("h3", { className: "font-display text-2xl text-white", children: "Specials Calendar" }), _jsxs("p", { className: "mt-1 text-sm text-zinc-300", children: [specials.length, " specials scheduled"] }), _jsxs("div", { className: "mt-4 max-h-[540px] space-y-4 overflow-y-auto pr-1", children: [specialsBusy ? (_jsx("div", { className: "rounded-xl border border-white/10 bg-black/25 p-4", children: _jsxs("p", { className: "inline-flex items-center gap-2 text-sm text-zinc-300", children: [_jsx("span", { className: "h-3.5 w-3.5 animate-spin rounded-full border border-zinc-300 border-t-transparent" }), "Updating specials..."] }) })) : null, specialsLoading ? (_jsx("div", { className: "rounded-xl border border-white/10 bg-black/25 p-4", children: _jsxs("p", { className: "inline-flex items-center gap-2 text-sm text-zinc-300", children: [_jsx("span", { className: "h-3.5 w-3.5 animate-spin rounded-full border border-zinc-300 border-t-transparent" }), "Loading specials..."] }) })) : Object.entries(specialsByMonth).length === 0 ? (_jsx("p", { className: "text-sm text-zinc-400", children: "No specials yet. Use the form to schedule your first holiday drop." })) : (Object.entries(specialsByMonth).map(([month, monthSpecials]) => (_jsxs("div", { children: [_jsx("p", { className: "mb-2 text-xs uppercase tracking-[0.14em] text-zinc-400", children: month }), _jsx("div", { className: "space-y-2", children: monthSpecials.map((special) => (_jsxs("article", { className: `rounded-xl border border-white/10 bg-black/30 p-3 transition ${deletingSpecialId === special.id ? "opacity-60" : "opacity-100"}`, children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsx("p", { className: "font-semibold text-white", children: special.name }), _jsxs("span", { className: "rounded-full border border-white/20 px-2 py-0.5 text-xs text-zinc-200", children: [special.discountPercent, "% off"] })] }), _jsx("p", { className: "mt-1 text-sm text-zinc-300", children: formatDateRange(special.startDate, special.endDate) }), _jsxs("p", { className: "text-xs text-zinc-500", children: [durationDays(special.startDate, special.endDate), " day campaign"] }), special.bannerEnabled ? (_jsxs("p", { className: "text-xs uppercase tracking-[0.08em] text-zinc-400", children: ["Banner: ", special.bannerShape, " / ", special.bannerTheme] })) : null, deletingSpecialId === special.id ? (_jsxs("p", { className: "mt-2 inline-flex items-center gap-2 text-xs text-zinc-300", children: [_jsx("span", { className: "h-3 w-3 animate-spin rounded-full border border-zinc-300 border-t-transparent" }), "Removing special..."] })) : null, special.notes ? _jsx("p", { className: "mt-2 text-sm text-zinc-400", children: special.notes }) : null, _jsxs("div", { className: "mt-3 flex gap-2", children: [_jsx("button", { className: "rounded-full border border-white/25 px-3 py-1 text-xs text-zinc-200 transition hover:bg-white hover:text-black", onClick: () => handleStartEditSpecial(special), disabled: deletingSpecialId === special.id, type: "button", children: "Edit" }), _jsx("button", { className: "rounded-full border border-white/25 px-3 py-1 text-xs text-zinc-200 transition hover:bg-white hover:text-black disabled:opacity-50", disabled: deleteSpecialMutation.isPending || deletingSpecialId === special.id, onClick: () => handleRequestDeleteSpecial(special), type: "button", children: "Delete" })] })] }, special.id))) })] }, month))))] })] })] }), calendarOpen ? (_jsx("div", { className: "fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-4 pb-4 pt-24 backdrop-blur-[1px]", children: _jsxs("div", { "aria-labelledby": calendarDialogTitleId, "aria-modal": "true", className: "w-full max-w-3xl rounded-2xl border border-white/20 bg-zinc-950 p-4 shadow-2xl shadow-black/70 sm:p-5", role: "dialog", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.16em] text-zinc-400", children: "Specials Calendar" }), _jsx("h3", { className: "font-display text-2xl text-white", id: calendarDialogTitleId, children: monthLabel }), calendarMode === "pickStart" ? (_jsx("p", { className: "text-xs text-zinc-400", children: "Select start date" })) : calendarMode === "pickEnd" ? (_jsx("p", { className: "text-xs text-zinc-400", children: "Select end date" })) : null] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "rounded-full border border-white/25 px-3 py-1 text-sm text-zinc-200 transition hover:bg-white hover:text-black", onClick: () => setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)), type: "button", children: "\u2190" }), _jsx("button", { className: "rounded-full border border-white/25 px-3 py-1 text-sm text-zinc-200 transition hover:bg-white hover:text-black", onClick: () => setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)), type: "button", children: "\u2192" }), _jsx("button", { className: "rounded-full border border-white bg-white px-3 py-1 text-sm font-semibold text-black transition hover:bg-zinc-200", onClick: () => setCalendarOpen(false), ref: calendarCloseButtonRef, type: "button", children: "Close" })] })] }), _jsx("div", { className: "grid grid-cols-7 gap-2 text-xs uppercase tracking-[0.12em] text-zinc-500", children: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (_jsx("p", { className: "px-2 py-1", children: day }, day))) }), _jsx("div", { className: "grid grid-cols-7 gap-1.5 sm:gap-2", children: calendarDays.days.map((day) => {
                                const iso = toIsoLocal(day);
                                const inMonth = day >= calendarDays.monthStart && day <= calendarDays.monthEnd;
                                const daySpecials = specialsByDate.get(iso) ?? [];
                                const isStart = iso === startDate;
                                const isEnd = iso === endDate;
                                const isRangePickMode = calendarMode === "pickStart" || calendarMode === "pickEnd";
                                const isPast = iso < todayIso;
                                return (_jsxs("button", { className: `min-h-[76px] rounded-lg border p-1.5 text-left transition sm:min-h-[86px] sm:p-2 ${inMonth ? "border-white/15 bg-black/30" : "border-white/5 bg-black/15"} ${isRangePickMode ? "hover:border-white/35 hover:bg-black/45" : ""} ${isStart || isEnd ? "border-white bg-white/10" : ""} ${isPast ? "cursor-not-allowed opacity-45" : ""}`, onClick: () => (isRangePickMode && !isPast ? handleCalendarDaySelect(iso) : undefined), type: "button", children: [_jsx("p", { className: `text-xs ${inMonth ? "text-zinc-300" : "text-zinc-600"}`, children: day.getDate() }), isStart ? _jsx("p", { className: "text-[10px] text-zinc-200", children: "Start" }) : null, isEnd ? _jsx("p", { className: "text-[10px] text-zinc-200", children: "End" }) : null, _jsxs("div", { className: "mt-1 space-y-1", children: [daySpecials.slice(0, 2).map((special) => (_jsxs("div", { className: "rounded bg-white/10 px-1.5 py-1 text-[10px] text-zinc-200", children: [special.name, " (", special.discountPercent, "%)"] }, `${iso}-${special.id}`))), daySpecials.length > 2 ? (_jsxs("p", { className: "text-[10px] text-zinc-400", children: ["+", daySpecials.length - 2, " more"] })) : null] })] }, iso));
                            }) })] }) })) : null, pendingDeleteSpecial ? (_jsx("div", { className: "fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4", children: _jsxs("div", { "aria-labelledby": deleteDialogTitleId, "aria-modal": "true", className: "w-full max-w-md rounded-2xl border border-white/20 bg-zinc-950 p-5 shadow-2xl shadow-black/80", role: "dialog", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.14em] text-zinc-400", children: "Confirm Delete" }), _jsx("h4", { className: "mt-2 font-display text-2xl text-white", id: deleteDialogTitleId, children: "Delete Special?" }), _jsxs("p", { className: "mt-2 text-sm text-zinc-300", children: ["This will remove ", _jsx("span", { className: "font-semibold text-white", children: pendingDeleteSpecial.name }), " from your specials calendar."] }), _jsxs("div", { className: "mt-5 flex justify-end gap-2", children: [_jsx("button", { className: "rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white hover:text-black", onClick: () => setPendingDeleteSpecial(null), disabled: deleteSpecialMutation.isPending, ref: deleteCancelButtonRef, type: "button", children: "Cancel" }), _jsx("button", { className: "rounded-full border border-white bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50", disabled: deleteSpecialMutation.isPending, onClick: handleConfirmDeleteSpecial, type: "button", children: deleteSpecialMutation.isPending ? (_jsxs("span", { className: "inline-flex items-center gap-2", children: [_jsx("span", { className: "h-3 w-3 animate-spin rounded-full border border-black border-t-transparent" }), "Deleting..."] })) : ("Delete") })] })] }) })) : null] }));
}

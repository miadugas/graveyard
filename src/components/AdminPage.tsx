import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  createSpecial,
  deleteProduct,
  deleteSpecial,
  fetchProducts,
  fetchSpecials,
  fetchUploadSignature,
  setProductDisplayOrder,
  setProductSoldOut,
  updateProduct,
  updateSpecial
} from "@/lib/api";
import type { CreateProductInput, CreateSpecialInput, Product, ProductType, Special, UpdateSpecialInput } from "@/types";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function toIsoDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

function durationDays(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.floor(ms / 86_400_000) + 1);
}

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt.format(start)} - ${fmt.format(end)}`;
}

function toDateOnly(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function toIsoLocal(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const typeOptions: ProductType[] = ["sticker", "button", "bundle"];

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
] as const;
const bannerShapeOptions = ["pill", "ribbon", "ticket", "burst"] as const;
const bannerThemeOptions = ["none", "coffin", "tombstone", "bat", "spiderweb"] as const;

type HolidayPresetKey = (typeof holidayPresets)[number]["key"] | "custom";
type CalendarMode = "view" | "pickStart" | "pickEnd";

export function AdminPage() {
  const calendarDialogTitleId = useId();
  const deleteDialogTitleId = useId();
  const calendarCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const deleteCancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousCalendarFocusRef = useRef<HTMLElement | null>(null);
  const previousDeleteFocusRef = useRef<HTMLElement | null>(null);

  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<ProductType>("sticker");
  const [price, setPrice] = useState("5.00");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [stockQuantity, setStockQuantity] = useState("25");
  const [productSoldOut, setProductSoldOutState] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const todayIso = toIsoLocal(new Date());
  const [holidayPreset, setHolidayPreset] = useState<HolidayPresetKey>("custom");
  const [specialName, setSpecialName] = useState("");
  const [discountPercent, setDiscountPercent] = useState("15");
  const [startDate, setStartDate] = useState(toIsoDate(currentYear, 10, 31));
  const [endDate, setEndDate] = useState(toIsoDate(currentYear, 10, 31));
  const [notes, setNotes] = useState("");
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [bannerShape, setBannerShape] = useState<(typeof bannerShapeOptions)[number]>("pill");
  const [bannerTheme, setBannerTheme] = useState<(typeof bannerThemeOptions)[number]>("none");
  const [bannerText, setBannerText] = useState("");
  const [editingSpecialId, setEditingSpecialId] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState<CalendarMode>("view");
  const [calendarCursor, setCalendarCursor] = useState(() => new Date(currentYear, new Date().getMonth(), 1));
  const [pendingDeleteSpecial, setPendingDeleteSpecial] = useState<Special | null>(null);
  const [deletingSpecialId, setDeletingSpecialId] = useState<string | null>(null);
  const [specialFormError, setSpecialFormError] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [isUploadingImage, setUploadingImage] = useState(false);
  const [productFormError, setProductFormError] = useState<string | null>(null);

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
    mutationFn: ({ id, isSoldOut }: { id: string; isSoldOut: boolean }) => setProductSoldOut(id, isSoldOut),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
  const reorderProductMutation = useMutation({
    mutationFn: ({ id, displayOrder }: { id: string; displayOrder: number }) => setProductDisplayOrder(id, displayOrder),
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

  const specialsBusy =
    createSpecialMutation.isPending ||
    updateSpecialMutation.isPending ||
    deleteSpecialMutation.isPending ||
    (specialsFetching && !specialsLoading);

  const specialsByMonth = useMemo(() => {
    return specials.reduce<Record<string, typeof specials>>((acc, special) => {
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
    const map = new Map<string, Array<{ id: string; name: string; discountPercent: number }>>();
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

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(calendarCursor),
    [calendarCursor]
  );

  const calendarDays = useMemo(() => {
    const monthStart = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
    const monthEnd = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 0);
    const startOffset = monthStart.getDay();
    const gridStart = addDays(monthStart, -startOffset);
    const days: Date[] = [];
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

    const onKeyDown = (event: KeyboardEvent) => {
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

    const onKeyDown = (event: KeyboardEvent) => {
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

  function handleHolidayPresetChange(value: HolidayPresetKey) {
    setHolidayPreset(value);
    if (value === "custom") {
      return;
    }

    const preset = holidayPresets.find((entry) => entry.key === value);
    if (!preset) {
      return;
    }

    const pickDatesForYear = (year: number) => {
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

  function handleCreateProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProductFormError(null);

    const stock = Number(stockQuantity);
    if (!Number.isInteger(stock) || stock < 0) {
      setProductFormError("Stock quantity must be a non-negative whole number.");
      return;
    }

    const payload: CreateProductInput = {
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

  function handleStartEditProduct(product: Product) {
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

  async function handleUploadImage(event: React.ChangeEvent<HTMLInputElement>) {
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

      const uploadData = (await uploadRes.json()) as { secure_url?: string };
      if (!uploadData.secure_url) {
        throw new Error("Cloudinary did not return an image URL");
      }

      setImageUrl(uploadData.secure_url);
    } catch (error) {
      setImageUploadError(error instanceof Error ? error.message : "Unable to upload image");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  function handleCreateSpecial(event: React.FormEvent<HTMLFormElement>) {
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

    const payload: CreateSpecialInput = {
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
      const updatePayload: UpdateSpecialInput = { id: editingSpecialId, ...payload };
      updateSpecialMutation.mutate(updatePayload);
      return;
    }

    createSpecialMutation.mutate(payload);
  }

  function handleStartEditSpecial(special: Special) {
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
      setHolidayPreset(special.holidayKey as HolidayPresetKey);
    } else {
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

  function handleRequestDeleteSpecial(special: Special) {
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

  function openCalendar(mode: CalendarMode, isoDate?: string) {
    setCalendarMode(mode);
    if (isoDate) {
      const cursor = new Date(`${isoDate}T00:00:00`);
      if (!Number.isNaN(cursor.getTime())) {
        setCalendarCursor(new Date(cursor.getFullYear(), cursor.getMonth(), 1));
      }
    }
    setCalendarOpen(true);
  }

  function handleCalendarDaySelect(iso: string) {
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
  const soldOutCount = useMemo(
    () => products.filter((product) => product.isSoldOut || product.stockQuantity <= 0).length,
    [products]
  );
  const lowStockCount = useMemo(
    () => products.filter((product) => !product.isSoldOut && product.stockQuantity > 0 && product.stockQuantity <= 5).length,
    [products]
  );
  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name)),
    [products]
  );

  return (
    <main className="gg-page">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="gg-panel">
          <p className="gg-kicker">Admin</p>
          <h2 className="mt-2 font-display text-3xl text-white">{editingProductId ? "Edit Item" : "Add Item"}</h2>
          <p className="mt-2 text-sm text-zinc-300">Create, edit, and stock stickers, buttons, and bundles.</p>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-zinc-300 sm:grid-cols-4">
            <p>Total products: <span className="font-semibold text-white">{products.length}</span></p>
            <p>Total stock: <span className="font-semibold text-white">{totalInStock}</span></p>
            <p>Sold out: <span className="font-semibold text-white">{soldOutCount}</span></p>
            <p>Low stock: <span className="font-semibold text-white">{lowStockCount}</span></p>
          </div>

          <form className="mt-5 grid gap-3" onSubmit={handleCreateProduct}>
            <label className="grid gap-1 text-sm">
              <span className="text-zinc-300">Name</span>
              <input
                className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                onChange={(event) => setName(event.target.value)}
                required
                type="text"
                value={name}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-300">Type</span>
              <select
                className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                onChange={(event) => setType(event.target.value as ProductType)}
                value={type}
              >
                {typeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-300">Price (USD)</span>
              <input
                className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                min="0"
                onChange={(event) => setPrice(event.target.value)}
                required
                step="0.01"
                type="number"
                value={price}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-300">Display Order</span>
              <input
                className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                min="0"
                onChange={(event) => setDisplayOrder(event.target.value)}
                required
                step="1"
                type="number"
                value={displayOrder}
              />
              <span className="text-xs text-zinc-500">Lower numbers appear first on the storefront.</span>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-300">Stock Quantity</span>
              <input
                className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                min="0"
                onChange={(event) => setStockQuantity(event.target.value)}
                required
                step="1"
                type="number"
                value={stockQuantity}
              />
              <span className="text-xs text-zinc-500">Set to 0 to force sold-out behavior automatically.</span>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-300">Description</span>
              <textarea
                className="min-h-24 rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                onChange={(event) => setDescription(event.target.value)}
                required
                value={description}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-300">Image URL</span>
              <input
                className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://..."
                type="url"
                value={imageUrl}
              />
              <span className="text-xs text-zinc-500">Paste a full URL or use the Cloudinary upload button below.</span>
            </label>

            <div className="grid gap-2">
              <label className="inline-flex w-fit cursor-pointer items-center rounded-full border border-white/25 px-3 py-1.5 text-sm text-zinc-200 transition hover:bg-white hover:text-black">
                <input accept="image/*" className="hidden" onChange={handleUploadImage} type="file" />
                {isUploadingImage ? "Uploading image..." : "Upload to Cloudinary"}
              </label>
              {imageUploadError ? <p className="text-sm text-zinc-300">{imageUploadError}</p> : null}
            </div>

            <div className="rounded-lg border border-dashed border-white/20 bg-black/25 px-3 py-2 text-xs text-zinc-400">
              Product ID: <span className="font-semibold text-zinc-200">{editingProductId ?? derivedId}</span>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
              <input
                checked={productSoldOut}
                className="h-4 w-4 rounded border-white/30 bg-black/40"
                onChange={(event) => setProductSoldOutState(event.target.checked)}
                type="checkbox"
              />
              Mark as sold out
            </label>
            <p className="text-xs text-zinc-500">Use sold-out toggle for pauses even when stock is above zero.</p>

            {createProductMutation.isError ? (
              <p className="text-sm text-zinc-300">{createProductMutation.error.message}</p>
            ) : null}
            {updateProductMutation.isError ? (
              <p className="text-sm text-zinc-300">{updateProductMutation.error.message}</p>
            ) : null}
            {deleteProductMutation.isError ? (
              <p className="text-sm text-zinc-300">{deleteProductMutation.error.message}</p>
            ) : null}
            {toggleSoldOutMutation.isError ? (
              <p className="text-sm text-zinc-300">{toggleSoldOutMutation.error.message}</p>
            ) : null}
            {reorderProductMutation.isError ? (
              <p className="text-sm text-zinc-300">{reorderProductMutation.error.message}</p>
            ) : null}
            {productFormError ? <p className="text-sm text-zinc-300">{productFormError}</p> : null}

            <div className="mt-1 flex flex-wrap gap-2">
              <button
                className="gg-btn-primary"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
                type="submit"
              >
                {createProductMutation.isPending || updateProductMutation.isPending
                  ? "Saving..."
                  : editingProductId
                    ? "Save Product"
                    : "Add Product"}
              </button>
              {editingProductId ? (
                <button
                  className="gg-btn-secondary"
                  onClick={handleCancelEditProduct}
                  type="button"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </article>

        <article className="gg-panel">
          <h3 className="font-display text-2xl text-white">Current Catalog</h3>
          <p className="mt-1 text-sm text-zinc-300">
            {products.length} products, sorted by display order
          </p>

          <div className="mt-4 max-h-[540px] space-y-2 overflow-y-auto pr-1">
            {sortedProducts.map((product) => (
              <div className="rounded-xl border border-white/10 bg-black/30 p-3" key={product.id}>
                {product.imageUrl ? (
                  <img
                    alt={product.name}
                    className="mb-2 h-24 w-full rounded-md border border-white/15 object-cover"
                    src={product.imageUrl}
                  />
                ) : null}
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">{product.type}</p>
                <p className="font-semibold text-white">{product.name}</p>
                <p className="text-sm text-zinc-300">${product.price.toFixed(2)}</p>
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">Order: {product.displayOrder}</p>
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">
                  Stock: {product.stockQuantity} {product.isSoldOut || product.stockQuantity <= 0 ? "(Sold Out)" : ""}
                </p>
                {!product.isSoldOut && product.stockQuantity > 0 && product.stockQuantity <= 5 ? (
                  <p className="text-xs uppercase tracking-[0.12em] text-amber-300">Low Stock Alert</p>
                ) : null}
                <p className="mt-1 text-sm text-zinc-300">{product.description}</p>
                <p className="mt-1 text-xs text-zinc-500">{product.id}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-full border border-white/25 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white hover:text-black"
                    onClick={() => handleStartEditProduct(product)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-full border border-white/25 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white hover:text-black disabled:opacity-50"
                    disabled={reorderProductMutation.isPending}
                    onClick={() =>
                      reorderProductMutation.mutate({
                        id: product.id,
                        displayOrder: Math.max(0, product.displayOrder - 1)
                      })
                    }
                    type="button"
                  >
                    Move Up
                  </button>
                  <button
                    className="rounded-full border border-white/25 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white hover:text-black disabled:opacity-50"
                    disabled={reorderProductMutation.isPending}
                    onClick={() =>
                      reorderProductMutation.mutate({
                        id: product.id,
                        displayOrder: product.displayOrder + 1
                      })
                    }
                    type="button"
                  >
                    Move Down
                  </button>
                  <button
                    className="rounded-full border border-white/25 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white hover:text-black disabled:opacity-50"
                    disabled={toggleSoldOutMutation.isPending}
                    onClick={() =>
                      toggleSoldOutMutation.mutate({
                        id: product.id,
                        isSoldOut: !(product.isSoldOut || product.stockQuantity <= 0)
                      })
                    }
                    type="button"
                  >
                    {product.isSoldOut || product.stockQuantity <= 0 ? "Mark Active" : "Mark Sold Out"}
                  </button>
                  <button
                    className="rounded-full border border-white/25 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white hover:text-black disabled:opacity-50"
                    disabled={deleteProductMutation.isPending}
                    onClick={() => deleteProductMutation.mutate(product.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="gg-panel">
          <p className="gg-kicker">Specials</p>
          <h3 className="mt-2 font-display text-2xl text-white">
            {editingSpecialId ? "Edit Holiday Discount" : "Schedule Holiday Discount"}
          </h3>
          <p className="mt-2 text-sm text-zinc-300">Recommended range is 10% to 20% off.</p>

          <form className="mt-4 grid gap-3" onSubmit={handleCreateSpecial}>
            <label className="grid gap-1 text-sm">
              <span className="text-zinc-300">Holiday Preset</span>
              <select
                className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                onChange={(event) => handleHolidayPresetChange(event.target.value as HolidayPresetKey)}
                value={holidayPreset}
              >
                <option value="custom">Custom Special</option>
                {holidayPresets.map((preset) => (
                  <option key={preset.key} value={preset.key}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-300">Special Name</span>
              <input
                className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                onChange={(event) => setSpecialName(event.target.value)}
                required
                type="text"
                value={specialName}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-300">Discount %</span>
                <input
                  className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                  max="20"
                  min="10"
                  onChange={(event) => setDiscountPercent(event.target.value)}
                  required
                  step="1"
                  type="number"
                  value={discountPercent}
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-zinc-300">Start</span>
                <button
                  className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-left text-white outline-none ring-white transition focus:ring-1"
                  onClick={() => openCalendar("pickStart", startDate)}
                  type="button"
                >
                  {startDate}
                </button>
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-zinc-300">End</span>
                <button
                  className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-left text-white outline-none ring-white transition focus:ring-1"
                  onClick={() => openCalendar("pickEnd", endDate)}
                  type="button"
                >
                  {endDate}
                </button>
              </label>
            </div>

            <button
              className="w-fit rounded-full border border-white/25 px-3 py-1 text-xs text-zinc-200 transition hover:bg-white hover:text-black"
              onClick={() => openCalendar("view")}
              type="button"
            >
              Open Specials Calendar
            </button>

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-300">Notes</span>
              <textarea
                className="min-h-20 rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional campaign notes..."
                value={notes}
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
              <input
                checked={bannerEnabled}
                className="h-4 w-4 rounded border-white/30 bg-black/40"
                onChange={(event) => setBannerEnabled(event.target.checked)}
                type="checkbox"
              />
              Show discount banner on shop
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-300">Banner Shape</span>
                <select
                  className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                  disabled={!bannerEnabled}
                  onChange={(event) => setBannerShape(event.target.value as (typeof bannerShapeOptions)[number])}
                  value={bannerShape}
                >
                  {bannerShapeOptions.map((shape) => (
                    <option key={shape} value={shape}>
                      {shape}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-300">Spooky Theme</span>
                <select
                  className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                  disabled={!bannerEnabled}
                  onChange={(event) => setBannerTheme(event.target.value as (typeof bannerThemeOptions)[number])}
                  value={bannerTheme}
                >
                  {bannerThemeOptions.map((theme) => (
                    <option key={theme} value={theme}>
                      {theme}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-300">Banner Text Override</span>
              <input
                className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                disabled={!bannerEnabled}
                maxLength={180}
                onChange={(event) => setBannerText(event.target.value)}
                placeholder="Optional custom banner copy..."
                type="text"
                value={bannerText}
              />
            </label>

            {createSpecialMutation.isError ? <p className="text-sm text-zinc-300">{createSpecialMutation.error.message}</p> : null}
            {updateSpecialMutation.isError ? <p className="text-sm text-zinc-300">{updateSpecialMutation.error.message}</p> : null}
            {specialFormError ? <p className="text-sm text-zinc-300">{specialFormError}</p> : null}

            <div className="mt-1 flex gap-2">
              <button
                className="rounded-full border border-white bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
                disabled={createSpecialMutation.isPending || updateSpecialMutation.isPending}
                type="submit"
              >
                {editingSpecialId
                  ? updateSpecialMutation.isPending
                    ? "Saving..."
                    : "Save Changes"
                  : createSpecialMutation.isPending
                    ? "Saving..."
                    : "Schedule Special"}
              </button>
              {editingSpecialId ? (
                <button
                  className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white hover:text-black"
                  onClick={handleCancelEditSpecial}
                  type="button"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </article>

        <article className="gg-panel">
          <h3 className="font-display text-2xl text-white">Specials Calendar</h3>
          <p className="mt-1 text-sm text-zinc-300">{specials.length} specials scheduled</p>

          <div className="mt-4 max-h-[540px] space-y-4 overflow-y-auto pr-1">
            {specialsBusy ? (
              <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                <p className="inline-flex items-center gap-2 text-sm text-zinc-300">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border border-zinc-300 border-t-transparent" />
                  Updating specials...
                </p>
              </div>
            ) : null}
            {specialsLoading ? (
              <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                <p className="inline-flex items-center gap-2 text-sm text-zinc-300">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border border-zinc-300 border-t-transparent" />
                  Loading specials...
                </p>
              </div>
            ) : Object.entries(specialsByMonth).length === 0 ? (
              <p className="text-sm text-zinc-400">No specials yet. Use the form to schedule your first holiday drop.</p>
            ) : (
              Object.entries(specialsByMonth).map(([month, monthSpecials]) => (
                <div key={month}>
                  <p className="mb-2 text-xs uppercase tracking-[0.14em] text-zinc-400">{month}</p>
                  <div className="space-y-2">
                    {monthSpecials.map((special) => (
                      <article
                        className={`rounded-xl border border-white/10 bg-black/30 p-3 transition ${
                          deletingSpecialId === special.id ? "opacity-60" : "opacity-100"
                        }`}
                        key={special.id}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-semibold text-white">{special.name}</p>
                          <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs text-zinc-200">
                            {special.discountPercent}% off
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-zinc-300">{formatDateRange(special.startDate, special.endDate)}</p>
                        <p className="text-xs text-zinc-500">{durationDays(special.startDate, special.endDate)} day campaign</p>
                        {special.bannerEnabled ? (
                          <p className="text-xs uppercase tracking-[0.08em] text-zinc-400">
                            Banner: {special.bannerShape} / {special.bannerTheme}
                          </p>
                        ) : null}
                        {deletingSpecialId === special.id ? (
                          <p className="mt-2 inline-flex items-center gap-2 text-xs text-zinc-300">
                            <span className="h-3 w-3 animate-spin rounded-full border border-zinc-300 border-t-transparent" />
                            Removing special...
                          </p>
                        ) : null}
                        {special.notes ? <p className="mt-2 text-sm text-zinc-400">{special.notes}</p> : null}
                        <div className="mt-3 flex gap-2">
                          <button
                            className="rounded-full border border-white/25 px-3 py-1 text-xs text-zinc-200 transition hover:bg-white hover:text-black"
                            onClick={() => handleStartEditSpecial(special)}
                            disabled={deletingSpecialId === special.id}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-full border border-white/25 px-3 py-1 text-xs text-zinc-200 transition hover:bg-white hover:text-black disabled:opacity-50"
                            disabled={deleteSpecialMutation.isPending || deletingSpecialId === special.id}
                            onClick={() => handleRequestDeleteSpecial(special)}
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      {calendarOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-4 pb-4 pt-24 backdrop-blur-[1px]">
          <div
            aria-labelledby={calendarDialogTitleId}
            aria-modal="true"
            className="w-full max-w-3xl rounded-2xl border border-white/20 bg-zinc-950 p-4 shadow-2xl shadow-black/70 sm:p-5"
            role="dialog"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">Specials Calendar</p>
                <h3 className="font-display text-2xl text-white" id={calendarDialogTitleId}>
                  {monthLabel}
                </h3>
                {calendarMode === "pickStart" ? (
                  <p className="text-xs text-zinc-400">Select start date</p>
                ) : calendarMode === "pickEnd" ? (
                  <p className="text-xs text-zinc-400">Select end date</p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-full border border-white/25 px-3 py-1 text-sm text-zinc-200 transition hover:bg-white hover:text-black"
                  onClick={() =>
                    setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                  }
                  type="button"
                >
                  ←
                </button>
                <button
                  className="rounded-full border border-white/25 px-3 py-1 text-sm text-zinc-200 transition hover:bg-white hover:text-black"
                  onClick={() =>
                    setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                  }
                  type="button"
                >
                  →
                </button>
                <button
                  className="rounded-full border border-white bg-white px-3 py-1 text-sm font-semibold text-black transition hover:bg-zinc-200"
                  onClick={() => setCalendarOpen(false)}
                  ref={calendarCloseButtonRef}
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-xs uppercase tracking-[0.12em] text-zinc-500">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <p className="px-2 py-1" key={day}>
                  {day}
                </p>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarDays.days.map((day) => {
                const iso = toIsoLocal(day);
                const inMonth = day >= calendarDays.monthStart && day <= calendarDays.monthEnd;
                const daySpecials = specialsByDate.get(iso) ?? [];
                const isStart = iso === startDate;
                const isEnd = iso === endDate;
                const isRangePickMode = calendarMode === "pickStart" || calendarMode === "pickEnd";
                const isPast = iso < todayIso;

                return (
                  <button
                    className={`min-h-[76px] rounded-lg border p-1.5 text-left transition sm:min-h-[86px] sm:p-2 ${
                      inMonth ? "border-white/15 bg-black/30" : "border-white/5 bg-black/15"
                    } ${isRangePickMode ? "hover:border-white/35 hover:bg-black/45" : ""} ${
                      isStart || isEnd ? "border-white bg-white/10" : ""
                    } ${isPast ? "cursor-not-allowed opacity-45" : ""}`}
                    key={iso}
                    onClick={() => (isRangePickMode && !isPast ? handleCalendarDaySelect(iso) : undefined)}
                    type="button"
                  >
                    <p className={`text-xs ${inMonth ? "text-zinc-300" : "text-zinc-600"}`}>{day.getDate()}</p>
                    {isStart ? <p className="text-[10px] text-zinc-200">Start</p> : null}
                    {isEnd ? <p className="text-[10px] text-zinc-200">End</p> : null}
                    <div className="mt-1 space-y-1">
                      {daySpecials.slice(0, 2).map((special) => (
                        <div className="rounded bg-white/10 px-1.5 py-1 text-[10px] text-zinc-200" key={`${iso}-${special.id}`}>
                          {special.name} ({special.discountPercent}%)
                        </div>
                      ))}
                      {daySpecials.length > 2 ? (
                        <p className="text-[10px] text-zinc-400">+{daySpecials.length - 2} more</p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {pendingDeleteSpecial ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <div
            aria-labelledby={deleteDialogTitleId}
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-white/20 bg-zinc-950 p-5 shadow-2xl shadow-black/80"
            role="dialog"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Confirm Delete</p>
            <h4 className="mt-2 font-display text-2xl text-white" id={deleteDialogTitleId}>
              Delete Special?
            </h4>
            <p className="mt-2 text-sm text-zinc-300">
              This will remove <span className="font-semibold text-white">{pendingDeleteSpecial.name}</span> from your specials calendar.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white hover:text-black"
                onClick={() => setPendingDeleteSpecial(null)}
                disabled={deleteSpecialMutation.isPending}
                ref={deleteCancelButtonRef}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-full border border-white bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
                disabled={deleteSpecialMutation.isPending}
                onClick={handleConfirmDeleteSpecial}
                type="button"
              >
                {deleteSpecialMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border border-black border-t-transparent" />
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

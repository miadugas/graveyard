import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import logo from "@/assets/grave_goods_logo.png";
import { AboutPage } from "@/components/AboutPage";
import { AdminPage } from "@/components/AdminPage";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCard } from "@/components/ProductCard";
import { createOrder, fetchProducts } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
const filters = [
    { label: "All", value: "all" },
    { label: "Stickers", value: "sticker" },
    { label: "Buttons", value: "button" },
    { label: "Bundles", value: "bundle" }
];
const heroFeatures = [
    {
        name: "3-inch vinyl standard.",
        description: "Durable weather-resistant material for bottles, laptops, helmets, and daily use.",
        iconPath: "M12 3 4 7v6c0 4 3 7 8 8 5-1 8-4 8-8V7l-8-4Z"
    },
    {
        name: "Fast small-batch drops.",
        description: "Short runs with cleaner quality control and less dead stock.",
        iconPath: "M12 3a9 9 0 1 0 9 9h-9V3Z"
    },
    {
        name: "Catalog built for expression.",
        description: "Stickers, buttons, and bundles designed for visibility, not background decoration.",
        iconPath: "M5 4h14v4H5V4Zm0 6h14v4H5v-4Zm0 6h14v4H5v-4Z"
    }
];
function parseRouteFromHash(hash) {
    if (hash === "#/about") {
        return "about";
    }
    if (hash === "#/admin") {
        return "admin";
    }
    return "shop";
}
export default function App() {
    const [activeFilter, setActiveFilter] = useState("all");
    const [isCartOpen, setCartOpen] = useState(false);
    const [route, setRoute] = useState(() => parseRouteFromHash(window.location.hash));
    const [heroFeatureIndex, setHeroFeatureIndex] = useState(0);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const items = useCartStore((state) => state.items);
    const addItem = useCartStore((state) => state.addItem);
    const decrementItem = useCartStore((state) => state.decrementItem);
    const clearCart = useCartStore((state) => state.clearCart);
    const { data: products = [], isLoading, isError } = useQuery({
        queryKey: ["products"],
        queryFn: fetchProducts
    });
    const filteredProducts = useMemo(() => {
        if (activeFilter === "all") {
            return products;
        }
        return products.filter((product) => product.type === activeFilter);
    }, [activeFilter, products]);
    const itemCount = Object.values(items).reduce((sum, count) => sum + count, 0);
    const orderMutation = useMutation({
        mutationFn: createOrder,
        onSuccess: (result) => {
            clearCart();
            setCartOpen(false);
            alert(`Order ${result.orderId} saved to Postgres.`);
        },
        onError: (error) => {
            alert(error instanceof Error ? error.message : "Unable to place order");
        }
    });
    function handleCheckout() {
        const payload = {
            customerName: "Demo Customer",
            customerEmail: "demo@gravegoods.local",
            items: Object.entries(items).map(([productId, quantity]) => ({ productId, quantity }))
        };
        orderMutation.mutate(payload);
    }
    useEffect(() => {
        const onHashChange = () => {
            setRoute(parseRouteFromHash(window.location.hash));
        };
        window.addEventListener("hashchange", onHashChange);
        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);
    const isAboutPage = route === "about";
    const isAdminPage = route === "admin";
    const activeFeature = heroFeatures[heroFeatureIndex];
    useEffect(() => {
        const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updatePreference = () => setPrefersReducedMotion(motionQuery.matches);
        updatePreference();
        motionQuery.addEventListener("change", updatePreference);
        return () => motionQuery.removeEventListener("change", updatePreference);
    }, []);
    useEffect(() => {
        if (prefersReducedMotion) {
            return;
        }
        const intervalId = window.setInterval(() => {
            setHeroFeatureIndex((prev) => (prev + 1) % heroFeatures.length);
        }, 5500);
        return () => window.clearInterval(intervalId);
    }, [prefersReducedMotion]);
    return (_jsxs("div", { className: "min-h-screen bg-[radial-gradient(circle_at_12%_12%,rgba(255,255,255,0.1),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(140deg,#050505,#0f0f0f_48%,#070707)] text-zinc-100", children: [_jsx("div", { className: "pointer-events-none fixed inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.08)_0.7px,transparent_0.7px)] [background-size:2px_2px]" }), _jsx("header", { className: "sticky top-0 z-20 border-b border-white/15 bg-black/65 backdrop-blur", children: _jsxs("div", { className: "mx-auto flex w-[min(1120px,92vw)] items-center justify-between py-4", children: [_jsxs("a", { className: "flex items-center gap-3", href: "#/", onClick: () => setRoute("shop"), children: [_jsx("img", { alt: "Grave Goods logo", className: "h-11 w-11 rounded-full border border-white/30 object-cover", src: logo }), _jsx("h1", { className: "font-display text-2xl uppercase tracking-[0.15em] text-white", children: "Grave Goods" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("a", { className: `rounded-full border px-3 py-1.5 text-sm transition ${route === "shop"
                                        ? "border-white bg-white text-black"
                                        : "border-white/25 text-zinc-300 hover:bg-white hover:text-black"}`, href: "#/", onClick: () => setRoute("shop"), children: "Shop" }), _jsx("a", { className: `rounded-full border px-3 py-1.5 text-sm transition ${route === "about"
                                        ? "border-white bg-white text-black"
                                        : "border-white/25 text-zinc-300 hover:bg-white hover:text-black"}`, href: "#/about", onClick: () => setRoute("about"), children: "About" }), _jsx("a", { className: `rounded-full border px-3 py-1.5 text-sm transition ${route === "admin"
                                        ? "border-white bg-white text-black"
                                        : "border-white/25 text-zinc-300 hover:bg-white hover:text-black"}`, href: "#/admin", onClick: () => setRoute("admin"), children: "Admin" }), _jsxs("button", { className: "rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white hover:text-black", onClick: () => setCartOpen(true), type: "button", children: ["Cart (", itemCount, ")"] })] })] }) }), isAboutPage ? (_jsx(AboutPage, {})) : isAdminPage ? (_jsx(AdminPage, {})) : (_jsxs("main", { className: "mx-auto w-[min(1120px,92vw)] py-10", children: [_jsx("section", { className: "relative mb-10 overflow-visible rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] px-6 py-8 sm:px-8 lg:px-10 lg:py-12", children: _jsxs("div", { className: "mx-auto grid max-w-none grid-cols-1 gap-x-8 gap-y-14 lg:grid-cols-2 lg:items-start", children: [_jsxs("div", { className: "lg:pt-2 lg:pr-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-zinc-300", children: "Independent Sticker & Button Studio" }), _jsxs("h2", { className: "mt-3 font-display text-4xl leading-[1.12] md:text-6xl md:leading-[1.1]", children: [_jsx("span", { className: "block", children: "No gods." }), _jsx("span", { className: "block", children: "No masters." }), _jsx("span", { className: "block", children: "Just stickers." })] }), _jsx("p", { className: "mt-6 text-lg text-zinc-300", children: "Grave Goods makes vinyl stickers and pin buttons with a sharp, anti-authoritarian edge." }), _jsxs("section", { className: "mt-8 max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-5 lg:max-w-none", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40", children: _jsx("svg", { "aria-hidden": "true", className: "h-4 w-4 text-zinc-100", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: activeFeature.iconPath }) }) }), _jsxs("p", { className: "text-xs uppercase tracking-[0.14em] text-zinc-400", children: ["Feature ", heroFeatureIndex + 1, " / ", heroFeatures.length] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { "aria-label": "Previous feature", className: "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 text-xs text-zinc-200 transition hover:bg-white hover:text-black", onClick: () => setHeroFeatureIndex((prev) => (prev - 1 + heroFeatures.length) % heroFeatures.length), type: "button", children: "\u2190" }), _jsx("button", { "aria-label": "Next feature", className: "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 text-xs text-zinc-200 transition hover:bg-white hover:text-black", onClick: () => setHeroFeatureIndex((prev) => (prev + 1) % heroFeatures.length), type: "button", children: "\u2192" })] })] }), _jsxs("div", { className: "min-h-[94px]", children: [_jsx("h3", { className: "text-2xl font-semibold text-white", children: activeFeature.name }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: activeFeature.description })] }), _jsx("div", { className: "mt-4 flex gap-2", children: heroFeatures.map((feature, index) => (_jsx("button", { "aria-label": `Show feature ${index + 1}`, className: "group h-2 flex-1 rounded-full bg-white/15", onClick: () => setHeroFeatureIndex(index), type: "button", children: _jsx("span", { className: `block h-full rounded-full transition-all duration-300 ${index === heroFeatureIndex ? "w-full bg-white" : "w-0 bg-white/70"}` }) }, feature.name))) })] })] }), _jsx("div", { className: "lg:mt-2", children: _jsx("img", { alt: "Grave Goods logo badge", className: "mx-auto w-[82%] max-w-[460px] rounded-full object-cover lg:w-[106%] lg:max-w-[620px] lg:translate-x-8 lg:-translate-y-2 lg:rotate-[7deg]", src: logo }) })] }) }), _jsxs("section", { children: [_jsx("div", { className: "mb-4 flex flex-wrap gap-2", children: filters.map((filter) => (_jsx("button", { type: "button", className: `rounded-full border px-3 py-1.5 text-sm ${activeFilter === filter.value
                                        ? "border-white bg-white text-black"
                                        : "border-white/25 bg-black/30 text-zinc-200"}`, onClick: () => setActiveFilter(filter.value), children: filter.label }, filter.value))) }), isLoading && _jsx("p", { children: "Loading products..." }), isError && (_jsx("p", { children: "Could not load products. Start the API server and try again." })), _jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: filteredProducts.map((product) => (_jsx(ProductCard, { product: product, onAdd: (id) => {
                                        addItem(id);
                                        setCartOpen(true);
                                    } }, product.id))) })] })] })), isCartOpen ? (_jsx("button", { "aria-label": "Close cart", className: "fixed inset-0 z-30 bg-black/55 backdrop-blur-[1px]", onClick: () => setCartOpen(false), type: "button" })) : null, _jsx(CartDrawer, { open: isCartOpen, products: products, items: items, onClose: () => setCartOpen(false), onAdd: addItem, onDecrement: decrementItem, onCheckout: handleCheckout })] }));
}

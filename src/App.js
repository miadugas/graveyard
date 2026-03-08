import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import logo from "@/assets/grave_goods_logo.png";
import { AboutPage } from "@/components/AboutPage";
import { AdminPage } from "@/components/AdminPage";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutPage } from "@/components/CheckoutPage";
import { OrderDetailPage } from "@/components/OrderDetailPage";
import { OrderHistoryPage } from "@/components/OrderHistoryPage";
import { ProductCard } from "@/components/ProductCard";
import { createOrder, fetchCurrentUser, fetchMyOrders, fetchOrderById, fetchProducts, fetchSpecials, login, logout, register } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
const filters = [
    { label: "All", value: "all" },
    { label: "Stickers", value: "sticker" },
    { label: "Buttons", value: "button" },
    { label: "Bundles", value: "bundle" }
];
const categorySpotlights = [
    {
        type: "sticker",
        title: "Sticker Drops",
        description: "Sharp message-forward vinyl with weather-resistant finish.",
        cta: "Browse stickers"
    },
    {
        type: "button",
        title: "Button Pins",
        description: "Small loud buttons for jackets, bags, and everyday armor.",
        cta: "Browse buttons"
    },
    {
        type: "bundle",
        title: "Bundle Packs",
        description: "Curated sets for gifts, crews, and quick restocks.",
        cta: "Browse bundles"
    }
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
        return { name: "about" };
    }
    if (hash === "#/admin") {
        return { name: "admin" };
    }
    if (hash === "#/checkout") {
        return { name: "checkout" };
    }
    if (hash === "#/orders") {
        return { name: "orders" };
    }
    const orderMatch = hash.match(/^#\/orders\/([0-9a-f-]{36})$/i);
    if (orderMatch?.[1]) {
        return { name: "order", orderId: orderMatch[1] };
    }
    return { name: "shop" };
}
function navigateToHash(hash) {
    window.location.hash = hash;
}
export default function App() {
    const queryClient = useQueryClient();
    const [activeFilter, setActiveFilter] = useState("all");
    const [isCartOpen, setCartOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [route, setRoute] = useState(() => parseRouteFromHash(window.location.hash));
    const [heroFeatureIndex, setHeroFeatureIndex] = useState(0);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [authMode, setAuthMode] = useState("login");
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [authFullName, setAuthFullName] = useState("");
    const [authEmail, setAuthEmail] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [authError, setAuthError] = useState(null);
    const items = useCartStore((state) => state.items);
    const addItem = useCartStore((state) => state.addItem);
    const decrementItem = useCartStore((state) => state.decrementItem);
    const clearCart = useCartStore((state) => state.clearCart);
    const { data: products = [], isLoading, isError } = useQuery({
        queryKey: ["products"],
        queryFn: fetchProducts
    });
    const { data: authUser, isLoading: isAuthLoading } = useQuery({
        queryKey: ["auth", "me"],
        queryFn: fetchCurrentUser
    });
    const { data: specials = [] } = useQuery({
        queryKey: ["specials"],
        queryFn: fetchSpecials
    });
    const filteredProducts = useMemo(() => {
        if (activeFilter === "all") {
            return products;
        }
        return products.filter((product) => product.type === activeFilter);
    }, [activeFilter, products]);
    const featuredProducts = useMemo(() => products.filter((product) => !product.isSoldOut && product.stockQuantity > 0).slice(0, 3), [products]);
    const itemCount = Object.values(items).reduce((sum, count) => sum + count, 0);
    const isAdmin = authUser?.role === "admin";
    const ordersQuery = useQuery({
        queryKey: ["orders", "me"],
        queryFn: fetchMyOrders,
        enabled: !!authUser && route.name === "orders"
    });
    const orderDetailQuery = useQuery({
        queryKey: ["orders", route.orderId],
        queryFn: () => fetchOrderById(route.orderId ?? ""),
        enabled: !!authUser && route.name === "order" && !!route.orderId
    });
    const orderMutation = useMutation({
        mutationFn: createOrder,
        onSuccess: (result) => {
            clearCart();
            setCartOpen(false);
            queryClient.invalidateQueries({ queryKey: ["orders", "me"] });
            navigateToHash(`#/orders/${result.orderId}`);
        },
        onError: (error) => {
            setAuthError(error instanceof Error ? error.message : "Unable to place order");
        }
    });
    const loginMutation = useMutation({
        mutationFn: (payload) => login(payload),
        onSuccess: (user) => {
            queryClient.setQueryData(["auth", "me"], user);
            setAuthModalOpen(false);
            setAuthPassword("");
            setAuthError(null);
        },
        onError: (error) => {
            setAuthError(error instanceof Error ? error.message : "Unable to sign in");
        }
    });
    const registerMutation = useMutation({
        mutationFn: (payload) => register(payload),
        onSuccess: (user) => {
            queryClient.setQueryData(["auth", "me"], user);
            setAuthModalOpen(false);
            setAuthPassword("");
            setAuthError(null);
        },
        onError: (error) => {
            setAuthError(error instanceof Error ? error.message : "Unable to create account");
        }
    });
    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: () => {
            queryClient.setQueryData(["auth", "me"], null);
            queryClient.removeQueries({ queryKey: ["orders"] });
            if (route.name === "admin" || route.name === "orders" || route.name === "order") {
                navigateToHash("#/");
            }
        }
    });
    function openAuthModal(mode, message) {
        setAuthMode(mode);
        setAuthModalOpen(true);
        setAuthError(message ?? null);
    }
    function handleAuthSubmit(event) {
        event.preventDefault();
        setAuthError(null);
        if (authMode === "register") {
            registerMutation.mutate({
                fullName: authFullName.trim(),
                email: authEmail.trim(),
                password: authPassword
            });
            return;
        }
        loginMutation.mutate({
            email: authEmail.trim(),
            password: authPassword
        });
    }
    function handleCheckout() {
        navigateToHash("#/checkout");
        setCartOpen(false);
    }
    function handlePlaceOrder() {
        const payload = {
            items: Object.entries(items).map(([productId, quantity]) => ({ productId, quantity }))
        };
        orderMutation.mutate(payload);
    }
    function handleAddToCart(productId) {
        const product = products.find((entry) => entry.id === productId);
        if (!product) {
            return;
        }
        const currentQty = items[productId] ?? 0;
        const maxQty = product.stockQuantity;
        const isUnavailable = product.isSoldOut || maxQty <= 0;
        if (isUnavailable || currentQty >= maxQty) {
            return;
        }
        addItem(productId);
    }
    useEffect(() => {
        const onHashChange = () => {
            setRoute(parseRouteFromHash(window.location.hash));
            setMobileNavOpen(false);
        };
        window.addEventListener("hashchange", onHashChange);
        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);
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
    useEffect(() => {
        if (isAuthLoading) {
            return;
        }
        if (route.name === "admin" && !isAdmin) {
            navigateToHash("#/");
            openAuthModal("login", "Sign in as an admin to access the admin panel.");
            return;
        }
        const needsCustomerAuth = route.name === "orders" || route.name === "order";
        if (needsCustomerAuth && !authUser) {
            navigateToHash("#/");
            openAuthModal("login", "Sign in to view your orders.");
        }
    }, [authUser, isAdmin, isAuthLoading, route.name]);
    const activeFeature = heroFeatures[heroFeatureIndex];
    const todayIso = new Date().toISOString().slice(0, 10);
    const activeBanners = specials.filter((special) => {
        return special.bannerEnabled && special.startDate <= todayIso && special.endDate >= todayIso;
    });
    return (_jsxs("div", { className: "min-h-screen bg-[radial-gradient(circle_at_12%_12%,rgba(255,255,255,0.1),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(140deg,#050505,#0f0f0f_48%,#070707)] text-zinc-100", children: [_jsx("div", { className: "pointer-events-none fixed inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.08)_0.7px,transparent_0.7px)] [background-size:2px_2px]" }), _jsxs("header", { className: "sticky top-0 z-20 border-b border-white/15 bg-black/65 text-zinc-100 backdrop-blur", children: [_jsxs("div", { className: "mx-auto flex w-[min(1120px,92vw)] items-center justify-between gap-3 py-3", children: [_jsxs("a", { className: "flex items-center gap-3", href: "#/", onClick: () => setRoute({ name: "shop" }), children: [_jsx("img", { alt: "Grave Goods logo", className: "h-9 w-9 rounded-full border border-white/30 object-cover sm:h-10 sm:w-10", src: logo }), _jsx("h1", { className: "font-display text-lg tracking-[0.06em] text-white sm:text-2xl", children: "Grave Goods" })] }), _jsxs("nav", { className: "hidden items-center gap-8 lg:flex", children: [_jsx("a", { className: `flex min-h-11 items-center whitespace-nowrap border-b-2 px-1 text-base font-medium transition ${route.name === "shop"
                                            ? "border-white text-white"
                                            : "border-transparent text-zinc-400 hover:text-white"}`, href: "#/", children: "Shop" }), _jsx("a", { className: `flex min-h-11 items-center whitespace-nowrap border-b-2 px-1 text-base font-medium transition ${route.name === "about"
                                            ? "border-white text-white"
                                            : "border-transparent text-zinc-400 hover:text-white"}`, href: "#/about", children: "About" }), authUser ? (_jsx("a", { className: `flex min-h-11 items-center whitespace-nowrap border-b-2 px-1 text-base font-medium transition ${route.name === "orders" || route.name === "order"
                                            ? "border-white text-white"
                                            : "border-transparent text-zinc-400 hover:text-white"}`, href: "#/orders", children: "Orders" })) : null, isAdmin ? (_jsx("a", { className: `flex min-h-11 items-center whitespace-nowrap border-b-2 px-1 text-base font-medium transition ${route.name === "admin"
                                            ? "border-white text-white"
                                            : "border-transparent text-zinc-400 hover:text-white"}`, href: "#/admin", children: "Admin" })) : null] }), _jsxs("div", { className: "hidden items-center gap-4 text-base lg:flex", children: [_jsx("a", { className: `whitespace-nowrap transition ${route.name === "checkout"
                                            ? "font-semibold text-white"
                                            : "text-zinc-400 hover:text-white"}`, href: "#/checkout", children: "Checkout" }), _jsx("span", { "aria-hidden": "true", className: "h-6 w-px bg-white/20" }), authUser ? (_jsx("button", { className: "whitespace-nowrap text-zinc-400 transition hover:text-white disabled:opacity-50", disabled: logoutMutation.isPending, onClick: () => logoutMutation.mutate(), type: "button", children: logoutMutation.isPending ? "Signing out..." : "Logout" })) : (_jsxs(_Fragment, { children: [_jsx("button", { className: "whitespace-nowrap text-zinc-400 transition hover:text-white", onClick: () => openAuthModal("login"), type: "button", children: "Sign in" }), _jsx("span", { "aria-hidden": "true", className: "h-6 w-px bg-white/20" }), _jsx("button", { className: "whitespace-nowrap text-zinc-400 transition hover:text-white", onClick: () => openAuthModal("register"), type: "button", children: "Create Account" })] })), _jsxs("button", { className: "inline-flex min-h-11 items-center whitespace-nowrap text-zinc-300 transition hover:text-white", onClick: () => setCartOpen(true), type: "button", children: ["Cart (", itemCount, ")"] })] }), _jsxs("div", { className: "flex items-center gap-2 lg:hidden", children: [_jsxs("button", { className: "min-h-11 whitespace-nowrap rounded-md border border-white/25 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white hover:text-black", onClick: () => setCartOpen(true), type: "button", children: ["Cart (", itemCount, ")"] }), _jsx("button", { "aria-expanded": mobileNavOpen, "aria-label": "Toggle menu", className: "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-white/25 text-zinc-200 transition hover:bg-white hover:text-black", onClick: () => setMobileNavOpen((prev) => !prev), type: "button", children: mobileNavOpen ? "×" : "☰" })] })] }), mobileNavOpen ? (_jsx("div", { className: "border-t border-white/10 bg-black/90 lg:hidden", children: _jsxs("div", { className: "mx-auto grid w-[min(1120px,92vw)] gap-2 py-3", children: [_jsx("a", { className: `min-h-11 whitespace-nowrap rounded-md border px-3 py-2 text-sm transition ${route.name === "shop"
                                        ? "border-white bg-white text-black"
                                        : "border-white/25 text-zinc-300 hover:bg-white hover:text-black"}`, href: "#/", children: "Shop" }), _jsx("a", { className: `min-h-11 whitespace-nowrap rounded-md border px-3 py-2 text-sm transition ${route.name === "about"
                                        ? "border-white bg-white text-black"
                                        : "border-white/25 text-zinc-300 hover:bg-white hover:text-black"}`, href: "#/about", children: "About" }), authUser ? (_jsx("a", { className: `min-h-11 whitespace-nowrap rounded-md border px-3 py-2 text-sm transition ${route.name === "orders" || route.name === "order"
                                        ? "border-white bg-white text-black"
                                        : "border-white/25 text-zinc-300 hover:bg-white hover:text-black"}`, href: "#/orders", children: "Orders" })) : null, isAdmin ? (_jsx("a", { className: `min-h-11 whitespace-nowrap rounded-md border px-3 py-2 text-sm transition ${route.name === "admin"
                                        ? "border-white bg-white text-black"
                                        : "border-white/25 text-zinc-300 hover:bg-white hover:text-black"}`, href: "#/admin", children: "Admin" })) : null, _jsx("a", { className: `min-h-11 whitespace-nowrap rounded-md border px-3 py-2 text-sm transition ${route.name === "checkout"
                                        ? "border-white bg-white text-black"
                                        : "border-white/25 text-zinc-300 hover:bg-white hover:text-black"}`, href: "#/checkout", children: "Checkout" }), authUser ? (_jsx("button", { className: "min-h-11 whitespace-nowrap rounded-md border border-white/25 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white hover:text-black disabled:opacity-50", disabled: logoutMutation.isPending, onClick: () => logoutMutation.mutate(), type: "button", children: logoutMutation.isPending ? "Signing out..." : "Logout" })) : (_jsxs(_Fragment, { children: [_jsx("button", { className: "min-h-11 whitespace-nowrap rounded-md border border-white/25 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white hover:text-black", onClick: () => openAuthModal("login"), type: "button", children: "Sign in" }), _jsx("button", { className: "min-h-11 whitespace-nowrap rounded-md border border-white/25 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white hover:text-black", onClick: () => openAuthModal("register"), type: "button", children: "Create Account" })] }))] }) })) : null] }), route.name === "about" ? _jsx(AboutPage, {}) : null, route.name === "admin" && isAdmin ? _jsx(AdminPage, {}) : null, route.name === "checkout" ? (_jsx(CheckoutPage, { user: authUser ?? null, products: products, items: items, onAdd: addItem, onDecrement: decrementItem, onPlaceOrder: handlePlaceOrder, onOpenAuth: () => openAuthModal("login"), onContinueShopping: () => navigateToHash("#/"), isSubmitting: orderMutation.isPending, errorMessage: orderMutation.isError ? orderMutation.error.message : null })) : null, route.name === "orders" ? (_jsx(OrderHistoryPage, { orders: ordersQuery.data ?? [], isLoading: ordersQuery.isLoading, isError: ordersQuery.isError, onOpenOrder: (id) => navigateToHash(`#/orders/${id}`), onContinueShopping: () => navigateToHash("#/") })) : null, route.name === "order" ? (_jsx(OrderDetailPage, { order: orderDetailQuery.data, isLoading: orderDetailQuery.isLoading, isError: orderDetailQuery.isError, onBackToOrders: () => navigateToHash("#/orders"), onContinueShopping: () => navigateToHash("#/") })) : null, route.name === "shop" ? (_jsxs("main", { className: "mx-auto w-[min(1120px,92vw)] py-10", children: [activeBanners.length > 0 ? (_jsx("section", { "aria-label": "Current promotions", className: "mb-6 grid gap-3", children: activeBanners.map((special) => {
                            const shapeClassMap = {
                                pill: "rounded-full px-5",
                                ribbon: "rounded-md px-5 [clip-path:polygon(0_0,100%_0,97%_100%,3%_100%)]",
                                ticket: "rounded-xl border-dashed px-5",
                                burst: "rounded-[1.4rem] px-5 [clip-path:polygon(6%_0,94%_0,100%_22%,100%_78%,94%_100%,6%_100%,0_78%,0_22%)]"
                            };
                            const themeClassMap = {
                                none: "border-fuchsia-300/35 bg-fuchsia-900/30",
                                coffin: "border-zinc-200/35 bg-zinc-900/75 [clip-path:polygon(20%_0,80%_0,100%_30%,100%_100%,0_100%,0_30%)]",
                                tombstone: "border-zinc-100/40 bg-zinc-800/75 [border-radius:1.75rem_1.75rem_0.85rem_0.85rem]",
                                bat: "border-fuchsia-200/45 bg-[radial-gradient(circle_at_50%_22%,rgba(217,70,239,0.26),rgba(9,9,11,0.85))]",
                                spiderweb: "border-zinc-100/35 bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.16),rgba(9,9,11,0.88)),linear-gradient(120deg,rgba(161,161,170,0.2)_1px,transparent_1px),linear-gradient(60deg,rgba(161,161,170,0.2)_1px,transparent_1px)] [background-size:auto,18px_18px,18px_18px]"
                            };
                            const label = special.bannerText?.trim() || `${special.name} • ${special.discountPercent}% off through ${special.endDate}`;
                            return (_jsx("article", { className: `border py-3 text-center text-sm font-semibold uppercase tracking-[0.08em] text-zinc-50 ${shapeClassMap[special.bannerShape]} ${themeClassMap[special.bannerTheme]}`, children: label }, special.id));
                        }) })) : null, _jsx("section", { className: "relative mb-10 overflow-visible rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] px-6 py-8 sm:px-8 lg:px-10 lg:py-12", children: _jsxs("div", { className: "mx-auto grid max-w-none grid-cols-1 gap-x-8 gap-y-14 lg:grid-cols-2 lg:items-start", children: [_jsxs("div", { className: "lg:pt-2 lg:pr-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-zinc-300", children: "Independent Sticker & Button Studio" }), _jsxs("h2", { className: "mt-3 font-display text-4xl leading-[1.12] md:text-6xl md:leading-[1.1]", children: [_jsx("span", { className: "block", children: "No gods." }), _jsx("span", { className: "block", children: "No masters." }), _jsx("span", { className: "block", children: "Just stickers." })] }), _jsx("p", { className: "mt-6 text-lg text-zinc-300", children: "Grave Goods makes vinyl stickers and pin buttons with a sharp, anti-authoritarian edge." }), _jsxs("div", { className: "mt-6 flex flex-wrap gap-3", children: [_jsx("button", { className: "rounded-full border border-white bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200", onClick: () => setActiveFilter("all"), type: "button", children: "Shop All" }), _jsx("button", { className: "rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white hover:text-black", onClick: () => setActiveFilter("sticker"), type: "button", children: "Custom Sticker Energy" })] }), _jsxs("section", { className: "mt-8 max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-5 lg:max-w-none", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40", children: _jsx("svg", { "aria-hidden": "true", className: "h-4 w-4 text-zinc-100", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: activeFeature.iconPath }) }) }), _jsxs("p", { className: "text-xs uppercase tracking-[0.14em] text-zinc-400", children: ["Feature ", heroFeatureIndex + 1, " / ", heroFeatures.length] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { "aria-label": "Previous feature", className: "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 text-xs text-zinc-200 transition hover:bg-white hover:text-black", onClick: () => setHeroFeatureIndex((prev) => (prev - 1 + heroFeatures.length) % heroFeatures.length), type: "button", children: "\u2190" }), _jsx("button", { "aria-label": "Next feature", className: "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 text-xs text-zinc-200 transition hover:bg-white hover:text-black", onClick: () => setHeroFeatureIndex((prev) => (prev + 1) % heroFeatures.length), type: "button", children: "\u2192" })] })] }), _jsxs("div", { className: "min-h-[94px]", children: [_jsx("h3", { className: "text-2xl font-semibold text-white", children: activeFeature.name }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: activeFeature.description })] }), _jsx("div", { className: "mt-4 flex gap-2", children: heroFeatures.map((feature, index) => (_jsx("button", { "aria-label": `Show feature ${index + 1}`, className: "group h-2 flex-1 rounded-full bg-white/15", onClick: () => setHeroFeatureIndex(index), type: "button", children: _jsx("span", { className: `block h-full rounded-full transition-all duration-300 ${index === heroFeatureIndex ? "w-full bg-white" : "w-0 bg-white/70"}` }) }, feature.name))) })] })] }), _jsx("div", { className: "lg:mt-2", children: _jsx("img", { alt: "Grave Goods logo badge", className: "mx-auto w-[82%] max-w-[460px] rounded-full object-cover lg:w-[106%] lg:max-w-[620px] lg:translate-x-8 lg:-translate-y-2 lg:rotate-[7deg]", src: logo }) })] }) }), _jsx("section", { className: "mb-10 grid gap-4 md:grid-cols-3", children: categorySpotlights.map((spotlight) => (_jsxs("button", { className: `rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/5 ${activeFilter === spotlight.type
                                ? "border-fuchsia-300/70 bg-fuchsia-900/20"
                                : "border-white/15 bg-zinc-900/70"}`, onClick: () => setActiveFilter(spotlight.type), type: "button", children: [_jsx("h3", { className: "font-display text-2xl text-white", children: spotlight.title }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: spotlight.description }), _jsxs("p", { className: "mt-4 text-sm font-semibold uppercase tracking-[0.12em] text-zinc-200", children: [spotlight.cta, " \u2192"] })] }, spotlight.type))) }), featuredProducts.length > 0 ? (_jsxs("section", { className: "mb-10 rounded-2xl border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] p-5", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between gap-4", children: [_jsx("h3", { className: "font-display text-2xl text-white", children: "Featured Right Now" }), _jsx("button", { className: "text-sm font-semibold uppercase tracking-[0.1em] text-zinc-300 transition hover:text-white", onClick: () => setActiveFilter("all"), type: "button", children: "View all" })] }), _jsx("div", { className: "grid gap-4 md:grid-cols-3", children: featuredProducts.map((product) => (_jsx(ProductCard, { product: product, onAdd: (id) => {
                                        handleAddToCart(id);
                                        setCartOpen(true);
                                    } }, `featured-${product.id}`))) })] })) : null, _jsxs("section", { children: [_jsxs("div", { className: "mb-4 flex flex-wrap gap-2", children: [filters.map((filter) => (_jsx("button", { type: "button", className: `rounded-full border px-3 py-1.5 text-sm ${activeFilter === filter.value
                                            ? "border-white bg-white text-black"
                                            : "border-white/25 bg-black/30 text-zinc-200"}`, onClick: () => setActiveFilter(filter.value), children: filter.label }, filter.value))), activeFilter !== "all" ? (_jsx("button", { className: "rounded-full border border-white/20 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white hover:text-black", onClick: () => setActiveFilter("all"), type: "button", children: "Clear filter" })) : null] }), isLoading && _jsx("p", { children: "Loading products..." }), isError && _jsx("p", { children: "Could not load products. Start the API server and try again." }), filteredProducts.length === 0 ? (_jsxs("div", { className: "rounded-2xl border border-white/15 bg-zinc-900/70 p-8 text-center", children: [_jsx("p", { className: "text-lg font-semibold text-white", children: "No products match this filter yet." }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: "Try another category or clear filters to view everything in stock." })] })) : (_jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: filteredProducts.map((product) => (_jsx(ProductCard, { product: product, onAdd: (id) => {
                                        handleAddToCart(id);
                                        setCartOpen(true);
                                    } }, product.id))) }))] }), _jsxs("section", { className: "mt-10 rounded-2xl border border-fuchsia-200/30 bg-[linear-gradient(120deg,rgba(217,70,239,0.15),rgba(24,24,27,0.85)_40%,rgba(24,24,27,0.92))] p-6 sm:p-7", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-zinc-300", children: "Custom + Bulk" }), _jsx("h3", { className: "mt-2 font-display text-3xl text-white", children: "Need a custom run?" }), _jsx("p", { className: "mt-3 max-w-2xl text-sm text-zinc-200", children: "We can help with custom sticker batches and larger quantity orders. Start with account signup, then use the admin inventory controls to plan your next drop." }), _jsxs("div", { className: "mt-5 flex flex-wrap gap-3", children: [_jsx("button", { className: "rounded-full border border-white bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200", onClick: () => openAuthModal("register"), type: "button", children: "Create Account" }), _jsx("button", { className: "rounded-full border border-white/35 px-5 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-white hover:text-black", onClick: () => navigateToHash("#/about"), type: "button", children: "Learn About The Studio" })] })] }), _jsxs("section", { className: "mt-12 grid gap-8 border-t border-white/10 pt-8 text-sm sm:grid-cols-3", children: [_jsxs("div", { children: [_jsx("p", { className: "mb-3 text-xs uppercase tracking-[0.16em] text-zinc-400", children: "Shop" }), _jsxs("div", { className: "grid gap-2 text-zinc-300", children: [_jsx("button", { className: "text-left transition hover:text-white", onClick: () => setActiveFilter("all"), type: "button", children: "All Products" }), _jsx("button", { className: "text-left transition hover:text-white", onClick: () => setActiveFilter("sticker"), type: "button", children: "Stickers" }), _jsx("button", { className: "text-left transition hover:text-white", onClick: () => setActiveFilter("button"), type: "button", children: "Buttons" }), _jsx("button", { className: "text-left transition hover:text-white", onClick: () => setActiveFilter("bundle"), type: "button", children: "Bundles" })] })] }), _jsxs("div", { children: [_jsx("p", { className: "mb-3 text-xs uppercase tracking-[0.16em] text-zinc-400", children: "Account" }), _jsxs("div", { className: "grid gap-2 text-zinc-300", children: [_jsx("button", { className: "text-left transition hover:text-white", onClick: () => openAuthModal("login"), type: "button", children: "Login" }), _jsx("button", { className: "text-left transition hover:text-white", onClick: () => openAuthModal("register"), type: "button", children: "Create Account" }), _jsx("button", { className: "text-left transition hover:text-white", onClick: () => navigateToHash("#/orders"), type: "button", children: "Order History" }), _jsx("button", { className: "text-left transition hover:text-white", onClick: () => navigateToHash("#/checkout"), type: "button", children: "Checkout" })] })] }), _jsxs("div", { children: [_jsx("p", { className: "mb-3 text-xs uppercase tracking-[0.16em] text-zinc-400", children: "Studio" }), _jsxs("div", { className: "grid gap-2 text-zinc-300", children: [_jsx("button", { className: "text-left transition hover:text-white", onClick: () => navigateToHash("#/about"), type: "button", children: "About Grave Goods" }), _jsx("p", { children: "Handmade drops, small batches, loud designs." }), _jsx("p", { children: "Built for laptops, bottles, jackets, and organizers." })] })] })] })] })) : null, isCartOpen ? (_jsx("button", { "aria-label": "Close cart", className: "fixed inset-0 z-30 bg-black/55 backdrop-blur-[1px]", onClick: () => setCartOpen(false), type: "button" })) : null, isAuthModalOpen ? (_jsx("div", { className: "fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4", children: _jsxs("div", { "aria-modal": "true", className: "w-full max-w-md rounded-2xl border border-white/20 bg-zinc-950 p-5 shadow-2xl shadow-black/80", role: "dialog", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.14em] text-zinc-400", children: "Account" }), _jsx("h2", { className: "mt-2 font-display text-2xl text-white", children: authMode === "register" ? "Create Account" : "Sign In" }), _jsxs("form", { className: "mt-4 grid gap-3", onSubmit: handleAuthSubmit, children: [authMode === "register" ? (_jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Full Name" }), _jsx("input", { className: "rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1", onChange: (event) => setAuthFullName(event.target.value), required: true, type: "text", value: authFullName })] })) : null, _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Email" }), _jsx("input", { autoComplete: "username", className: "rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1", onChange: (event) => setAuthEmail(event.target.value), required: true, type: "email", value: authEmail })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Password" }), _jsx("input", { autoComplete: "current-password", className: "rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1", minLength: 8, onChange: (event) => setAuthPassword(event.target.value), required: true, type: "password", value: authPassword })] }), authError ? _jsx("p", { className: "text-sm text-zinc-300", children: authError }) : null, _jsxs("div", { className: "mt-2 flex justify-between gap-2", children: [_jsx("button", { className: "rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white hover:text-black", onClick: () => setAuthModalOpen(false), type: "button", children: "Cancel" }), _jsx("button", { className: "rounded-full border border-white bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50", disabled: loginMutation.isPending || registerMutation.isPending, type: "submit", children: loginMutation.isPending || registerMutation.isPending
                                                ? "Please wait..."
                                                : authMode === "register"
                                                    ? "Create Account"
                                                    : "Sign In" })] })] }), _jsx("div", { className: "mt-4 text-sm text-zinc-400", children: authMode === "register" ? (_jsx("button", { className: "underline underline-offset-2", onClick: () => setAuthMode("login"), type: "button", children: "Already have an account? Sign in" })) : (_jsx("button", { className: "underline underline-offset-2", onClick: () => setAuthMode("register"), type: "button", children: "Need an account? Create one" })) })] }) })) : null, _jsx(CartDrawer, { open: isCartOpen, products: products, items: items, onClose: () => setCartOpen(false), onAdd: handleAddToCart, onDecrement: decrementItem, onCheckout: handleCheckout })] }));
}

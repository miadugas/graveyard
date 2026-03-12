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
import { ProductQuickView } from "@/components/ProductQuickView";
import {
  createCheckoutSession,
  fetchCurrentUser,
  fetchMyOrders,
  fetchOrderById,
  fetchProducts,
  fetchSpecials,
  login,
  logout,
  register
} from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import type { LoginInput, Product, ProductType, RegisterInput } from "@/types";

const SHOPPER_SIGNUP_MODAL_STORAGE_KEY = "grave-goods-shopper-signup-modal-seen-v2";

const filters: Array<{ label: string; value: ProductType | "all" }> = [
  { label: "All", value: "all" },
  { label: "Stickers", value: "sticker" },
  { label: "Buttons", value: "button" },
  { label: "Bundles", value: "bundle" }
];
const categorySpotlights: Array<{
  type: ProductType;
  title: string;
  description: string;
  cta: string;
}> = [
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

type AppRouteName = "shop" | "about" | "admin" | "checkout" | "orders" | "order";

interface AppRoute {
  name: AppRouteName;
  orderId?: string;
}

type AuthMode = "login" | "register";

function parseRouteFromHash(hash: string): AppRoute {
  if (hash.startsWith("#/about")) {
    return { name: "about" };
  }

  if (hash.startsWith("#/admin")) {
    return { name: "admin" };
  }

  if (hash.startsWith("#/checkout")) {
    return { name: "checkout" };
  }

  const orderMatch = hash.match(/^#\/orders\/([0-9a-f-]{36})(?:\?.*)?$/i);
  if (orderMatch?.[1]) {
    return { name: "order", orderId: orderMatch[1] };
  }

  if (hash.startsWith("#/orders")) {
    return { name: "orders" };
  }

  return { name: "shop" };
}

function navigateToHash(hash: string) {
  window.location.hash = hash;
}

export default function App() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<ProductType | "all">("all");
  const [isCartOpen, setCartOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [route, setRoute] = useState<AppRoute>(() => parseRouteFromHash(window.location.hash));
  const [heroFeaturedIndex, setHeroFeaturedIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [hasSeenShopperSignupModal, setHasSeenShopperSignupModal] = useState(() => {
    return window.localStorage.getItem(SHOPPER_SIGNUP_MODAL_STORAGE_KEY) === "true";
  });
  const [authFullName, setAuthFullName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

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
    queryFn: fetchCurrentUser,
    retry: false
  });
  const { data: specials = [] } = useQuery({
    queryKey: ["specials"],
    queryFn: fetchSpecials
  });

  const visibleProducts = useMemo(() => products.filter((product) => !product.isDisabled), [products]);
  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") {
      return visibleProducts;
    }
    return visibleProducts.filter((product) => product.type === activeFilter);
  }, [activeFilter, visibleProducts]);
  const featuredProducts = useMemo(
    () => visibleProducts.filter((product) => !product.isSoldOut && product.stockQuantity > 0).slice(0, 3),
    [visibleProducts]
  );
  const activeFeaturedProduct = featuredProducts[heroFeaturedIndex] ?? null;

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
    mutationFn: createCheckoutSession,
    onSuccess: (result) => {
      setCartOpen(false);
      window.location.assign(result.url);
    },
    onError: (error) => {
      setAuthError(error instanceof Error ? error.message : "Unable to start checkout");
    }
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginInput) => login(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
      window.localStorage.setItem(SHOPPER_SIGNUP_MODAL_STORAGE_KEY, "true");
      setHasSeenShopperSignupModal(true);
      setAuthModalOpen(false);
      setAuthPassword("");
      setAuthError(null);
    },
    onError: (error) => {
      setAuthError(error instanceof Error ? error.message : "Unable to sign in");
    }
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterInput) => register(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
      window.localStorage.setItem(SHOPPER_SIGNUP_MODAL_STORAGE_KEY, "true");
      setHasSeenShopperSignupModal(true);
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

  function openAuthModal(mode: AuthMode, message?: string) {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setAuthError(message ?? null);
  }

  function markShopperSignupModalSeen() {
    window.localStorage.setItem(SHOPPER_SIGNUP_MODAL_STORAGE_KEY, "true");
    setHasSeenShopperSignupModal(true);
  }

  function closeAuthModal() {
    if (!hasSeenShopperSignupModal) {
      markShopperSignupModalSeen();
    }
    setAuthModalOpen(false);
  }

  function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
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
      items: Object.entries(items).map(([productId, quantity]) => ({ productId, quantity })),
      customerName: authUser?.fullName ?? guestName.trim(),
      customerEmail: authUser?.email ?? guestEmail.trim()
    };

    orderMutation.mutate(payload);
  }

  function handleAddToCart(productId: string) {
    const product = visibleProducts.find((entry) => entry.id === productId);
    if (!product) {
      return;
    }

    const currentQty = items[productId] ?? 0;
    const maxQty = product.stockQuantity;
    const isUnavailable = product.isDisabled || product.isSoldOut || maxQty <= 0;

    if (isUnavailable || currentQty >= maxQty) {
      return;
    }

    addItem(productId);
  }

  function handleOpenQuickView(product: Product) {
    setQuickViewProduct(product);
  }

  function handleCloseQuickView() {
    setQuickViewProduct(null);
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
    if (prefersReducedMotion || featuredProducts.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setHeroFeaturedIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 4800);

    return () => window.clearInterval(intervalId);
  }, [featuredProducts.length, prefersReducedMotion]);

  useEffect(() => {
    if (heroFeaturedIndex >= featuredProducts.length) {
      setHeroFeaturedIndex(0);
    }
  }, [featuredProducts.length, heroFeaturedIndex]);

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

  useEffect(() => {
    if (isAuthLoading || authUser || isAuthModalOpen || hasSeenShopperSignupModal || route.name !== "shop") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAuthMode("register");
      setAuthError(null);
      setAuthModalOpen(true);
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [authUser, hasSeenShopperSignupModal, isAuthLoading, isAuthModalOpen, route.name]);

  useEffect(() => {
    if (!window.location.hash.includes("checkout=success")) {
      return;
    }

    clearCart();
    setGuestName("");
    setGuestEmail("");

    if (authUser) {
      queryClient.invalidateQueries({ queryKey: ["orders", "me"] });
      navigateToHash("#/orders");
      return;
    }

    navigateToHash("#/checkout?success=1");
  }, [authUser, clearCart, queryClient]);

  const todayIso = new Date().toISOString().slice(0, 10);
  const activeBanners = specials.filter((special) => {
    return special.bannerEnabled && special.startDate <= todayIso && special.endDate >= todayIso;
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_12%,rgba(255,255,255,0.1),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(140deg,#050505,#0f0f0f_48%,#070707)] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.08)_0.7px,transparent_0.7px)] [background-size:2px_2px]" />

      <header className="sticky top-0 z-20 border-b border-white/15 bg-black/65 text-zinc-100 backdrop-blur">
        <div className="mx-auto flex w-[min(1120px,92vw)] items-center justify-between gap-3 py-3">
          <a className="flex items-center gap-3" href="#/" onClick={() => setRoute({ name: "shop" })}>
            <img alt="Grave Goods logo" className="h-9 w-9 rounded-full border border-white/30 object-cover sm:h-10 sm:w-10" src={logo} />
            <h1 className="font-display text-lg tracking-[0.06em] text-white sm:text-2xl">Grave Goods</h1>
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            <a
              className={`flex min-h-11 items-center whitespace-nowrap border-b-2 px-1 text-base font-medium transition ${
                route.name === "shop"
                  ? "border-white text-white"
                  : "border-transparent text-zinc-400 hover:text-white"
              }`}
              href="#/"
            >
              Shop
            </a>
            <a
              className={`flex min-h-11 items-center whitespace-nowrap border-b-2 px-1 text-base font-medium transition ${
                route.name === "about"
                  ? "border-white text-white"
                  : "border-transparent text-zinc-400 hover:text-white"
              }`}
              href="#/about"
            >
              About
            </a>
            {authUser ? (
              <a
                className={`flex min-h-11 items-center whitespace-nowrap border-b-2 px-1 text-base font-medium transition ${
                  route.name === "orders" || route.name === "order"
                    ? "border-white text-white"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
                href="#/orders"
              >
                Orders
              </a>
            ) : null}
            {isAdmin ? (
              <a
                className={`flex min-h-11 items-center whitespace-nowrap border-b-2 px-1 text-base font-medium transition ${
                  route.name === "admin"
                    ? "border-white text-white"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
                href="#/admin"
              >
                Admin
              </a>
            ) : null}
          </nav>

          <div className="hidden items-center gap-4 text-base lg:flex">
            <a
              className={`whitespace-nowrap transition ${
                route.name === "checkout"
                  ? "font-semibold text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
              href="#/checkout"
            >
              Checkout
            </a>
            <span aria-hidden="true" className="h-6 w-px bg-white/20" />
            {authUser ? (
              <button
                className="whitespace-nowrap text-zinc-400 transition hover:text-white disabled:opacity-50"
                disabled={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
                type="button"
              >
                {logoutMutation.isPending ? "Signing out..." : "Logout"}
              </button>
            ) : (
              <>
                <button
                  className="whitespace-nowrap text-zinc-400 transition hover:text-white"
                  onClick={() => openAuthModal("login")}
                  type="button"
                >
                  Sign in
                </button>
                <span aria-hidden="true" className="h-6 w-px bg-white/20" />
                <button
                  className="whitespace-nowrap text-zinc-400 transition hover:text-white"
                  onClick={() => openAuthModal("register")}
                  type="button"
                >
                  Create Account
                </button>
              </>
            )}
            <button
              className="inline-flex min-h-11 items-center whitespace-nowrap text-zinc-300 transition hover:text-white"
              onClick={() => setCartOpen(true)}
              type="button"
            >
              Cart ({itemCount})
            </button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              className="min-h-11 whitespace-nowrap rounded-md border border-white/25 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white hover:text-black"
              onClick={() => setCartOpen(true)}
              type="button"
            >
              Cart ({itemCount})
            </button>
            <button
              aria-expanded={mobileNavOpen}
              aria-label="Toggle menu"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-white/25 text-zinc-200 transition hover:bg-white hover:text-black"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              type="button"
            >
              {mobileNavOpen ? "×" : "☰"}
            </button>
          </div>
        </div>

        {mobileNavOpen ? (
          <div className="border-t border-white/10 bg-black/90 lg:hidden">
            <div className="mx-auto grid w-[min(1120px,92vw)] gap-2 py-3">
              <a
                className={`min-h-11 whitespace-nowrap rounded-md border px-3 py-2 text-sm transition ${
                  route.name === "shop"
                    ? "border-white bg-white text-black"
                    : "border-white/25 text-zinc-300 hover:bg-white hover:text-black"
                }`}
                href="#/"
              >
                Shop
              </a>
              <a
                className={`min-h-11 whitespace-nowrap rounded-md border px-3 py-2 text-sm transition ${
                  route.name === "about"
                    ? "border-white bg-white text-black"
                    : "border-white/25 text-zinc-300 hover:bg-white hover:text-black"
                }`}
                href="#/about"
              >
                About
              </a>
              {authUser ? (
                <a
                  className={`min-h-11 whitespace-nowrap rounded-md border px-3 py-2 text-sm transition ${
                    route.name === "orders" || route.name === "order"
                      ? "border-white bg-white text-black"
                      : "border-white/25 text-zinc-300 hover:bg-white hover:text-black"
                  }`}
                  href="#/orders"
                >
                  Orders
                </a>
              ) : null}
              {isAdmin ? (
                <a
                  className={`min-h-11 whitespace-nowrap rounded-md border px-3 py-2 text-sm transition ${
                    route.name === "admin"
                      ? "border-white bg-white text-black"
                      : "border-white/25 text-zinc-300 hover:bg-white hover:text-black"
                  }`}
                  href="#/admin"
                >
                  Admin
                </a>
              ) : null}
              <a
                className={`min-h-11 whitespace-nowrap rounded-md border px-3 py-2 text-sm transition ${
                  route.name === "checkout"
                    ? "border-white bg-white text-black"
                    : "border-white/25 text-zinc-300 hover:bg-white hover:text-black"
                }`}
                href="#/checkout"
              >
                Checkout
              </a>
              {authUser ? (
                <button
                  className="min-h-11 whitespace-nowrap rounded-md border border-white/25 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white hover:text-black disabled:opacity-50"
                  disabled={logoutMutation.isPending}
                  onClick={() => logoutMutation.mutate()}
                  type="button"
                >
                  {logoutMutation.isPending ? "Signing out..." : "Logout"}
                </button>
              ) : (
                <>
                  <button
                    className="min-h-11 whitespace-nowrap rounded-md border border-white/25 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white hover:text-black"
                    onClick={() => openAuthModal("login")}
                    type="button"
                  >
                    Sign in
                  </button>
                  <button
                    className="min-h-11 whitespace-nowrap rounded-md border border-white/25 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white hover:text-black"
                    onClick={() => openAuthModal("register")}
                    type="button"
                  >
                    Create Account
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </header>

      {route.name === "about" ? <AboutPage /> : null}
      {route.name === "admin" && isAdmin ? <AdminPage /> : null}
      {route.name === "checkout" ? (
        <CheckoutPage
          user={authUser ?? null}
          products={products}
          items={items}
          guestName={guestName}
          guestEmail={guestEmail}
          onAdd={addItem}
          onDecrement={decrementItem}
          onGuestNameChange={setGuestName}
          onGuestEmailChange={setGuestEmail}
          onPlaceOrder={handlePlaceOrder}
          onOpenAuth={() => openAuthModal("login")}
          onContinueShopping={() => navigateToHash("#/")}
          isSubmitting={orderMutation.isPending}
          errorMessage={orderMutation.isError ? (orderMutation.error as Error).message : null}
          successMessage={window.location.hash.includes("success=1") ? "Payment complete. Check your email for order details." : null}
        />
      ) : null}
      {route.name === "orders" ? (
        <OrderHistoryPage
          orders={ordersQuery.data ?? []}
          isLoading={ordersQuery.isLoading}
          isError={ordersQuery.isError}
          onOpenOrder={(id) => navigateToHash(`#/orders/${id}`)}
          onContinueShopping={() => navigateToHash("#/")}
        />
      ) : null}
      {route.name === "order" ? (
        <OrderDetailPage
          order={orderDetailQuery.data}
          isLoading={orderDetailQuery.isLoading}
          isError={orderDetailQuery.isError}
          onBackToOrders={() => navigateToHash("#/orders")}
          onContinueShopping={() => navigateToHash("#/")}
        />
      ) : null}

      {route.name === "shop" ? (
        <main className="mx-auto w-[min(1120px,92vw)] py-7">
          {activeBanners.length > 0 ? (
            <section aria-label="Current promotions" className="mb-6 grid gap-3">
              {activeBanners.map((special) => {
                const shapeClassMap: Record<string, string> = {
                  pill: "rounded-full px-5",
                  ribbon: "rounded-md px-5 [clip-path:polygon(0_0,100%_0,97%_100%,3%_100%)]",
                  ticket: "rounded-xl border-dashed px-5",
                  burst: "rounded-[1.4rem] px-5 [clip-path:polygon(6%_0,94%_0,100%_22%,100%_78%,94%_100%,6%_100%,0_78%,0_22%)]"
                };
                const themeClassMap: Record<string, string> = {
                  none: "border-fuchsia-300/35 bg-fuchsia-900/30",
                  coffin: "border-zinc-200/35 bg-zinc-900/75 [clip-path:polygon(20%_0,80%_0,100%_30%,100%_100%,0_100%,0_30%)]",
                  tombstone: "border-zinc-100/40 bg-zinc-800/75 [border-radius:1.75rem_1.75rem_0.85rem_0.85rem]",
                  bat: "border-fuchsia-200/45 bg-[radial-gradient(circle_at_50%_22%,rgba(217,70,239,0.26),rgba(9,9,11,0.85))]",
                  spiderweb:
                    "border-zinc-100/35 bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.16),rgba(9,9,11,0.88)),linear-gradient(120deg,rgba(161,161,170,0.2)_1px,transparent_1px),linear-gradient(60deg,rgba(161,161,170,0.2)_1px,transparent_1px)] [background-size:auto,18px_18px,18px_18px]"
                };
                const label = special.bannerText?.trim() || `${special.name} • ${special.discountPercent}% off through ${special.endDate}`;

                return (
                  <article
                    className={`border py-3 text-center text-sm font-semibold uppercase tracking-[0.08em] text-zinc-50 ${shapeClassMap[special.bannerShape]} ${themeClassMap[special.bannerTheme]}`}
                    key={special.id}
                  >
                    {label}
                  </article>
                );
              })}
            </section>
          ) : null}
          <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-black/15 bg-[#ede9e1] text-zinc-950 shadow-[0_30px_80px_-48px_rgba(0,0,0,0.95)]">
            <div className="absolute inset-y-0 left-0 w-4 bg-[#f24b16]" />
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(0,0,0,0.045)_0.7px,transparent_0.7px)] [background-size:10px_10px]" />
            <div className="relative px-8 pb-10 pt-8 sm:px-10 lg:px-12 lg:pb-12 lg:pt-10">
              <div className="grid gap-4 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-700 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
                <span>Small Batch</span>
                <span className="hidden h-px bg-black/10 sm:block" />
                <span className="text-center">Weatherproof Vinyl</span>
                <span className="hidden h-px bg-black/10 sm:block" />
                <span className="sm:text-right">Visible Dissent</span>
              </div>

              <div className="relative mt-6 min-h-[38rem] lg:min-h-[44rem]">
                <div className="pointer-events-none absolute inset-x-0 top-8 z-0 text-center font-poster uppercase leading-none tracking-[-0.075em] text-black">
                  <span className="block whitespace-nowrap text-[3.9rem] sm:text-[5.9rem] lg:text-[8.9rem] xl:text-[10.5rem]">
                    VISIBLE DISSENT
                  </span>
                </div>

                <div className="relative z-10 grid gap-8 pt-36 lg:grid-cols-[minmax(280px,0.88fr)_minmax(360px,0.86fr)] lg:items-end lg:pt-24">
                  <div className="max-w-md">
                    <p className="text-lg leading-9 text-zinc-800">
                      Stickers and buttons for laptops, bottles, jackets, and anywhere else you want the message to hit first.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      <button
                        className="rounded-full bg-[#f24b16] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#d84110]"
                        onClick={() => setActiveFilter("all")}
                        type="button"
                      >
                        Shop The Drop
                      </button>
                      <button
                        className="rounded-full border border-black/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-zinc-900 transition hover:bg-black hover:text-white"
                        onClick={() => setActiveFilter("sticker")}
                        type="button"
                      >
                        Explore Stickers
                      </button>
                    </div>
                  </div>

                  <div className="relative min-h-[28rem] lg:min-h-[38rem]">
                    <img
                      alt="Grave Goods logo badge"
                      className="absolute bottom-0 left-1/2 z-20 w-[min(100%,30rem)] -translate-x-1/2 object-contain opacity-95 drop-shadow-[0_30px_30px_rgba(0,0,0,0.22)] sm:w-[28rem] lg:w-[34rem]"
                      src={logo}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8 grid gap-4 md:grid-cols-3">
            {categorySpotlights.map((spotlight) => (
              <button
                className={`rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/5 ${
                  activeFilter === spotlight.type
                    ? "border-fuchsia-300/70 bg-fuchsia-900/20"
                    : "border-white/15 bg-zinc-900/70"
                }`}
                key={spotlight.type}
                onClick={() => setActiveFilter(spotlight.type)}
                type="button"
              >
                <h3 className="font-display text-xl text-white">{spotlight.title}</h3>
                <p className="mt-2 text-sm text-zinc-300">{spotlight.description}</p>
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.12em] text-zinc-200">{spotlight.cta} →</p>
              </button>
            ))}
          </section>

          <section>
            <div className="mb-4 flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    activeFilter === filter.value
                      ? "border-white bg-white text-black"
                      : "border-white/25 bg-black/30 text-zinc-200"
                  }`}
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
              {activeFilter !== "all" ? (
                <button
                  className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white hover:text-black"
                  onClick={() => setActiveFilter("all")}
                  type="button"
                >
                  Clear filter
                </button>
              ) : null}
            </div>

            {isLoading && <p>Loading products...</p>}
            {isError && <p>Could not load products. Start the API server and try again.</p>}

            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-white/15 bg-zinc-900/70 p-8 text-center">
                <p className="text-lg font-semibold text-white">No products match this filter yet.</p>
                <p className="mt-2 text-sm text-zinc-300">Try another category or clear filters to view everything in stock.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    onQuickView={handleOpenQuickView}
                    product={product}
                    onAdd={(id) => {
                      handleAddToCart(id);
                      setCartOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-fuchsia-200/30 bg-[linear-gradient(120deg,rgba(217,70,239,0.15),rgba(24,24,27,0.85)_40%,rgba(24,24,27,0.92))] p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-300">Custom + Bulk</p>
            <h3 className="mt-2 font-display text-2xl text-white">Need a custom run?</h3>
            <p className="mt-3 max-w-2xl text-sm text-zinc-200">
              We can help with custom sticker batches and larger quantity orders. Start with account signup, then use the
              admin inventory controls to plan your next drop.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="rounded-full border border-white bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
                onClick={() => openAuthModal("register")}
                type="button"
              >
                Create Account
              </button>
              <button
                className="rounded-full border border-white/35 px-5 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-white hover:text-black"
                onClick={() => navigateToHash("#/about")}
                type="button"
              >
                Learn About The Studio
              </button>
            </div>
          </section>

          <section className="mt-9 grid gap-6 border-t border-white/10 pt-6 text-sm sm:grid-cols-3">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.16em] text-zinc-400">Shop</p>
              <div className="grid gap-2 text-zinc-300">
                <button className="text-left transition hover:text-white" onClick={() => setActiveFilter("all")} type="button">All Products</button>
                <button className="text-left transition hover:text-white" onClick={() => setActiveFilter("sticker")} type="button">Stickers</button>
                <button className="text-left transition hover:text-white" onClick={() => setActiveFilter("button")} type="button">Buttons</button>
                <button className="text-left transition hover:text-white" onClick={() => setActiveFilter("bundle")} type="button">Bundles</button>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.16em] text-zinc-400">Account</p>
              <div className="grid gap-2 text-zinc-300">
                <button className="text-left transition hover:text-white" onClick={() => openAuthModal("login")} type="button">Login</button>
                <button className="text-left transition hover:text-white" onClick={() => openAuthModal("register")} type="button">Create Account</button>
                <button className="text-left transition hover:text-white" onClick={() => navigateToHash("#/orders")} type="button">Order History</button>
                <button className="text-left transition hover:text-white" onClick={() => navigateToHash("#/checkout")} type="button">Checkout</button>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.16em] text-zinc-400">Studio</p>
              <div className="grid gap-2 text-zinc-300">
                <button className="text-left transition hover:text-white" onClick={() => navigateToHash("#/about")} type="button">About Grave Goods</button>
                <p>Handmade drops, small batches, loud designs.</p>
                <p>Built for laptops, bottles, jackets, and organizers.</p>
              </div>
            </div>
          </section>
        </main>
      ) : null}

      {isCartOpen ? (
        <button
          aria-label="Close cart"
          className="fixed inset-0 z-30 bg-black/55 backdrop-blur-[1px]"
          onClick={() => setCartOpen(false)}
          type="button"
        />
      ) : null}

      <ProductQuickView
        onAdd={(id) => {
          handleAddToCart(id);
          setCartOpen(true);
        }}
        onClose={handleCloseQuickView}
        open={!!quickViewProduct}
        product={quickViewProduct}
      />

      {isAuthModalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <button aria-label="Close account modal" className="absolute inset-0" onClick={closeAuthModal} type="button" />
          <div
            aria-modal="true"
            className={`relative grid w-full overflow-hidden border border-white/15 bg-zinc-950 shadow-2xl shadow-black/80 ${
              authMode === "register"
                ? "max-w-5xl rounded-[2rem] lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)]"
                : "max-w-md rounded-2xl"
            }`}
            role="dialog"
          >
            <button
              aria-label="Close account modal"
              className="absolute right-4 top-4 z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/15 bg-white/90 text-2xl leading-none text-zinc-900 transition hover:scale-[1.03] hover:bg-white"
              onClick={closeAuthModal}
              type="button"
            >
              ×
            </button>

            <div className={authMode === "register" ? "grid gap-6 p-6 sm:p-8 lg:p-10" : "grid gap-4 p-5"}>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">{authMode === "register" ? "New Shopper Offer" : "Account"}</p>
                <h2 className={`mt-3 text-white ${authMode === "register" ? "font-display text-4xl sm:text-5xl" : "font-display text-2xl"}`}>
                  {authMode === "register" ? "Save 10%" : "Sign In"}
                </h2>
                <p className={`mt-3 ${authMode === "register" ? "max-w-md text-lg leading-8 text-zinc-300" : "text-sm text-zinc-400"}`}>
                  {authMode === "register"
                    ? "Create your account for 10% off your first order, early access to new drops, and first crack at limited runs."
                    : "Sign in to check orders, move through checkout faster, and manage your account."}
                </p>
              </div>

              <form className="grid gap-3" onSubmit={handleAuthSubmit}>
                {authMode === "register" ? (
                  <label className="grid gap-1 text-sm">
                    <span className="text-zinc-300">Full Name</span>
                    <input
                      className="min-h-12 rounded-2xl border border-white/15 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition focus:border-orange-500"
                      onChange={(event) => setAuthFullName(event.target.value)}
                      required
                      type="text"
                      value={authFullName}
                    />
                  </label>
                ) : null}

                <label className="grid gap-1 text-sm">
                  <span className="text-zinc-300">Email</span>
                  <input
                    autoComplete="username"
                    className={`min-h-12 border px-4 py-3 text-base outline-none transition ${
                      authMode === "register"
                        ? "rounded-2xl border-white/15 bg-white text-zinc-950 focus:border-orange-500"
                        : "rounded-lg border-white/20 bg-black/40 text-white focus:ring-1 focus:ring-white"
                    }`}
                    onChange={(event) => setAuthEmail(event.target.value)}
                    required
                    type="email"
                    value={authEmail}
                  />
                </label>

                <label className="grid gap-1 text-sm">
                  <span className="text-zinc-300">Password</span>
                  <input
                    autoComplete={authMode === "register" ? "new-password" : "current-password"}
                    className={`min-h-12 border px-4 py-3 text-base outline-none transition ${
                      authMode === "register"
                        ? "rounded-2xl border-white/15 bg-white text-zinc-950 focus:border-orange-500"
                        : "rounded-lg border-white/20 bg-black/40 text-white focus:ring-1 focus:ring-white"
                    }`}
                    minLength={8}
                    onChange={(event) => setAuthPassword(event.target.value)}
                    required
                    type="password"
                    value={authPassword}
                  />
                </label>

                {authError ? (
                  <p className={`text-sm ${authMode === "register" ? "text-red-300" : "text-zinc-300"}`}>{authError}</p>
                ) : null}

                <div className={`mt-2 grid gap-3 ${authMode === "register" ? "" : "sm:flex sm:justify-between"}`}>
                  {authMode === "register" ? (
                    <>
                      <button
                        className="min-h-12 rounded-2xl bg-black px-5 py-3 text-base font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-zinc-800 disabled:opacity-50"
                        disabled={loginMutation.isPending || registerMutation.isPending}
                        type="submit"
                      >
                        {loginMutation.isPending || registerMutation.isPending ? "Please wait..." : "I'm poor, help me save 10%"}
                      </button>
                      <button
                        className="min-h-12 rounded-2xl bg-orange-600 px-5 py-3 text-base font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-orange-500"
                        onClick={closeAuthModal}
                        type="button"
                      >
                        Fuck that, I'm rich I'll pay full price
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white hover:text-black"
                        onClick={closeAuthModal}
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        className="rounded-full border border-white bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
                        disabled={loginMutation.isPending || registerMutation.isPending}
                        type="submit"
                      >
                        {loginMutation.isPending || registerMutation.isPending ? "Please wait..." : "Sign In"}
                      </button>
                    </>
                  )}
                </div>
              </form>

              <div className={`text-sm ${authMode === "register" ? "text-zinc-500" : "text-zinc-400"}`}>
                {authMode === "register" ? (
                  <>
                    <button className="underline underline-offset-2 transition hover:text-white" onClick={() => setAuthMode("login")} type="button">
                      Already have an account? Sign in
                    </button>
                    <p className="mt-5 max-w-sm text-xs leading-6 text-zinc-500">
                      By creating an account you can track orders, speed up checkout, and get notified when limited drops go live.
                    </p>
                  </>
                ) : (
                  <button className="underline underline-offset-2" onClick={() => setAuthMode("register")} type="button">
                    Need an account? Create one
                  </button>
                )}
              </div>
            </div>

            {authMode === "register" ? (
              <div className="relative hidden min-h-full lg:block">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_22%),linear-gradient(145deg,rgba(16,16,16,0.15),rgba(0,0,0,0.7)),linear-gradient(180deg,#fb7185_0%,#ea580c_32%,#2563eb_68%,#0f172a_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.08)_45%,transparent_100%)]" />
                <img
                  alt="Grave Goods logo badge"
                  className="absolute bottom-10 left-1/2 w-[72%] max-w-md -translate-x-1/2 rotate-[8deg] rounded-full border border-white/20 object-cover shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
                  src={logo}
                />
                <div className="absolute left-8 top-8 max-w-[240px] rounded-[1.75rem] border border-white/20 bg-black/30 px-5 py-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-200">First Order Perk</p>
                  <p className="mt-2 font-display text-3xl leading-none text-white">10% off</p>
                  <p className="mt-3 text-sm leading-6 text-zinc-100">Sharp drops. Faster checkout. Order history in one place.</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <CartDrawer
        open={isCartOpen}
        products={products}
        items={items}
        onClose={() => setCartOpen(false)}
        onAdd={handleAddToCart}
        onDecrement={decrementItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

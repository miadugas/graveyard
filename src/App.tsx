import { useEffect, useMemo, useRef, useState } from "react";
import logo from "@/assets/grave_goods_logo.png";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AboutPage } from "@/components/AboutPage";
import { AdminPage } from "@/components/AdminPage";
import { AuthPromoPanel } from "@/components/AuthPromoPanel";
import { CategorySpotlightSection } from "@/components/CategorySpotlightSection";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutPage } from "@/components/CheckoutPage";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
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
const STICKER_PROMO_ALERT_STORAGE_KEY = "grave-goods-sticker-promo-alert-dismissed-v1";

const filters: Array<{ label: string; value: ProductType | "all" }> = [
  { label: "All", value: "all" },
  { label: "Stickers", value: "sticker" },
  { label: "Buttons", value: "button" },
  { label: "Bundles", value: "bundle" }
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
  const [isStickerPromoAlertDismissed, setStickerPromoAlertDismissed] = useState(() => {
    return window.localStorage.getItem(STICKER_PROMO_ALERT_STORAGE_KEY) === "true";
  });

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

  function dismissStickerPromoAlert() {
    window.localStorage.setItem(STICKER_PROMO_ALERT_STORAGE_KEY, "true");
    setStickerPromoAlertDismissed(true);
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

  const prevRouteRef = useRef(route.name);
  useEffect(() => {
    if (prevRouteRef.current !== route.name) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      prevRouteRef.current = route.name;
    }
  }, [route.name]);

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
    <div
      className="min-h-screen bg-base-100 text-base-content"
      data-theme="night"
    >
      <div className="pointer-events-none fixed inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.08)_0.7px,transparent_0.7px)] [background-size:2px_2px]" />

      <Navbar
        authUser={authUser}
        isAdmin={isAdmin}
        itemCount={itemCount}
        logoutPending={logoutMutation.isPending}
        mobileNavOpen={mobileNavOpen}
        onHomeClick={() => setRoute({ name: "shop" })}
        onLogout={() => logoutMutation.mutate()}
        onOpenAuth={openAuthModal}
        onOpenCart={() => setCartOpen(true)}
        onToggleMobileNav={() => setMobileNavOpen((prev: boolean) => !prev)}
        routeName={route.name}
      />

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
          errorMessage={
            orderMutation.isError
              ? (orderMutation.error as Error).message
              : null
          }
          successMessage={
            window.location.hash.includes("success=1")
              ? "Payment complete. Check your email for order details."
              : null
          }
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
            <section
              aria-label="Current promotions"
              className="mb-6 grid gap-3"
            >
              {activeBanners.map((special) => {
                const shapeClassMap: Record<string, string> = {
                  pill: "rounded-full px-5",
                  ribbon:
                    "rounded-md px-5 [clip-path:polygon(0_0,100%_0,97%_100%,3%_100%)]",
                  ticket: "rounded-xl border-dashed px-5",
                  burst:
                    "rounded-[1.4rem] px-5 [clip-path:polygon(6%_0,94%_0,100%_22%,100%_78%,94%_100%,6%_100%,0_78%,0_22%)]",
                };
                const themeClassMap: Record<string, string> = {
                  none: "border-primary/35 bg-[rgb(var(--gg-accent-rgb)/0.22)]",
                  coffin:
                    "border-zinc-200/35 bg-zinc-900/75 [clip-path:polygon(20%_0,80%_0,100%_30%,100%_100%,0_100%,0_30%)]",
                  tombstone:
                    "border-zinc-100/40 bg-zinc-800/75 [border-radius:1.75rem_1.75rem_0.85rem_0.85rem]",
                  bat: "border-primary/45 bg-[radial-gradient(circle_at_50%_22%,rgb(var(--gg-accent-rgb)/0.26),rgba(9,9,11,0.85))]",
                  spiderweb:
                    "border-zinc-100/35 bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.16),rgba(9,9,11,0.88)),linear-gradient(120deg,rgba(161,161,170,0.2)_1px,transparent_1px),linear-gradient(60deg,rgba(161,161,170,0.2)_1px,transparent_1px)] [background-size:auto,18px_18px,18px_18px]",
                };
                const label =
                  special.bannerText?.trim() ||
                  `${special.name} • ${special.discountPercent}% off through ${special.endDate}`;

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
          <HeroSection />

          <CategorySpotlightSection
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
          />

          <section className="mx-auto max-w-[1200px]" id="shop-products">
            <div className="mb-4 flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={`btn btn-sm rounded-full font-poster uppercase tracking-[0.08em] transition ${
                    activeFilter === filter.value
                      ? "btn-primary shadow-[0_0_16px_rgb(var(--gg-accent-rgb)/0.35)]"
                      : "btn-outline border-base-300 bg-base-100/15 text-base-content hover:border-primary/60 hover:text-primary"
                  }`}
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
              {activeFilter !== "all" ? (
                <button
                  className="btn btn-sm btn-ghost rounded-full border border-base-300 font-poster uppercase tracking-[0.08em] text-base-content/80 hover:bg-base-content hover:text-base-100"
                  onClick={() => setActiveFilter("all")}
                  type="button"
                >
                  Clear filter
                </button>
              ) : null}
            </div>

            {isLoading ? (
              <div className="grid gap-5 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`card animate-pulse overflow-hidden rounded-[1.5rem] border border-base-300 bg-base-200/90 sm:flex-row${i >= 2 ? " hidden lg:flex" : ""}`}>
                    <div className="aspect-[4/3] w-full shrink-0 bg-base-300/40 sm:aspect-auto sm:w-1/3 sm:self-stretch sm:rounded-l-[1.5rem]" />
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <div className="h-3 w-16 rounded bg-base-300/50" />
                        <div className="mt-3 h-6 w-3/4 rounded bg-base-300/50" />
                        <div className="mt-4 space-y-2">
                          <div className="h-4 w-full rounded bg-base-300/30" />
                          <div className="h-4 w-5/6 rounded bg-base-300/30" />
                        </div>
                      </div>
                      <div className="mt-6 flex items-end justify-between">
                        <div className="h-7 w-16 rounded bg-base-300/50" />
                        <div className="h-9 w-24 rounded-full bg-base-300/50" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            {isError ? (
              <div className="card border border-red-500/20 bg-red-500/5 p-8 text-center shadow-xl rounded-2xl">
                <svg className="mx-auto h-10 w-10 text-red-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <p className="mt-3 text-lg font-semibold text-base-content">Unable to load products</p>
                <p className="mt-1 text-sm text-base-content/55">Start the API server and refresh to try again.</p>
              </div>
            ) : null}

            {filteredProducts.length === 0 && !isLoading ? (
              <div className="card border border-base-300 bg-base-200/80 p-10 text-center shadow-xl rounded-2xl">
                <svg className="mx-auto h-10 w-10 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <p className="mt-4 text-lg font-semibold text-base-content">
                  No products match this filter yet.
                </p>
                <p className="mt-2 text-sm text-base-content/55">
                  Try another category or clear filters to view everything in stock.
                </p>
                <button
                  className="gg-btn-secondary mx-auto mt-5"
                  onClick={() => setActiveFilter("all")}
                  type="button"
                >
                  View all products
                </button>
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
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

          {/* <section className="card mt-8 border border-primary/30 bg-[linear-gradient(120deg,rgb(var(--gg-accent-rgb)/0.18),rgba(24,24,27,0.85)_40%,rgba(24,24,27,0.92))] p-5 shadow-xl sm:p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-base-content/70">
              Custom + Bulk
            </p>
            <h3 className="mt-2 font-display text-2xl text-base-content">
              Need a custom run?
            </h3>
            <p className="mt-3 max-w-2xl text-sm text-base-content/85">
              We can help with custom sticker batches and larger quantity
              orders. Start with account signup, then use the admin inventory
              controls to plan your next drop.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="btn rounded-full border-0 bg-[rgb(var(--gg-accent-rgb))] text-white shadow-[0_0_0_1px_rgb(var(--gg-accent-rgb)/0.3)] transition-all hover:brightness-110"
                onClick={() => openAuthModal("register")}
                type="button"
              >
                Create Account
              </button>
              <button
                className="btn btn-outline rounded-full border-base-300 text-base-content"
                onClick={() => navigateToHash("#/about")}
                type="button"
              >
                Learn About The Studio
              </button>
            </div>
          </section> */}

          <footer className="mt-12 border-t border-base-300 pt-8 pb-10">
            <div className="grid gap-8 sm:grid-cols-[1fr_1fr_1fr] lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
              <div className="sm:col-span-3 lg:col-span-1">
                <a className="inline-flex items-center gap-3" href="#/">
                  <img alt="Grave Goods" className="h-10 w-10 rounded-full border border-base-300 object-cover" src={logo} />
                  <span className="font-poster text-lg tracking-[0.06em] text-base-content">Grave Goods</span>
                </a>
                <p className="mt-3 max-w-xs text-sm leading-6 text-base-content/55">
                  Handmade drops, small batches, loud designs. Built for laptops, bottles, jackets, and organizers.
                </p>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-base-content/45">
                  Shop
                </p>
                <nav className="grid gap-2 text-sm text-base-content/65">
                  <button className="text-left transition hover:text-primary" onClick={() => setActiveFilter("all")} type="button">All Products</button>
                  <button className="text-left transition hover:text-primary" onClick={() => setActiveFilter("sticker")} type="button">Stickers</button>
                  <button className="text-left transition hover:text-primary" onClick={() => setActiveFilter("button")} type="button">Buttons</button>
                  <button className="text-left transition hover:text-primary" onClick={() => setActiveFilter("bundle")} type="button">Bundles</button>
                </nav>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-base-content/45">
                  Account
                </p>
                <nav className="grid gap-2 text-sm text-base-content/65">
                  <button className="text-left transition hover:text-primary" onClick={() => openAuthModal("login")} type="button">Sign In</button>
                  <button className="text-left transition hover:text-primary" onClick={() => openAuthModal("register")} type="button">Create Account</button>
                  <button className="text-left transition hover:text-primary" onClick={() => navigateToHash("#/orders")} type="button">Order History</button>
                  <button className="text-left transition hover:text-primary" onClick={() => navigateToHash("#/checkout")} type="button">Checkout</button>
                </nav>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-base-content/45">
                  Studio
                </p>
                <nav className="grid gap-2 text-sm text-base-content/65">
                  <button className="text-left transition hover:text-primary" onClick={() => navigateToHash("#/about")} type="button">About Grave Goods</button>
                </nav>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-base-300/50 pt-6 text-xs text-base-content/35">
              <p>&copy; {new Date().getFullYear()} Grave Goods. All rights reserved.</p>
              <p className="font-poster uppercase tracking-[0.14em]">Independent &middot; Small Batch &middot; Loud by Design</p>
            </div>
          </footer>
        </main>
      ) : null}

      <button
        aria-label="Close cart"
        aria-hidden={!isCartOpen}
        className={`fixed inset-0 z-30 bg-black/55 backdrop-blur-[1px] transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setCartOpen(false)}
        tabIndex={isCartOpen ? 0 : -1}
        type="button"
      />

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
          <button
            aria-label="Close account modal"
            className="absolute inset-0"
            onClick={closeAuthModal}
            type="button"
          />
          <div
            aria-modal="true"
            className={`relative grid w-full overflow-hidden border border-base-300 bg-[linear-gradient(180deg,#111_0%,#050505_100%)] shadow-2xl shadow-black/80 ${
              authMode === "register"
                ? "max-w-5xl rounded-[2rem] lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)]"
                : "max-w-md rounded-2xl"
            }`}
            role="dialog"
          >
            <button
              aria-label="Close account modal"
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-base-300 bg-base-100/20 text-lg text-base-content transition hover:border-primary/50 hover:text-primary"
              onClick={closeAuthModal}
              type="button"
            >
              ×
            </button>

            <div
              className={
                authMode === "register"
                  ? "grid gap-6 p-6 sm:p-8 lg:p-10"
                  : "grid gap-5 p-6 sm:p-8"
              }
            >
              <div>
                <p className="font-poster text-xs uppercase tracking-[0.2em] text-primary">
                  {authMode === "register" ? "Join the crew" : "Welcome back"}
                </p>
                <h2
                  className={`mt-2 text-base-content ${authMode === "register" ? "font-poster text-3xl uppercase tracking-[-0.02em] sm:text-4xl" : "font-poster text-2xl uppercase tracking-[-0.02em]"}`}
                >
                  {authMode === "register" ? "Save 10% on your first order" : "Sign In"}
                </h2>
                <p
                  className={`mt-3 ${authMode === "register" ? "max-w-md text-sm leading-relaxed text-base-content/60" : "text-sm text-base-content/55"}`}
                >
                  {authMode === "register"
                    ? "Create an account for 10% off, early access to drops, and first crack at limited runs."
                    : "Check orders, speed through checkout, manage your account."}
                </p>
              </div>

              <form className="grid gap-3" onSubmit={handleAuthSubmit}>
                {authMode === "register" ? (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-medium text-base-content/70">Full Name</span>
                    <input
                      className="input input-bordered min-h-12 w-full rounded-xl border-base-300 bg-base-100/10 text-base-content focus:border-primary focus:ring-1 focus:ring-primary"
                      onChange={(event) => setAuthFullName(event.target.value)}
                      placeholder="Your name"
                      required
                      type="text"
                      value={authFullName}
                    />
                  </label>
                ) : null}

                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-base-content/70">Email</span>
                  <input
                    autoComplete="username"
                    className="input input-bordered min-h-12 w-full rounded-xl border-base-300 bg-base-100/10 px-4 text-base text-base-content focus:border-primary focus:ring-1 focus:ring-primary"
                    onChange={(event) => setAuthEmail(event.target.value)}
                    placeholder="you@email.com"
                    required
                    type="email"
                    value={authEmail}
                  />
                </label>

                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-base-content/70">Password</span>
                  <input
                    autoComplete={
                      authMode === "register"
                        ? "new-password"
                        : "current-password"
                    }
                    className="input input-bordered min-h-12 w-full rounded-xl border-base-300 bg-base-100/10 px-4 text-base text-base-content focus:border-primary focus:ring-1 focus:ring-primary"
                    minLength={8}
                    onChange={(event) => setAuthPassword(event.target.value)}
                    placeholder="Min 8 characters"
                    required
                    type="password"
                    value={authPassword}
                  />
                </label>

                {authError ? (
                  <p className="text-sm text-error">
                    {authError}
                  </p>
                ) : null}

                <div
                  className={`mt-2 grid gap-3 ${authMode === "register" ? "" : "sm:flex sm:justify-between"}`}
                >
                  {authMode === "register" ? (
                    <>
                      <button
                        className="btn min-h-12 w-full rounded-full border-0 bg-[rgb(var(--gg-accent-rgb))] font-poster text-base uppercase tracking-[0.08em] text-white shadow-[0_0_0_1px_rgb(var(--gg-accent-rgb)/0.3),0_18px_50px_-20px_rgb(var(--gg-accent-rgb)/0.55)] transition-all duration-200 hover:scale-[1.02] hover:brightness-110 hover:shadow-[0_24px_60px_-16px_rgb(var(--gg-accent-rgb)/0.7)] active:scale-[0.97] disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
                        disabled={
                          loginMutation.isPending || registerMutation.isPending
                        }
                        type="submit"
                      >
                        {loginMutation.isPending || registerMutation.isPending
                          ? "Please wait..."
                          : "Create Account & Save 10%"}
                      </button>
                      <button
                        className="btn min-h-12 w-full rounded-full border-base-300 bg-transparent font-poster text-base uppercase tracking-[0.08em] text-base-content/70 transition hover:border-primary/50 hover:text-primary"
                        onClick={closeAuthModal}
                        type="button"
                      >
                        Skip for now
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn rounded-full border-base-300 bg-transparent font-poster uppercase tracking-[0.06em] text-base-content/70 transition hover:border-primary/50 hover:text-primary"
                        onClick={closeAuthModal}
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        className="btn rounded-full border-0 bg-[rgb(var(--gg-accent-rgb))] font-poster uppercase tracking-[0.06em] text-white shadow-[0_0_0_1px_rgb(var(--gg-accent-rgb)/0.3),0_12px_30px_-10px_rgb(var(--gg-accent-rgb)/0.5)] transition-all hover:scale-[1.02] hover:brightness-110 hover:shadow-[0_16px_40px_-8px_rgb(var(--gg-accent-rgb)/0.65)] active:scale-[0.97] disabled:opacity-50 disabled:shadow-none"
                        disabled={
                          loginMutation.isPending || registerMutation.isPending
                        }
                        type="submit"
                      >
                        {loginMutation.isPending || registerMutation.isPending
                          ? "Please wait..."
                          : "Sign In"}
                      </button>
                    </>
                  )}
                </div>
              </form>

              <div
                className={`text-sm ${authMode === "register" ? "text-base-content/45" : "text-base-content/55"}`}
              >
                {authMode === "register" ? (
                  <button
                    className="font-semibold text-primary transition hover:brightness-125"
                    onClick={() => setAuthMode("login")}
                    type="button"
                  >
                    Already have an account? Sign in →
                  </button>
                ) : (
                  <button
                    className="font-semibold text-primary transition hover:brightness-125"
                    onClick={() => setAuthMode("register")}
                    type="button"
                  >
                    Need an account? Create one →
                  </button>
                )}
              </div>
            </div>

            {authMode === "register" ? <AuthPromoPanel /> : null}
          </div>
        </div>
      ) : null}

      {!isStickerPromoAlertDismissed && route.name === "shop" ? (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <button
            aria-label="Close sticker promotion modal"
            className="absolute inset-0"
            onClick={dismissStickerPromoAlert}
            type="button"
          />
          <div
            aria-modal="true"
            className="relative z-10 w-full max-w-lg rounded-[2rem] border border-primary/30 bg-[linear-gradient(160deg,rgba(23,23,28,0.98),rgba(12,12,16,0.98))] p-6 shadow-[0_30px_90px_-30px_rgb(var(--gg-accent-rgb)/0.5)] sm:p-8"
            role="dialog"
          >
            <button
              aria-label="Dismiss sticker promotion modal"
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-base-300 bg-base-100/20 text-lg text-base-content transition hover:border-primary/50 hover:text-primary"
              onClick={dismissStickerPromoAlert}
              type="button"
            >
              ×
            </button>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[rgb(var(--gg-accent-rgb)/0.15)] ring-1 ring-primary/30">
              <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
              </svg>
            </div>
            <p className="text-center text-sm uppercase tracking-[0.22em] text-primary">
              Sticker Deal
            </p>
            <h2 className="mt-3 text-center font-poster text-3xl uppercase leading-none text-base-content sm:text-4xl">
              Buy 4, Get 1 Free
            </h2>
            <p className="mt-4 text-center text-base leading-7 text-base-content/75">
              All stickers are{" "}
              <span className="font-semibold text-base-content">$4.99</span>.
              Add any 5 stickers and the 5th is free automatically at checkout.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                className="btn rounded-full border-0 bg-[rgb(var(--gg-accent-rgb))] px-6 font-poster uppercase tracking-[0.08em] text-white shadow-[0_0_0_1px_rgb(var(--gg-accent-rgb)/0.3),0_18px_50px_-20px_rgb(var(--gg-accent-rgb)/0.55)] transition-all hover:scale-[1.02] hover:brightness-110 hover:shadow-[0_24px_60px_-16px_rgb(var(--gg-accent-rgb)/0.7)] active:scale-[0.97]"
                onClick={dismissStickerPromoAlert}
                type="button"
              >
                Start Shopping
              </button>
              <button
                className="btn rounded-full border border-base-300 bg-transparent px-6 font-poster uppercase tracking-[0.06em] text-base-content/70 transition hover:border-primary/50 hover:text-primary"
                onClick={dismissStickerPromoAlert}
                type="button"
              >
                Dismiss
              </button>
            </div>
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

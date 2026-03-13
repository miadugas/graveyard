import { useEffect, useMemo, useState } from "react";
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
    <div className="min-h-screen bg-base-100 text-base-content" data-theme="night">
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
        onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)}
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
                  none: "border-ember-300/35 bg-ember-700/25",
                  coffin: "border-zinc-200/35 bg-zinc-900/75 [clip-path:polygon(20%_0,80%_0,100%_30%,100%_100%,0_100%,0_30%)]",
                  tombstone: "border-zinc-100/40 bg-zinc-800/75 [border-radius:1.75rem_1.75rem_0.85rem_0.85rem]",
                  bat: "border-ember-100/45 bg-[radial-gradient(circle_at_50%_22%,rgba(168,85,247,0.26),rgba(9,9,11,0.85))]",
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
          <HeroSection />

          <CategorySpotlightSection activeFilter={activeFilter} onSelectFilter={setActiveFilter} />

          <section>
            <div className="mb-4 flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={`btn btn-sm rounded-full ${
                    activeFilter === filter.value
                      ? "btn-primary"
                      : "btn-outline border-base-300 bg-base-100/15 text-base-content"
                  }`}
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
              {activeFilter !== "all" ? (
                <button
                  className="btn btn-sm btn-ghost rounded-full border border-base-300 text-base-content/80 hover:bg-base-content hover:text-base-100"
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
              <div className="card border border-base-300 bg-base-200/80 p-8 text-center shadow-xl">
                <p className="text-lg font-semibold text-base-content">No products match this filter yet.</p>
                <p className="mt-2 text-sm text-base-content/70">Try another category or clear filters to view everything in stock.</p>
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

          <section className="card mt-8 border border-primary/30 bg-[linear-gradient(120deg,rgba(168,85,247,0.18),rgba(24,24,27,0.85)_40%,rgba(24,24,27,0.92))] p-5 shadow-xl sm:p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-base-content/70">Custom + Bulk</p>
            <h3 className="mt-2 font-display text-2xl text-base-content">Need a custom run?</h3>
            <p className="mt-3 max-w-2xl text-sm text-base-content/85">
              We can help with custom sticker batches and larger quantity orders. Start with account signup, then use the
              admin inventory controls to plan your next drop.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="btn btn-primary rounded-full"
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
          </section>

          <section className="mt-9 grid gap-6 border-t border-base-300 pt-6 text-sm sm:grid-cols-3">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.16em] text-base-content/55">Shop</p>
              <div className="grid gap-2 text-base-content/75">
                <button className="text-left transition hover:text-base-content" onClick={() => setActiveFilter("all")} type="button">All Products</button>
                <button className="text-left transition hover:text-base-content" onClick={() => setActiveFilter("sticker")} type="button">Stickers</button>
                <button className="text-left transition hover:text-base-content" onClick={() => setActiveFilter("button")} type="button">Buttons</button>
                <button className="text-left transition hover:text-base-content" onClick={() => setActiveFilter("bundle")} type="button">Bundles</button>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.16em] text-base-content/55">Account</p>
              <div className="grid gap-2 text-base-content/75">
                <button className="text-left transition hover:text-base-content" onClick={() => openAuthModal("login")} type="button">Login</button>
                <button className="text-left transition hover:text-base-content" onClick={() => openAuthModal("register")} type="button">Create Account</button>
                <button className="text-left transition hover:text-base-content" onClick={() => navigateToHash("#/orders")} type="button">Order History</button>
                <button className="text-left transition hover:text-base-content" onClick={() => navigateToHash("#/checkout")} type="button">Checkout</button>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.16em] text-base-content/55">Studio</p>
              <div className="grid gap-2 text-base-content/75">
                <button className="text-left transition hover:text-base-content" onClick={() => navigateToHash("#/about")} type="button">About Grave Goods</button>
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
            className={`relative grid w-full overflow-hidden border border-base-300 bg-base-200 shadow-2xl shadow-black/80 ${
              authMode === "register"
                ? "max-w-5xl rounded-[2rem] lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)]"
                : "max-w-md rounded-2xl"
            }`}
            role="dialog"
          >
            <button
              aria-label="Close account modal"
              className="btn btn-circle btn-sm absolute right-4 top-4 z-10 border-base-300 bg-base-100 text-base-content hover:bg-base-content hover:text-base-100"
              onClick={closeAuthModal}
              type="button"
            >
              ×
            </button>

            <div className={authMode === "register" ? "grid gap-6 p-6 sm:p-8 lg:p-10" : "grid gap-4 p-5"}>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-base-content/60">{authMode === "register" ? "New Shopper Offer" : "Account"}</p>
                <h2 className={`mt-3 text-base-content ${authMode === "register" ? "font-display text-4xl sm:text-5xl" : "font-display text-2xl"}`}>
                  {authMode === "register" ? "Save 10%" : "Sign In"}
                </h2>
                <p className={`mt-3 ${authMode === "register" ? "max-w-md text-lg leading-8 text-base-content/75" : "text-sm text-base-content/65"}`}>
                  {authMode === "register"
                    ? "Create your account for 10% off your first order, early access to new drops, and first crack at limited runs."
                    : "Sign in to check orders, move through checkout faster, and manage your account."}
                </p>
              </div>

              <form className="grid gap-3" onSubmit={handleAuthSubmit}>
                {authMode === "register" ? (
                  <label className="grid gap-1 text-sm">
                    <span className="text-base-content/75">Full Name</span>
                    <input
                      className="input input-bordered min-h-12 w-full rounded-2xl border-base-300 bg-base-100 text-base-content"
                      onChange={(event) => setAuthFullName(event.target.value)}
                      required
                      type="text"
                      value={authFullName}
                    />
                  </label>
                ) : null}

                <label className="grid gap-1 text-sm">
                  <span className="text-base-content/75">Email</span>
                  <input
                    autoComplete="username"
                    className={`input input-bordered min-h-12 w-full px-4 text-base ${
                      authMode === "register"
                        ? "rounded-2xl border-base-300 bg-base-100 text-base-content"
                        : "rounded-lg border-base-300 bg-base-100/10 text-base-content"
                    }`}
                    onChange={(event) => setAuthEmail(event.target.value)}
                    required
                    type="email"
                    value={authEmail}
                  />
                </label>

                <label className="grid gap-1 text-sm">
                  <span className="text-base-content/75">Password</span>
                  <input
                    autoComplete={authMode === "register" ? "new-password" : "current-password"}
                    className={`input input-bordered min-h-12 w-full px-4 text-base ${
                      authMode === "register"
                        ? "rounded-2xl border-base-300 bg-base-100 text-base-content"
                        : "rounded-lg border-base-300 bg-base-100/10 text-base-content"
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
                        className="btn min-h-12 rounded-2xl border-none bg-base-content px-5 py-3 text-base font-semibold uppercase tracking-[0.08em] text-base-100 hover:brightness-110 disabled:opacity-50"
                        disabled={loginMutation.isPending || registerMutation.isPending}
                        type="submit"
                      >
                        {loginMutation.isPending || registerMutation.isPending ? "Please wait..." : "I'm poor, help me save 10%"}
                      </button>
                      <button
                        className="btn btn-primary min-h-12 rounded-2xl px-5 py-3 text-base font-semibold uppercase tracking-[0.08em]"
                        onClick={closeAuthModal}
                        type="button"
                      >
                        Fuck that, I'm rich I'll pay full price
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-outline rounded-full border-base-300 text-base-content"
                        onClick={closeAuthModal}
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary rounded-full disabled:opacity-50"
                        disabled={loginMutation.isPending || registerMutation.isPending}
                        type="submit"
                      >
                        {loginMutation.isPending || registerMutation.isPending ? "Please wait..." : "Sign In"}
                      </button>
                    </>
                  )}
                </div>
              </form>

              <div className={`text-sm ${authMode === "register" ? "text-base-content/45" : "text-base-content/60"}`}>
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

            {authMode === "register" ? <AuthPromoPanel /> : null}
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

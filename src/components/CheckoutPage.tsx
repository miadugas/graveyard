import type { AuthUser, Product } from "@/types";
import { getLineTotal, getStickerPromoLabel, getUnitPrice } from "@/lib/pricing";
import logo from "@/assets/grave_goods_logo.png";

interface CheckoutPageProps {
  user: AuthUser | null;
  products: Product[];
  items: Record<string, number>;
  guestName: string;
  guestEmail: string;
  onAdd: (id: string) => void;
  onDecrement: (id: string) => void;
  onGuestNameChange: (value: string) => void;
  onGuestEmailChange: (value: string) => void;
  onPlaceOrder: () => void;
  onOpenAuth: () => void;
  onContinueShopping: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

export function CheckoutPage({
  user,
  products,
  items,
  guestName,
  guestEmail,
  onAdd,
  onDecrement,
  onGuestNameChange,
  onGuestEmailChange,
  onPlaceOrder,
  onOpenAuth,
  onContinueShopping,
  isSubmitting,
  errorMessage,
  successMessage
}: CheckoutPageProps) {
  const lineItems = Object.entries(items)
    .map(([productId, quantity]) => {
      const product = products.find((entry) => entry.id === productId);
      if (!product) {
        return null;
      }

      return {
        product,
        quantity,
        lineTotal: getLineTotal(product, quantity)
      };
    })
    .filter(Boolean) as Array<{ product: Product; quantity: number; lineTotal: number }>;

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const hasUnavailableItems = lineItems.some(
    (line) =>
      line.product.isDisabled || line.product.isSoldOut || line.quantity > line.product.stockQuantity || line.product.stockQuantity <= 0
  );
  const totalUnits = lineItems.reduce((sum, item) => sum + item.quantity, 0);
  const guestInfoMissing = !user && (!guestName.trim() || !guestEmail.trim());

  return (
    <main className="gg-page">
      {/* Header */}
      <div className="mb-6">
        <p className="font-poster text-xs uppercase tracking-[0.2em] text-primary">Checkout</p>
        <h2 className="mt-2 font-poster text-3xl uppercase tracking-[-0.02em] text-base-content md:text-4xl">
          Review Your Order
        </h2>
      </div>

      {successMessage ? (
        <div className="alert alert-success mb-6 text-sm">{successMessage}</div>
      ) : null}

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left column — Cart items + account */}
        <div className="space-y-6">
          {/* Account section */}
          {!user ? (
            <section className="rounded-2xl border border-base-300 bg-base-200/60 p-5">
              <h3 className="font-poster text-lg uppercase tracking-[-0.01em] text-base-content">Your Info</h3>
              <p className="mt-1 text-sm text-base-content/60">Guest checkout is fine. Or sign in to keep order history.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-base-content/70">Full Name</span>
                  <input
                    className="input input-bordered w-full rounded-xl border-base-300 bg-base-100/10 text-base-content focus:border-primary focus:ring-1 focus:ring-primary"
                    onChange={(event) => onGuestNameChange(event.target.value)}
                    placeholder="Your name"
                    required
                    type="text"
                    value={guestName}
                  />
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-base-content/70">Email</span>
                  <input
                    className="input input-bordered w-full rounded-xl border-base-300 bg-base-100/10 text-base-content focus:border-primary focus:ring-1 focus:ring-primary"
                    onChange={(event) => onGuestEmailChange(event.target.value)}
                    placeholder="you@email.com"
                    required
                    type="email"
                    value={guestEmail}
                  />
                </label>
              </div>
              <button
                className="mt-3 text-sm font-semibold text-primary transition hover:brightness-125"
                onClick={onOpenAuth}
                type="button"
              >
                Or sign in instead →
              </button>
            </section>
          ) : (
            <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content">
                  {(user.fullName?.charAt(0) ?? user.email.charAt(0)).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-base-content">{user.fullName ?? user.email}</p>
                  <p className="text-sm text-base-content/55">{user.email}</p>
                </div>
              </div>
            </section>
          )}

          {/* Cart items */}
          <section>
            <h3 className="font-poster text-lg uppercase tracking-[-0.01em] text-base-content">
              {lineItems.length === 0 ? "Cart is Empty" : `${totalUnits} Item${totalUnits === 1 ? "" : "s"} in Cart`}
            </h3>

            {lineItems.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-base-300 bg-base-200/60 p-8 text-center">
                <p className="text-base-content/60">Nothing here yet.</p>
                <button
                  className="btn mt-4 rounded-full border-0 bg-[rgb(var(--gg-accent-rgb))] font-poster uppercase tracking-[0.08em] text-white shadow-[0_0_0_1px_rgb(var(--gg-accent-rgb)/0.3)] transition-all hover:scale-[1.03] hover:brightness-110 active:scale-[0.97]"
                  onClick={onContinueShopping}
                  type="button"
                >
                  Go grab something
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {lineItems.map((line) => {
                  const unitPrice = getUnitPrice(line.product);
                  const promoLabel = getStickerPromoLabel(line.product);
                  const isOverStock = line.quantity > line.product.stockQuantity;

                  return (
                    <article
                      className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
                        isOverStock
                          ? "border-error/40 bg-error/5"
                          : "border-base-300 bg-base-200/60"
                      }`}
                      key={line.product.id}
                    >
                      {/* Product image */}
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-base-300/30">
                        {line.product.imageUrl ? (
                          <img
                            alt={line.product.name}
                            className="h-full w-full object-cover"
                            src={line.product.imageUrl}
                          />
                        ) : (
                          <img
                            alt=""
                            className="h-full w-full object-contain p-2 opacity-30 grayscale"
                            src={logo}
                          />
                        )}
                      </div>

                      {/* Product info */}
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-poster text-sm uppercase text-base-content">{line.product.name}</h4>
                        <p className="text-xs text-base-content/50">${unitPrice.toFixed(2)} each</p>
                        {promoLabel ? <p className="text-[0.65rem] uppercase tracking-[0.08em] text-primary">{promoLabel}</p> : null}
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-300 bg-base-100/10 text-base-content/70 transition hover:border-primary/50 hover:text-primary"
                          onClick={() => onDecrement(line.product.id)}
                          type="button"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-poster text-sm text-base-content">{line.quantity}</span>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-300 bg-base-100/10 text-base-content/70 transition hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:hover:border-base-300 disabled:hover:text-base-content/70"
                          disabled={line.product.isDisabled || line.product.isSoldOut || line.quantity >= line.product.stockQuantity}
                          onClick={() => onAdd(line.product.id)}
                          type="button"
                        >
                          +
                        </button>
                      </div>

                      {/* Line total */}
                      <p className="w-16 text-right font-poster text-base text-base-content">${line.lineTotal.toFixed(2)}</p>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Continue shopping link */}
          {lineItems.length > 0 ? (
            <button
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:gap-2.5 hover:brightness-125"
              onClick={onContinueShopping}
              type="button"
            >
              ← Keep shopping
            </button>
          ) : null}
        </div>

        {/* Right column — Order summary sidebar */}
        {lineItems.length > 0 ? (
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-base-300 bg-base-200/75 p-6 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.7)]">
              <h3 className="font-poster text-xl uppercase tracking-[-0.01em] text-base-content">Order Summary</h3>

              {/* Line items summary */}
              <div className="mt-4 space-y-3 border-b border-base-300 pb-4">
                {lineItems.map((line) => (
                  <div className="flex items-start justify-between gap-2 text-sm" key={line.product.id}>
                    <div className="min-w-0">
                      <p className="truncate text-base-content/80">{line.product.name}</p>
                      <p className="text-xs text-base-content/45">x{line.quantity}</p>
                    </div>
                    <p className="shrink-0 text-base-content">${line.lineTotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/60">Subtotal</span>
                  <span className="text-base-content">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/60">Shipping</span>
                  <span className="text-base-content/60">Calculated at payment</span>
                </div>
              </div>

              <div className="mt-4 border-t border-base-300 pt-4">
                <div className="flex justify-between">
                  <span className="font-poster text-lg uppercase text-base-content">Total</span>
                  <span className="font-poster text-2xl text-base-content">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Errors */}
              {errorMessage ? (
                <p className="mt-3 text-sm text-error">{errorMessage}</p>
              ) : null}
              {hasUnavailableItems ? (
                <p className="mt-3 text-sm text-error">Some items are out of stock. Update quantities first.</p>
              ) : null}

              {/* CTA */}
              <button
                className="btn mt-5 w-full rounded-full border-0 bg-[rgb(var(--gg-accent-rgb))] font-poster text-base uppercase tracking-[0.08em] text-white shadow-[0_0_0_1px_rgb(var(--gg-accent-rgb)/0.3),0_18px_50px_-20px_rgb(var(--gg-accent-rgb)/0.55)] transition-all duration-200 hover:scale-[1.02] hover:brightness-110 hover:shadow-[0_24px_60px_-16px_rgb(var(--gg-accent-rgb)/0.7)] active:scale-[0.97] disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
                disabled={lineItems.length === 0 || isSubmitting || hasUnavailableItems || guestInfoMissing}
                onClick={onPlaceOrder}
                type="button"
              >
                {isSubmitting ? "Redirecting..." : "Proceed to Payment"}
              </button>

              <p className="mt-3 text-center text-[0.65rem] uppercase tracking-[0.1em] text-base-content/40">
                Secure checkout via Stripe
              </p>
            </div>

            {/* Info note */}
            <div className="mt-4 rounded-xl border border-base-300/50 bg-base-200/40 p-4 text-xs text-base-content/50">
              <p>
                {user
                  ? "Order details will appear in your order history after checkout."
                  : "Guest orders aren't saved to account history. Sign in first to keep a record."}
              </p>
            </div>
          </aside>
        ) : null}
      </div>
    </main>
  );
}

import type { AuthUser, Product } from "@/types";
import { getLineTotal, getStickerPromoLabel, getUnitPrice } from "@/lib/pricing";

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
      <section className="gg-panel">
        <p className="gg-kicker">Checkout</p>
        <h2 className="mt-2 font-display text-3xl text-base-content">Review Your Order</h2>
        <div className="mt-3 grid gap-2 text-xs uppercase tracking-[0.08em] text-base-content/55 sm:grid-cols-3">
          <p className="badge badge-outline h-auto justify-start rounded-full border-base-300 bg-base-100/15 px-3 py-2">1. Cart Review</p>
          <p className={`badge h-auto justify-start rounded-full px-3 py-2 ${user ? "badge-primary badge-outline" : "badge-outline border-base-300 bg-base-100/15"}`}>
            2. Account
          </p>
          <p className="badge badge-outline h-auto justify-start rounded-full border-base-300 bg-base-100/15 px-3 py-2">3. Place Order</p>
        </div>

        {successMessage ? (
          <div className="alert alert-success mt-4 text-sm">
            {successMessage}
          </div>
        ) : null}

        {!user ? (
          <div className="card mt-4 rounded-xl border border-base-300 bg-base-100/10 p-4">
            <p className="text-base-content/78">Guest checkout is available. Enter your contact info or sign in to save order history.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="text-base-content/72">Full Name</span>
                <input
                  className="input input-bordered w-full border-base-300 bg-base-100/10 text-base-content"
                  onChange={(event) => onGuestNameChange(event.target.value)}
                  required
                  type="text"
                  value={guestName}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-base-content/72">Email</span>
                <input
                  className="input input-bordered w-full border-base-300 bg-base-100/10 text-base-content"
                  onChange={(event) => onGuestEmailChange(event.target.value)}
                  required
                  type="email"
                  value={guestEmail}
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="gg-btn-secondary" onClick={onOpenAuth} type="button">
                Sign In Instead
              </button>
              <button className="gg-btn-secondary" onClick={onContinueShopping} type="button">
                Continue Shopping
              </button>
            </div>
          </div>
        ) : null}

        {user ? (
          <div className="card mt-4 rounded-xl border border-base-300 bg-base-100/10 p-4">
            <p className="text-sm text-base-content/70">Signed in as</p>
            <p className="font-semibold text-base-content">{user.fullName ?? user.email}</p>
            <p className="text-sm text-base-content/55">{user.email}</p>
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          {lineItems.length === 0 ? (
            <p className="text-zinc-300">Your cart is empty.</p>
          ) : (
            lineItems.map((line) => (
              <article className="card rounded-xl border border-base-300 bg-base-100/10 p-3" key={line.product.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-base-content">{line.product.name}</h3>
                    <p className="text-sm text-base-content/72">${getUnitPrice(line.product).toFixed(2)} each</p>
                    {getStickerPromoLabel(line.product) ? <p className="text-xs text-base-content/55">{getStickerPromoLabel(line.product)}</p> : null}
                  </div>
                  <p className="font-semibold text-base-content">${line.lineTotal.toFixed(2)}</p>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    className="gg-btn-icon"
                    onClick={() => onDecrement(line.product.id)}
                    type="button"
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center">{line.quantity}</span>
                  <button
                    className="gg-btn-icon"
                    disabled={line.product.isDisabled || line.product.isSoldOut || line.quantity >= line.product.stockQuantity}
                    onClick={() => onAdd(line.product.id)}
                    type="button"
                  >
                    +
                  </button>
                  <span className="basis-full text-xs uppercase tracking-[0.08em] text-base-content/55 sm:basis-auto">
                    In stock: {line.product.stockQuantity}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="mt-5 border-t border-base-300 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-lg font-semibold text-base-content">Total: ${subtotal.toFixed(2)}</p>
            <p className="text-sm text-base-content/72">
              {totalUnits} item{totalUnits === 1 ? "" : "s"}
            </p>
          </div>
          {errorMessage ? <p className="mt-2 text-sm text-base-content/75">{errorMessage}</p> : null}
          {hasUnavailableItems ? (
            <p className="mt-2 text-sm text-base-content/75">Some items are out of stock. Update quantities before ordering.</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="gg-btn-primary"
              disabled={lineItems.length === 0 || isSubmitting || hasUnavailableItems || guestInfoMissing}
              onClick={onPlaceOrder}
              type="button"
            >
              {isSubmitting ? "Redirecting..." : "Proceed to Payment"}
            </button>
            <button
              className="gg-btn-secondary"
              onClick={onContinueShopping}
              type="button"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        <div className="card mt-5 rounded-xl border border-base-300 bg-base-100/10 p-4 text-sm text-base-content/72">
          <p className="font-semibold text-base-content">Before you place the order</p>
          <p className="mt-1">
            {user
              ? "You can review full order details from your order history immediately after checkout."
              : "Guest orders are not added to account history unless you sign in before checkout."}
          </p>
          <p className="mt-1">If stock changes before submit, the checkout will block and ask you to update quantities.</p>
        </div>
      </section>
    </main>
  );
}

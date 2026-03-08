import type { AuthUser, Product } from "@/types";

interface CheckoutPageProps {
  user: AuthUser | null;
  products: Product[];
  items: Record<string, number>;
  onAdd: (id: string) => void;
  onDecrement: (id: string) => void;
  onPlaceOrder: () => void;
  onOpenAuth: () => void;
  onContinueShopping: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

export function CheckoutPage({
  user,
  products,
  items,
  onAdd,
  onDecrement,
  onPlaceOrder,
  onOpenAuth,
  onContinueShopping,
  isSubmitting,
  errorMessage
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
        lineTotal: product.price * quantity
      };
    })
    .filter(Boolean) as Array<{ product: Product; quantity: number; lineTotal: number }>;

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const hasUnavailableItems = lineItems.some(
    (line) => line.product.isSoldOut || line.quantity > line.product.stockQuantity || line.product.stockQuantity <= 0
  );
  const totalUnits = lineItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="gg-page">
      <section className="gg-panel">
        <p className="gg-kicker">Checkout</p>
        <h2 className="mt-2 font-display text-3xl text-white">Review Your Order</h2>
        <div className="mt-3 grid gap-2 text-xs uppercase tracking-[0.08em] text-zinc-400 sm:grid-cols-3">
          <p className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5">1. Cart Review</p>
          <p className={`rounded-full border px-3 py-1.5 ${user ? "border-white/30 bg-white/5 text-zinc-200" : "border-white/15 bg-black/25"}`}>
            2. Account
          </p>
          <p className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5">3. Place Order</p>
        </div>

        {!user ? (
          <div className="mt-4 rounded-xl border border-white/15 bg-black/30 p-4">
            <p className="text-zinc-200">Sign in or create an account to place your order.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="gg-btn-primary"
                onClick={onOpenAuth}
                type="button"
              >
                Sign In / Create Account
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
        ) : null}

        {user ? (
          <div className="mt-4 rounded-xl border border-white/15 bg-black/30 p-4">
            <p className="text-sm text-zinc-300">Signed in as</p>
            <p className="font-semibold text-white">{user.fullName ?? user.email}</p>
            <p className="text-sm text-zinc-400">{user.email}</p>
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          {lineItems.length === 0 ? (
            <p className="text-zinc-300">Your cart is empty.</p>
          ) : (
            lineItems.map((line) => (
              <article className="rounded-xl border border-white/10 bg-black/20 p-3" key={line.product.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{line.product.name}</h3>
                    <p className="text-sm text-zinc-300">${line.product.price.toFixed(2)} each</p>
                  </div>
                  <p className="font-semibold text-zinc-100">${line.lineTotal.toFixed(2)}</p>
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
                    disabled={line.product.isSoldOut || line.quantity >= line.product.stockQuantity}
                    onClick={() => onAdd(line.product.id)}
                    type="button"
                  >
                    +
                  </button>
                  <span className="basis-full text-xs uppercase tracking-[0.08em] text-zinc-400 sm:basis-auto">
                    In stock: {line.product.stockQuantity}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="mt-5 border-t border-white/15 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-lg font-semibold text-white">Total: ${subtotal.toFixed(2)}</p>
            <p className="text-sm text-zinc-300">
              {totalUnits} item{totalUnits === 1 ? "" : "s"}
            </p>
          </div>
          {errorMessage ? <p className="mt-2 text-sm text-zinc-300">{errorMessage}</p> : null}
          {hasUnavailableItems ? (
            <p className="mt-2 text-sm text-zinc-300">Some items are out of stock. Update quantities before ordering.</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="gg-btn-primary"
              disabled={lineItems.length === 0 || !user || isSubmitting || hasUnavailableItems}
              onClick={onPlaceOrder}
              type="button"
            >
              {isSubmitting ? "Placing order..." : "Place Order"}
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

        <div className="mt-5 rounded-xl border border-white/15 bg-black/25 p-4 text-sm text-zinc-300">
          <p className="font-semibold text-zinc-100">Before you place the order</p>
          <p className="mt-1">You can review full order details from your order history immediately after checkout.</p>
          <p className="mt-1">If stock changes before submit, the checkout will block and ask you to update quantities.</p>
        </div>
      </section>
    </main>
  );
}

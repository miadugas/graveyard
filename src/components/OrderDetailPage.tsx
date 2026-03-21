import type { OrderDetail } from "@/types";

interface OrderDetailPageProps {
  order: OrderDetail | undefined;
  isLoading: boolean;
  isError: boolean;
  onBackToOrders: () => void;
  onContinueShopping: () => void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function OrderDetailPage({ order, isLoading, isError, onBackToOrders, onContinueShopping }: OrderDetailPageProps) {
  return (
    <main className="gg-page">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-poster text-xs uppercase tracking-[0.2em] text-primary">Order Detail</p>
          <h2 className="mt-2 font-poster text-3xl uppercase tracking-[-0.02em] text-base-content md:text-4xl">
            {order ? `Order #${order.id.slice(0, 8)}` : "Order"}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-sm rounded-full border-base-300 font-poster uppercase tracking-[0.06em] text-base-content/70 transition hover:border-primary/50 hover:text-primary"
            onClick={onBackToOrders}
            type="button"
          >
            ← Orders
          </button>
          <button
            className="btn btn-sm rounded-full border-0 bg-[rgb(var(--gg-accent-rgb))] font-poster uppercase tracking-[0.06em] text-white shadow-[0_0_0_1px_rgb(var(--gg-accent-rgb)/0.3)] transition-all hover:scale-[1.03] hover:brightness-110 active:scale-[0.97]"
            onClick={onContinueShopping}
            type="button"
          >
            Shop again
          </button>
        </div>
      </div>

      {isLoading ? <p className="mt-6 text-base-content/60">Loading order detail...</p> : null}
      {isError ? <p className="mt-6 text-error">Unable to load this order.</p> : null}

      {order && !isLoading && !isError ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Left — Items */}
          <div>
            {/* Celebration header */}
            <div className="mb-6 text-center lg:text-left">
              <p className="text-4xl">🎉</p>
              <p className="mt-2 font-poster text-2xl uppercase tracking-[-0.02em] text-base-content">
                Thanks for the order
              </p>
              <p className="mt-1 text-sm text-base-content/55">
                You just made the world slightly more decorated.
              </p>
            </div>

            {/* Item table */}
            <div className="overflow-hidden rounded-2xl border border-base-300">
              {/* Table header */}
              <div className="hidden border-b border-base-300 bg-base-200/50 px-5 py-3 sm:grid sm:grid-cols-[1fr_80px_80px_90px]">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-base-content/50">Product</span>
                <span className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-base-content/50">Qty</span>
                <span className="text-right text-xs font-semibold uppercase tracking-[0.12em] text-base-content/50">Price</span>
                <span className="text-right text-xs font-semibold uppercase tracking-[0.12em] text-base-content/50">Total</span>
              </div>

              {/* Items */}
              {order.items.map((item, idx) => (
                <div
                  className={`grid items-center gap-2 px-5 py-4 sm:grid-cols-[1fr_80px_80px_90px] ${
                    idx < order.items.length - 1 ? "border-b border-base-300/50" : ""
                  }`}
                  key={item.id}
                >
                  <h4 className="font-poster text-sm uppercase text-base-content">{item.productName}</h4>
                  <p className="text-sm text-base-content/60 sm:text-center">x{item.quantity}</p>
                  <p className="text-sm text-base-content/60 sm:text-right">${item.unitPrice.toFixed(2)}</p>
                  <p className="font-poster text-base text-base-content sm:text-right">${item.lineTotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Order summary sidebar */}
          <aside>
            <div className="rounded-2xl border border-base-300 bg-base-200/75 p-6 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.7)]">
              <h3 className="font-poster text-xl uppercase tracking-[-0.01em] text-base-content">Order Summary</h3>

              {/* Customer info */}
              <div className="mt-4 border-b border-base-300 pb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-base-content/45">Customer</p>
                <p className="mt-1 text-sm font-semibold text-base-content">{order.customerName}</p>
                <p className="text-sm text-base-content/55">{order.customerEmail}</p>
              </div>

              {/* Order date */}
              <div className="mt-4 border-b border-base-300 pb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-base-content/45">Placed</p>
                <p className="mt-1 text-sm text-base-content">{formatDate(order.createdAt)}</p>
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/60">Items</span>
                  <span className="text-base-content">{order.totalQuantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/60">Order Total</span>
                  <span className="font-poster text-base text-primary">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-5 border-t border-base-300 pt-5">
                <div className="flex justify-between">
                  <span className="font-poster text-lg uppercase text-base-content">Total Paid</span>
                  <span className="font-poster text-2xl text-base-content">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Support note */}
            <div className="mt-4 rounded-xl border border-base-300/50 bg-base-200/40 p-4 text-xs text-base-content/50">
              <p>
                Need a change? Email us with order #{order.id.slice(0, 8)} before we ship it.
              </p>
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  );
}

import type { OrderSummary } from "@/types";

interface OrderHistoryPageProps {
  orders: OrderSummary[];
  isLoading: boolean;
  isError: boolean;
  onOpenOrder: (id: string) => void;
  onContinueShopping: () => void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function OrderHistoryPage({ orders, isLoading, isError, onOpenOrder, onContinueShopping }: OrderHistoryPageProps) {
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalUnits = orders.reduce((sum, order) => sum + order.totalQuantity, 0);

  return (
    <main className="gg-page">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-poster text-xs uppercase tracking-[0.2em] text-primary">Orders</p>
          <h2 className="mt-2 font-poster text-3xl uppercase tracking-[-0.02em] text-base-content md:text-4xl">
            Order History
          </h2>
        </div>
        <button
          className="btn btn-sm rounded-full border-0 bg-[rgb(var(--gg-accent-rgb))] font-poster uppercase tracking-[0.06em] text-white shadow-[0_0_0_1px_rgb(var(--gg-accent-rgb)/0.3)] transition-all hover:scale-[1.03] hover:brightness-110 active:scale-[0.97]"
          onClick={onContinueShopping}
          type="button"
        >
          Keep shopping
        </button>
      </div>

      {/* Stats bar */}
      {!isLoading && !isError && orders.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-base-300 bg-base-200/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-base-content/45">Orders</p>
            <p className="mt-1 font-poster text-2xl text-base-content">{orders.length}</p>
          </div>
          <div className="rounded-xl border border-base-300 bg-base-200/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-base-content/45">Items Grabbed</p>
            <p className="mt-1 font-poster text-2xl text-base-content">{totalUnits}</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary/60">Lifetime Spend</p>
            <p className="mt-1 font-poster text-2xl text-primary">${totalSpent.toFixed(2)}</p>
          </div>
        </div>
      ) : null}

      {isLoading ? <p className="mt-8 text-base-content/60">Loading orders...</p> : null}
      {isError ? <p className="mt-8 text-error">Unable to load orders right now.</p> : null}

      {!isLoading && !isError ? (
        <div className="mt-8">
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-base-300 bg-base-200/60 p-10 text-center">
              <p className="font-poster text-xl uppercase text-base-content/60">No orders yet</p>
              <p className="mt-2 text-sm text-base-content/40">Time to fix that.</p>
              <button
                className="btn mt-5 rounded-full border-0 bg-[rgb(var(--gg-accent-rgb))] font-poster uppercase tracking-[0.08em] text-white shadow-[0_0_0_1px_rgb(var(--gg-accent-rgb)/0.3)] transition-all hover:scale-[1.03] hover:brightness-110 active:scale-[0.97]"
                onClick={onContinueShopping}
                type="button"
              >
                Go grab something
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-base-300">
              {/* Table header */}
              <div className="hidden border-b border-base-300 bg-base-200/50 px-5 py-3 sm:grid sm:grid-cols-[1fr_100px_100px_120px]">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-base-content/50">Order</span>
                <span className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-base-content/50">Items</span>
                <span className="text-right text-xs font-semibold uppercase tracking-[0.12em] text-base-content/50">Total</span>
                <span className="text-right text-xs font-semibold uppercase tracking-[0.12em] text-base-content/50" />
              </div>

              {orders.map((order, idx) => (
                <div
                  className={`grid items-center gap-2 px-5 py-4 transition hover:bg-primary/5 sm:grid-cols-[1fr_100px_100px_120px] ${
                    idx < orders.length - 1 ? "border-b border-base-300/50" : ""
                  }`}
                  key={order.id}
                >
                  <div>
                    <p className="font-poster text-sm uppercase text-base-content">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-base-content/45">{formatDate(order.createdAt)}</p>
                  </div>
                  <p className="text-sm text-base-content/60 sm:text-center">
                    {order.totalQuantity} item{order.totalQuantity === 1 ? "" : "s"}
                  </p>
                  <p className="font-poster text-base text-base-content sm:text-right">${order.totalAmount.toFixed(2)}</p>
                  <div className="sm:text-right">
                    <button
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:gap-2 hover:brightness-125"
                      onClick={() => onOpenOrder(order.id)}
                      type="button"
                    >
                      View details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </main>
  );
}

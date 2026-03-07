import type { OrderSummary } from "@/types";

interface OrderHistoryPageProps {
  orders: OrderSummary[];
  isLoading: boolean;
  isError: boolean;
  onOpenOrder: (id: string) => void;
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

export function OrderHistoryPage({ orders, isLoading, isError, onOpenOrder }: OrderHistoryPageProps) {
  return (
    <main className="mx-auto w-[min(1120px,92vw)] py-10">
      <section className="rounded-2xl border border-white/20 bg-zinc-950/90 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Orders</p>
        <h2 className="mt-2 font-display text-3xl text-white">Order History</h2>

        {isLoading ? <p className="mt-4 text-zinc-300">Loading orders...</p> : null}
        {isError ? <p className="mt-4 text-zinc-300">Unable to load orders right now.</p> : null}

        {!isLoading && !isError ? (
          <div className="mt-5 space-y-3">
            {orders.length === 0 ? (
              <p className="text-zinc-300">No orders yet.</p>
            ) : (
              orders.map((order) => (
                <article className="rounded-xl border border-white/10 bg-black/20 p-3" key={order.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-zinc-400">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-zinc-300">{formatDate(order.createdAt)}</p>
                      <p className="text-sm text-zinc-300">
                        {order.totalQuantity} items across {order.lineItemCount} lines
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">${order.totalAmount.toFixed(2)}</p>
                      <button
                        className="mt-2 rounded-full border border-white/30 px-3 py-1 text-sm text-zinc-200 transition hover:bg-white hover:text-black"
                        onClick={() => onOpenOrder(order.id)}
                        type="button"
                      >
                        View details
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}

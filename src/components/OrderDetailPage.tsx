import type { OrderDetail } from "@/types";

interface OrderDetailPageProps {
  order: OrderDetail | undefined;
  isLoading: boolean;
  isError: boolean;
  onBackToOrders: () => void;
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

export function OrderDetailPage({ order, isLoading, isError, onBackToOrders }: OrderDetailPageProps) {
  return (
    <main className="mx-auto w-[min(1120px,92vw)] py-10">
      <section className="rounded-2xl border border-white/20 bg-zinc-950/90 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Order Detail</p>
            <h2 className="mt-2 font-display text-3xl text-white">
              {order ? `Order #${order.id.slice(0, 8)}` : "Order"}
            </h2>
          </div>
          <button
            className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white hover:text-black"
            onClick={onBackToOrders}
            type="button"
          >
            Back to Orders
          </button>
        </div>

        {isLoading ? <p className="mt-4 text-zinc-300">Loading order detail...</p> : null}
        {isError ? <p className="mt-4 text-zinc-300">Unable to load this order.</p> : null}

        {order && !isLoading && !isError ? (
          <>
            <div className="mt-4 rounded-xl border border-white/15 bg-black/30 p-4">
              <p className="text-sm text-zinc-300">Placed: {formatDate(order.createdAt)}</p>
              <p className="text-sm text-zinc-300">Customer: {order.customerName}</p>
              <p className="text-sm text-zinc-400">{order.customerEmail}</p>
            </div>

            <div className="mt-5 space-y-3">
              {order.items.map((item) => (
                <article className="rounded-xl border border-white/10 bg-black/20 p-3" key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{item.productName}</h3>
                      <p className="text-sm text-zinc-300">
                        {item.quantity} x ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-zinc-100">${item.lineTotal.toFixed(2)}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-5 border-t border-white/15 pt-4">
              <p className="text-sm text-zinc-300">Total quantity: {order.totalQuantity}</p>
              <p className="text-lg font-semibold text-white">Total: ${order.totalAmount.toFixed(2)}</p>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}

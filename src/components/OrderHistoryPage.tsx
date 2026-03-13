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
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function OrderHistoryPage({ orders, isLoading, isError, onOpenOrder, onContinueShopping }: OrderHistoryPageProps) {
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalUnits = orders.reduce((sum, order) => sum + order.totalQuantity, 0);

  return (
    <main className="gg-page">
      <section className="gg-panel">
        <p className="gg-kicker">Orders</p>
        <h2 className="mt-2 font-display text-3xl text-base-content">Order History</h2>
        {!isLoading && !isError && orders.length > 0 ? (
          <div className="card mt-3 grid gap-2 rounded-xl border border-base-300 bg-base-100/10 p-3 text-sm text-base-content/72 sm:grid-cols-3">
            <p>Orders placed: <span className="font-semibold text-base-content">{orders.length}</span></p>
            <p>Total items: <span className="font-semibold text-base-content">{totalUnits}</span></p>
            <p>Lifetime spend: <span className="font-semibold text-base-content">${totalSpent.toFixed(2)}</span></p>
          </div>
        ) : null}

        {isLoading ? <p className="mt-4 text-base-content/72">Loading orders...</p> : null}
        {isError ? <p className="mt-4 text-base-content/72">Unable to load orders right now.</p> : null}

        {!isLoading && !isError ? (
          <div className="mt-5 space-y-3">
            {orders.length === 0 ? (
              <div className="card rounded-xl border border-base-300 bg-base-100/10 p-5">
                <p className="text-base-content/72">No orders yet.</p>
                <button
                  className="gg-btn-secondary mt-3 w-full sm:w-auto"
                  onClick={onContinueShopping}
                  type="button"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              orders.map((order) => (
                <article className="card rounded-xl border border-base-300 bg-base-100/10 p-3" key={order.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-base-content/55">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-base-content/72">{formatDate(order.createdAt)}</p>
                      <p className="text-sm text-base-content/72">
                        {order.totalQuantity} items across {order.lineItemCount} lines
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-base-content">${order.totalAmount.toFixed(2)}</p>
                      <button
                        className="gg-btn-secondary mt-2 w-full sm:w-auto"
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

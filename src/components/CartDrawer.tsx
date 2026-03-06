import type { Product } from "@/types";

interface CartDrawerProps {
  open: boolean;
  products: Product[];
  items: Record<string, number>;
  onClose: () => void;
  onAdd: (id: string) => void;
  onDecrement: (id: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  open,
  products,
  items,
  onClose,
  onAdd,
  onDecrement,
  onCheckout
}: CartDrawerProps) {
  const lineItems = Object.entries(items)
    .map(([productId, qty]) => {
      const product = products.find((entry) => entry.id === productId);
      if (!product) {
        return null;
      }
      return { product, qty, total: product.price * qty };
    })
    .filter(Boolean) as { product: Product; qty: number; total: number }[];

  const subtotal = lineItems.reduce((sum, line) => sum + line.total, 0);

  return (
    <aside
      className={`fixed right-0 top-0 z-40 h-full w-[92vw] max-w-sm p-3 transition-transform ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!open}
      aria-label="Shopping cart"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-t-[190px] rounded-b-[18px] border border-white/20 bg-[linear-gradient(180deg,#111_0%,#050505_55%,#050505_100%)] px-4 pb-4 pt-6 shadow-2xl shadow-black/80">
        <div className="mb-4 pt-12 text-center">
          <h2 className="font-display text-xl leading-tight text-white md:text-2xl">Here Lies Your Cart</h2>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-zinc-400">Tap outside to close</p>
          <button
            className="mx-auto mt-3 rounded-full border border-white/20 px-3 py-1 text-sm text-white transition hover:bg-white hover:text-black"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto pb-4">
          {lineItems.length === 0 ? (
            <p className="text-zinc-300">Cart is empty. Pick your favorites.</p>
          ) : (
            lineItems.map((line) => (
              <article className="rounded-xl border border-white/10 bg-black/20 p-3" key={line.product.id}>
                <h3 className="font-semibold text-white">{line.product.name}</h3>
                <p className="text-sm text-zinc-300">${line.product.price.toFixed(2)} each</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    className="rounded-full border border-white/25 px-2 text-white transition hover:bg-white hover:text-black"
                    onClick={() => onDecrement(line.product.id)}
                  >
                    -
                  </button>
                  <span>{line.qty}</span>
                  <button
                    className="rounded-full border border-white/25 px-2 text-white transition hover:bg-white hover:text-black"
                    onClick={() => onAdd(line.product.id)}
                  >
                    +
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="mt-auto border-t border-white/15 bg-zinc-950/90 p-4">
          <p className="mb-3 text-sm text-zinc-300">
            Subtotal <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
          </p>
          <button
            className="w-full rounded-full border border-white bg-white py-2 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onCheckout}
            disabled={lineItems.length === 0}
            type="button"
          >
            Place Demo Order
          </button>
        </div>
      </div>
    </aside>
  );
}

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
      className={`fixed right-0 top-0 z-40 h-full w-[92vw] max-w-sm border-l border-white/15 bg-soot-800 p-4 transition-transform ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!open}
      aria-label="Shopping cart"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl">Your Cart</h2>
        <button className="rounded-full border border-white/20 px-3 py-1 text-sm" onClick={onClose} type="button">
          Close
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto pb-28">
        {lineItems.length === 0 ? (
          <p className="text-stone-300">Cart is empty. Pick your favorites.</p>
        ) : (
          lineItems.map((line) => (
            <article className="rounded-xl border border-white/10 bg-black/20 p-3" key={line.product.id}>
              <h3 className="font-semibold text-amber-50">{line.product.name}</h3>
              <p className="text-sm text-stone-300">${line.product.price.toFixed(2)} each</p>
              <div className="mt-2 flex items-center gap-2">
                <button className="rounded-full border border-white/25 px-2" onClick={() => onDecrement(line.product.id)}>
                  -
                </button>
                <span>{line.qty}</span>
                <button className="rounded-full border border-white/25 px-2" onClick={() => onAdd(line.product.id)}>
                  +
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-white/15 bg-soot-800 p-4">
        <p className="mb-3 text-sm text-stone-300">
          Subtotal <span className="font-semibold text-amber-100">${subtotal.toFixed(2)}</span>
        </p>
        <button
          className="w-full rounded-full bg-ember-500 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onCheckout}
          disabled={lineItems.length === 0}
          type="button"
        >
          Place Demo Order
        </button>
      </div>
    </aside>
  );
}

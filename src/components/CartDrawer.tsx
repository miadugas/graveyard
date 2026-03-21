import { useEffect, useId, useRef } from "react";
import { getLineTotal, getStickerPromoLabel, getUnitPrice } from "@/lib/pricing";
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
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const lineItems = Object.entries(items)
    .map(([productId, qty]) => {
      const product = products.find((entry) => entry.id === productId);
      if (!product) {
        return null;
      }
      return { product, qty, total: getLineTotal(product, qty) };
    })
    .filter(Boolean) as { product: Product; qty: number; total: number }[];

  const subtotal = lineItems.reduce((sum, line) => sum + line.total, 0);
  const totalUnits = lineItems.reduce((sum, line) => sum + line.qty, 0);
  const hasUnavailableItems = lineItems.some(
    (line) => line.product.isDisabled || line.product.isSoldOut || line.product.stockQuantity <= 0 || line.qty > line.product.stockQuantity
  );

  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const frameId = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      previousFocusRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <aside
      aria-labelledby={titleId}
      aria-modal={open}
      aria-hidden={!open}
      className={`fixed right-0 top-0 z-40 h-full w-[92vw] max-w-sm p-3 transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      role="dialog"
      style={{ pointerEvents: open ? "auto" : "none" }}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-t-[3rem] rounded-b-[18px] border border-base-300 bg-[linear-gradient(180deg,#111_0%,#050505_55%,#050505_100%)] px-4 pb-4 pt-6 shadow-2xl shadow-black/80">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between pt-2">
          <div>
            <h2 className="font-poster text-xl uppercase tracking-[-0.02em] text-base-content md:text-2xl" id={titleId}>
              Your Cart
            </h2>
            <p className="mt-1 text-xs uppercase tracking-[0.1em] text-base-content/45">
              {totalUnits === 0 ? "Empty" : `${totalUnits} item${totalUnits === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            aria-label="Close cart"
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-base-300 bg-base-100/20 text-lg text-base-content transition hover:border-primary/50 hover:text-primary"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div className="space-y-3 overflow-y-auto pb-4">
          {lineItems.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <svg className="h-10 w-10 text-base-content/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <p className="text-sm text-base-content/45">Nothing here yet. Go grab something.</p>
            </div>
          ) : (
            lineItems.map((line) => (
              <article className="flex gap-3 rounded-xl border border-base-300 bg-base-100/10 p-3 transition hover:border-primary/30" key={line.product.id}>
                {/* Thumbnail */}
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-base-300/50 bg-base-200/50">
                  {line.product.imageUrl ? (
                    <img alt={line.product.name} className="h-full w-full object-cover" src={line.product.imageUrl} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-base-content/30">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="truncate font-poster text-xs uppercase text-base-content">{line.product.name}</h3>
                  <p className="text-[0.65rem] text-base-content/45">${getUnitPrice(line.product).toFixed(2)} each</p>
                  {getStickerPromoLabel(line.product) ? (
                    <p className="text-[0.6rem] uppercase tracking-[0.06em] text-primary/70">{getStickerPromoLabel(line.product)}</p>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      <button
                        aria-label={`Decrease quantity of ${line.product.name}`}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-base-300 bg-base-100/20 text-xs text-base-content transition hover:border-primary/50 hover:text-primary"
                        onClick={() => onDecrement(line.product.id)}
                        type="button"
                      >
                        −
                      </button>
                      <span className="min-w-[1.25rem] text-center font-poster text-xs">{line.qty}</span>
                      <button
                        aria-label={`Increase quantity of ${line.product.name}`}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-base-300 bg-base-100/20 text-xs text-base-content transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                        disabled={line.product.isDisabled || line.product.isSoldOut || line.qty >= line.product.stockQuantity}
                        onClick={() => onAdd(line.product.id)}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-poster text-sm text-base-content">${line.total.toFixed(2)}</span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-base-300 pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-base-content/60">Subtotal</span>
            <span className="font-poster text-xl text-base-content">${subtotal.toFixed(2)}</span>
          </div>
          <p className="mt-1 text-[0.65rem] uppercase tracking-[0.08em] text-base-content/35">
            Shipping and tax calculated at checkout.
          </p>
          {hasUnavailableItems ? (
            <p className="mt-2 text-xs text-error">
              Some items exceed stock. Adjust before checkout.
            </p>
          ) : null}
          <button
            className="btn mt-4 w-full rounded-full border-0 bg-[rgb(var(--gg-accent-rgb))] font-poster text-base uppercase tracking-[0.08em] text-white shadow-[0_0_0_1px_rgb(var(--gg-accent-rgb)/0.3),0_18px_50px_-20px_rgb(var(--gg-accent-rgb)/0.55)] transition-all duration-200 hover:scale-[1.02] hover:brightness-110 hover:shadow-[0_24px_60px_-16px_rgb(var(--gg-accent-rgb)/0.7)] active:scale-[0.97] disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
            onClick={onCheckout}
            disabled={lineItems.length === 0 || hasUnavailableItems}
            type="button"
          >
            Go to Checkout
          </button>
        </div>
      </div>
    </aside>
  );
}

import { useEffect, useId, useRef } from "react";
import logo from "@/assets/grave_goods_logo.png";
import type { Product } from "@/types";

interface ProductQuickViewProps {
  open: boolean;
  product: Product | null;
  onAdd: (id: string) => void;
  onClose: () => void;
}

export function ProductQuickView({ open, product, onAdd, onClose }: ProductQuickViewProps) {
  const titleId = useId();
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frameId = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(frameId);
      previousFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open || !product) {
    return null;
  }

  const isUnavailable = product.isSoldOut || product.stockQuantity <= 0;
  const isLowStock = !isUnavailable && product.stockQuantity <= 5;
  const stockLabel = isUnavailable ? "Sold out" : isLowStock ? `Low stock: ${product.stockQuantity} left` : `${product.stockQuantity} available`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <button aria-label="Close quick view" className="absolute inset-0" onClick={onClose} type="button" />
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(180deg,rgba(16,16,20,0.98),rgba(8,8,10,0.98))] shadow-[0_40px_120px_-48px_rgba(0,0,0,1)] lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]"
        role="dialog"
      >
        <button
          aria-label="Close quick view"
          className="absolute right-4 top-4 z-20 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/15 bg-black/45 text-2xl leading-none text-white transition hover:bg-white hover:text-black"
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          ×
        </button>

        <div className="relative min-h-[360px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%),linear-gradient(180deg,#1c1d22_0%,#0b0c10_100%)] p-4 sm:p-6">
          <div className="h-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/25">
            {product.imageUrl ? (
              <img alt={product.name} className="h-full w-full object-contain" src={product.imageUrl} />
            ) : (
              <img
                alt=""
                aria-hidden="true"
                className="mx-auto h-full max-h-[520px] w-full max-w-[520px] object-contain opacity-35 grayscale"
                src={logo}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 pr-14">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-200">
              {product.type}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                isUnavailable
                  ? "bg-red-600 text-white"
                  : isLowStock
                    ? "bg-amber-400 text-zinc-950"
                    : "bg-emerald-500 text-white"
              }`}
            >
              {isUnavailable ? "Sold out" : "Ready to ship"}
            </span>
          </div>

          <h2 className="mt-5 font-display text-4xl leading-none text-white sm:text-5xl" id={titleId}>
            {product.name}
          </h2>
          <p className="mt-5 text-base leading-8 text-zinc-300">{product.description}</p>

          <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-semibold leading-none text-white">${product.price.toFixed(2)}</p>
                <p className="mt-2 text-sm text-zinc-400">{stockLabel}</p>
              </div>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white px-6 py-3 text-base font-semibold text-black transition hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:border-transparent disabled:bg-zinc-700 disabled:text-zinc-400"
                disabled={isUnavailable}
                onClick={() => onAdd(product.id)}
                type="button"
              >
                {isUnavailable ? "Sold Out" : "Add to cart"}
              </button>
            </div>
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
              Full-size art preview for a closer look before checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

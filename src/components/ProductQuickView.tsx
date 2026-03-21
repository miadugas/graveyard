import { useEffect, useId, useRef } from "react";
import logo from "@/assets/grave_goods_logo.png";
import { getDisplayLabel, getStickerPromoLabel, getUnitPrice } from "@/lib/pricing";
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
  const promoLabel = getStickerPromoLabel(product);
  const unitPrice = getUnitPrice(product);
  const displayLabel = getDisplayLabel(product);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <button aria-label="Close quick view" className="absolute inset-0" onClick={onClose} type="button" />
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(180deg,rgba(16,16,20,0.98),rgba(8,8,10,0.98))] shadow-[0_40px_120px_-48px_rgba(0,0,0,1)] lg:h-[min(85vh,680px)] lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]"
        role="dialog"
      >
        <button
          aria-label="Close quick view"
          className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-base-300 bg-base-100/20 text-lg text-base-content transition hover:border-primary/50 hover:text-primary"
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          ×
        </button>

        {/* Image — centered both axes */}
        <div className="flex items-center justify-center bg-[radial-gradient(circle_at_center,rgb(var(--gg-accent-rgb)/0.06),transparent_50%),linear-gradient(180deg,#111_0%,#050505_100%)] p-6">
          <div className="flex h-full max-h-[520px] w-full items-center justify-center overflow-hidden rounded-[1.75rem] border border-base-300/50 bg-black/25">
            {product.imageUrl ? (
              <img alt={product.name} className="max-h-full max-w-full object-contain p-4" src={product.imageUrl} />
            ) : (
              <img
                alt=""
                aria-hidden="true"
                className="max-h-[320px] max-w-[320px] object-contain opacity-35 grayscale"
                src={logo}
              />
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="flex min-h-0 flex-col p-6 sm:p-8">
          {/* Badges (pinned top) */}
          <div className="flex flex-shrink-0 flex-wrap items-center gap-3 pr-14">
            <span className="rounded-full border border-base-300 bg-base-200/60 px-3 py-1 font-poster text-[0.65rem] uppercase tracking-[0.18em] text-base-content/70">
              {product.type}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                isUnavailable
                  ? "bg-error/80 text-error-content"
                  : isLowStock
                    ? "bg-warning/80 text-warning-content"
                    : "bg-success/80 text-success-content"
              }`}
            >
              {isUnavailable ? "Sold out" : "Ready to ship"}
            </span>
          </div>

          {/* Title (pinned) */}
          <h2 className="mt-4 flex-shrink-0 font-poster text-3xl uppercase leading-none tracking-[-0.02em] text-base-content sm:text-4xl" id={titleId}>
            {product.name}
          </h2>
          {displayLabel ? <p className="mt-2 flex-shrink-0 text-sm font-medium uppercase tracking-[0.12em] text-base-content/45">{displayLabel}</p> : null}

          {/* Description — scrollable middle */}
          <div className="mt-4 min-h-[3rem] flex-1 overflow-y-auto pr-1">
            <p className="text-sm leading-relaxed text-base-content/70">{product.description}</p>
          </div>

          {/* Price + CTA (pinned bottom) */}
          <div className="mt-4 flex flex-shrink-0 items-end justify-between gap-4 rounded-2xl border border-base-300 bg-base-100/10 p-4">
            <div>
              <p className="font-poster text-3xl leading-none text-base-content">${unitPrice.toFixed(2)}</p>
              <p className="mt-1.5 text-xs text-base-content/50">{promoLabel ?? stockLabel}</p>
            </div>
            <button
              className="btn inline-flex min-h-11 items-center justify-center rounded-full border-0 bg-[rgb(var(--gg-accent-rgb))] px-6 py-3 font-poster text-base uppercase tracking-[0.08em] text-white shadow-[0_0_0_1px_rgb(var(--gg-accent-rgb)/0.3),0_18px_50px_-20px_rgb(var(--gg-accent-rgb)/0.55)] transition-all duration-200 hover:scale-[1.03] hover:brightness-110 hover:shadow-[0_24px_60px_-16px_rgb(var(--gg-accent-rgb)/0.7)] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-base-300 disabled:text-base-content/45 disabled:shadow-none disabled:hover:scale-100"
              disabled={isUnavailable}
              onClick={() => onAdd(product.id)}
              type="button"
            >
              {isUnavailable ? "Gone" : "Grab It"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { getDisplayLabel, getLineTotal, getStickerPromoLabel, getUnitPrice } from "@/lib/pricing";
import type { Product } from "@/types";
import logo from "@/assets/grave_goods_logo.png";

interface ProductCardProps {
  product: Product;
  onAdd: (id: string) => void;
  onQuickView: (product: Product) => void;
}

export function ProductCard({ product, onAdd, onQuickView }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const isUnavailable = product.isSoldOut || product.stockQuantity <= 0;
  const isLowStock = !isUnavailable && product.stockQuantity <= 5;
  const stockLabel = isUnavailable ? "Sold out" : isLowStock ? "Low stock" : "Ready to ship";
  const stockCountLabel = isUnavailable ? "0 available" : `${product.stockQuantity} available`;
  const typeLabel = `${product.type}s`;
  const promoLabel = getStickerPromoLabel(product);
  const unitPrice = getUnitPrice(product);
  const displayLabel = getDisplayLabel(product);
  const shouldCollapseDescription = product.description.length > 100;
  const compactDescription = shouldCollapseDescription ? `${product.description.slice(0, 100).trimEnd()}...` : product.description;

  function handleAdd() {
    onAdd(product.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1300);
  }

  return (
    <article className="card group flex h-full flex-col overflow-visible rounded-2xl border border-base-300 bg-base-200/90 text-base-content shadow-[0_28px_72px_-38px_rgba(0,0,0,0.98)] transition-[transform,box-shadow,border-color] duration-300 motion-reduce:transform-none motion-reduce:transition-none motion-safe:hover:-translate-y-0.5 hover:border-primary motion-safe:hover:shadow-[0_0_0_1px_rgb(var(--gg-accent-rgb)/0.4),0_0_48px_rgb(var(--gg-accent-rgb)/0.3),0_0_96px_rgb(var(--gg-accent-rgb)/0.15),0_34px_92px_-36px_rgba(0,0,0,1)] sm:flex-row sm:rounded-[1.5rem]">
      {/* Image side */}
      <button
        aria-label={`Quick view ${product.name}`}
        className="relative block w-full shrink-0 cursor-zoom-in overflow-hidden rounded-t-2xl bg-[linear-gradient(180deg,#22232a_0%,#111217_100%)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 sm:flex sm:h-28 sm:w-1/3 sm:items-center sm:justify-center sm:self-center sm:mx-4 sm:my-4 sm:rounded-xl sm:rounded-tr-xl"
        onClick={() => onQuickView(product)}
        type="button"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_18%,rgba(207,156,255,0.22),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(126,34,206,0.2),transparent_42%)]" />

        {/* Badges — hidden on sm+ where image is small */}
        <div className="absolute inset-x-0 top-0 z-10 flex flex-wrap items-start gap-1.5 p-2.5 sm:hidden">
          <span className="badge border border-emerald-500/35 bg-black px-2 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-emerald-400 shadow-sm">
            {typeLabel}
          </span>
          <span
            className={`badge px-2 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.12em] shadow-sm ${
              isUnavailable
                ? "badge-error"
                : isLowStock
                  ? "badge-warning"
                  : "badge-success"
            }`}
          >
            {stockLabel}
          </span>
        </div>

        {product.imageUrl ? (
          <img
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            src={product.imageUrl}
          />
        ) : (
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 m-auto h-[60%] w-[60%] rounded-full object-cover opacity-30 grayscale"
            src={logo}
          />
        )}

        <span className="badge badge-neutral absolute bottom-3 left-3 border-base-300 bg-base-100/55 px-2.5 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-base-content backdrop-blur sm:hidden">
          Quick view
        </span>
      </button>

      {/* Details side */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:py-5 sm:pr-5 sm:pl-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-base-content/50">{product.type}</p>
            <span
              className={`hidden sm:inline-flex badge px-2 py-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.1em] shadow-sm ${
                isUnavailable
                  ? "badge-error"
                  : isLowStock
                    ? "badge-warning"
                    : "badge-success"
              }`}
            >
              {stockLabel}
            </span>
          </div>
          <h3 className="mt-1.5 font-poster text-xl uppercase leading-tight tracking-[-0.02em] text-base-content sm:text-2xl">
            {product.name}
          </h3>
          {displayLabel ? <p className="mt-1 text-xs font-medium text-base-content/60">{displayLabel}</p> : null}

          <p className="mt-2.5 text-sm leading-relaxed text-base-content/65">
            {compactDescription}
          </p>
          {shouldCollapseDescription ? (
            <button
              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 transition hover:gap-2 hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => onQuickView(product)}
              type="button"
            >
              Read more
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          ) : null}
        </div>

        {/* Price + Add to cart */}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="grid gap-0.5">
            <span className="font-poster text-2xl leading-none text-base-content">${unitPrice.toFixed(2)}</span>
            <span className="text-xs text-base-content/50">{stockCountLabel}</span>
          </div>
          <button
            className={`btn btn-sm rounded-full border-0 px-5 font-poster text-sm uppercase tracking-[0.08em] text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:bg-base-300 disabled:text-base-content/45 disabled:shadow-none disabled:hover:scale-100 ${added ? "scale-105 bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_20px_rgba(16,185,129,0.35)]" : "bg-[rgb(var(--gg-accent-rgb))] shadow-[0_0_0_1px_rgb(var(--gg-accent-rgb)/0.3),0_12px_28px_rgb(var(--gg-accent-rgb)/0.28)]"}`}
            disabled={isUnavailable}
            onClick={handleAdd}
            type="button"
          >
            {isUnavailable ? "Gone" : added ? (
              <span className="inline-flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Got it
              </span>
            ) : "Grab it"}
          </button>
        </div>

        <p className="mt-3 text-[0.65rem] uppercase tracking-[0.1em] text-base-content/40">
          {promoLabel ?? (isUnavailable ? "You missed it" : isLowStock ? "Almost gone — don't sleep" : "Ready to slap on something")}
        </p>
      </div>
    </article>
  );
}

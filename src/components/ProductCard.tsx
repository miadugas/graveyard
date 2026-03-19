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
  const shouldCollapseDescription = product.description.length > 88;
  const compactDescription = shouldCollapseDescription ? `${product.description.slice(0, 88).trimEnd()}...` : product.description;

  function handleAdd() {
    onAdd(product.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1300);
  }

  const titleClampStyle = {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical" as const,
    WebkitLineClamp: 3,
    overflow: "hidden"
  };

  const descriptionClampStyle = {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical" as const,
    WebkitLineClamp: 4,
    overflow: "hidden"
  };

  return (
    <article className="card group flex h-full overflow-visible rounded-[2rem] border border-base-300 bg-base-200/90 text-base-content shadow-[0_28px_72px_-38px_rgba(0,0,0,0.98)] transition-[transform,box-shadow,border-color] duration-300 motion-reduce:transform-none motion-reduce:transition-none motion-safe:hover:-translate-y-1 hover:border-primary/55 motion-safe:hover:shadow-[0_0_0_1px_rgb(var(--gg-accent-rgb)/0.3),0_0_38px_rgb(var(--gg-accent-rgb)/0.22),0_0_78px_rgb(var(--gg-accent-rgb)/0.18),0_34px_92px_-36px_rgba(0,0,0,1)]">
      <button
        aria-label={`Quick view ${product.name}`}
        className="relative block aspect-[4/4.15] w-full overflow-hidden rounded-[2.35rem] bg-[linear-gradient(180deg,#22232a_0%,#111217_100%)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
        onClick={() => onQuickView(product)}
        type="button"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_18%,rgba(207,156,255,0.22),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(126,34,206,0.2),transparent_42%)]" />
        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4">
          <span className="badge border border-emerald-500/35 bg-black px-3 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emerald-400 shadow-sm">
            {typeLabel}
          </span>
          <span
            className={`badge px-3 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] shadow-sm ${
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
            className="absolute inset-0 m-auto h-[74%] w-[74%] rounded-full object-cover opacity-30 grayscale"
            src={logo}
          />
        )}
        <span className="badge badge-neutral absolute bottom-4 left-4 border-base-300 bg-base-100/55 px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-base-content backdrop-blur">
          Quick view
        </span>
      </button>

      <div className="relative z-20 -mt-16 flex flex-1 flex-col rounded-[2rem] border border-base-300/70 bg-[linear-gradient(180deg,rgba(34,29,44,0.98),rgba(13,12,18,0.98))] px-5 pb-5 pt-6 shadow-[0_22px_40px_-24px_rgba(0,0,0,0.9)] transition-colors duration-300 group-hover:border-primary/25">
        <div className="min-w-0">
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-base-content/55">{product.type}</p>
          <h3 className="mt-2 min-h-[4.95rem] font-display text-[1.65rem] leading-none text-base-content" style={titleClampStyle}>
            {product.name}
          </h3>
          {displayLabel ? <p className="mt-2 text-sm font-medium text-base-content/65">{displayLabel}</p> : null}
        </div>

        <div className="mt-4 min-h-[11.5rem]">
          <p className="text-[1rem] leading-7 text-base-content/72" style={descriptionClampStyle}>
            {compactDescription}
          </p>
          {shouldCollapseDescription ? (
            <button
              className="mt-1 text-sm font-semibold text-primary transition hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
              onClick={() => onQuickView(product)}
              type="button"
            >
              Read more
            </button>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div className="grid gap-0.5">
            <span className="text-[2rem] font-semibold leading-none text-base-content">${unitPrice.toFixed(2)}</span>
            <span className="text-sm text-base-content/55">{stockCountLabel}</span>
          </div>
          <button
            className="btn rounded-full border-0 bg-[rgb(var(--gg-accent-rgb))] px-6 text-base font-semibold text-white shadow-[0_0_0_1px_rgb(var(--gg-accent-rgb)/0.3),0_12px_28px_rgb(var(--gg-accent-rgb)/0.28)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 disabled:cursor-not-allowed disabled:bg-base-300 disabled:text-base-content/45 disabled:shadow-none"
            disabled={isUnavailable}
            onClick={handleAdd}
            type="button"
          >
            {isUnavailable ? "Sold Out" : added ? "Added" : "Add to cart"}
          </button>
        </div>

        <p className="mt-4 text-xs uppercase tracking-[0.12em] text-base-content/45">
          {promoLabel ?? (isUnavailable ? "Unavailable right now" : isLowStock ? "Small batch stock remaining" : "Packed for the next drop")}
        </p>
      </div>

      <div className="pointer-events-none absolute" aria-hidden="true" />
    </article>
  );
}

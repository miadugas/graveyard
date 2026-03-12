import { useState } from "react";
import type { Product } from "@/types";
import logo from "@/assets/grave_goods_logo.png";

interface ProductCardProps {
  product: Product;
  onAdd: (id: string) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const isUnavailable = product.isSoldOut || product.stockQuantity <= 0;
  const isLowStock = !isUnavailable && product.stockQuantity <= 5;
  const stockLabel = isUnavailable ? "Sold out" : isLowStock ? "Low stock" : "Ready to ship";
  const stockCountLabel = isUnavailable ? "0 available" : `${product.stockQuantity} available`;
  const typeLabel = `${product.type}s`;

  function handleAdd() {
    onAdd(product.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1300);
  }

  return (
    <article className="group overflow-visible rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(24,24,27,0.98),rgba(10,10,12,0.98))] p-3 text-white shadow-[0_28px_72px_-38px_rgba(0,0,0,0.98)] transition-[transform,box-shadow,border-color] duration-300 motion-reduce:transform-none motion-reduce:transition-none motion-safe:hover:-translate-y-1 hover:border-fuchsia-300/35 motion-safe:hover:shadow-[0_32px_90px_-34px_rgba(0,0,0,1)]">
      <div className="relative aspect-[4/4.15] overflow-hidden rounded-[2.35rem] bg-[linear-gradient(180deg,#22232a_0%,#111217_100%)]">
        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4">
          <span className="rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-zinc-100 shadow-sm backdrop-blur">
            {typeLabel}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] shadow-sm ${
              isUnavailable
                ? "bg-red-600 text-white"
                : isLowStock
                  ? "bg-amber-400 text-zinc-950"
                  : "bg-emerald-500 text-white"
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
      </div>

      <div className="relative z-20 -mt-16 mx-2 rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(30,31,38,0.98),rgba(15,15,19,0.98))] px-5 pb-5 pt-6 shadow-[0_22px_40px_-24px_rgba(0,0,0,0.9)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-zinc-400">{product.type}</p>
            <h3 className="mt-2 font-display text-[1.65rem] leading-none text-white">{product.name}</h3>
          </div>
          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/90 text-white shadow-[0_10px_24px_-12px_rgba(217,70,239,0.9)]">
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path d="m7.75 12.25 2.8 2.8 5.7-6.05" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
            </svg>
          </div>
        </div>

        <p className="mt-4 min-h-[4.75rem] text-[1rem] leading-7 text-zinc-300">{product.description}</p>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div className="grid gap-0.5">
            <span className="text-[2rem] font-semibold leading-none text-white">${product.price.toFixed(2)}</span>
            <span className="text-sm text-zinc-400">{stockCountLabel}</span>
          </div>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white px-6 py-3 text-base font-semibold text-black transition hover:-translate-y-0.5 hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:border-transparent disabled:bg-zinc-700 disabled:text-zinc-400"
            disabled={isUnavailable}
            onClick={handleAdd}
            type="button"
          >
            {isUnavailable ? "Sold Out" : added ? "Added" : "Add to cart"}
          </button>
        </div>

        <p className="mt-4 text-xs uppercase tracking-[0.12em] text-zinc-500">
          {isUnavailable ? "Unavailable right now" : isLowStock ? "Small batch stock remaining" : "Packed for the next drop"}
        </p>
      </div>

      <div className="pointer-events-none absolute" aria-hidden="true" />
    </article>
  );
}

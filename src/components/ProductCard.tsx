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

  function handleAdd() {
    onAdd(product.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1300);
  }

  return (
    <article className="group rounded-2xl border border-white/15 bg-zinc-900/90 p-4 shadow-2xl shadow-black/70 transition-[border-color,box-shadow,transform] duration-200 motion-reduce:transform-none motion-reduce:transition-none motion-safe:hover:-translate-y-0.5 hover:border-fuchsia-300/55 hover:shadow-[0_0_0_1px_rgba(217,70,239,0.38),0_0_18px_rgba(192,38,211,0.32),0_28px_36px_-24px_rgba(0,0,0,0.95)] focus-within:border-fuchsia-200/75 focus-within:shadow-[0_0_0_2px_rgba(244,114,182,0.72),0_0_20px_rgba(217,70,239,0.4),0_28px_36px_-24px_rgba(0,0,0,0.95)]">
      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl border border-white/20 bg-[linear-gradient(150deg,#111,#050505)]">
        {isUnavailable ? (
          <span className="absolute left-2 top-2 z-10 rounded-full border border-red-200/40 bg-red-700/80 px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white">
            Sold Out
          </span>
        ) : isLowStock ? (
          <span className="absolute left-2 top-2 z-10 rounded-full border border-amber-200/40 bg-amber-600/85 px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white">
            Low Stock
          </span>
        ) : null}
        {product.imageUrl ? (
          <img alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" src={product.imageUrl} />
        ) : (
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 m-auto h-[78%] w-[78%] rounded-full border border-white/10 object-cover opacity-30 grayscale"
            src={logo}
          />
        )}
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">{product.type}</p>
      <h3 className="mt-1 font-display text-xl text-white">{product.name}</h3>
      <p className="mt-2 text-sm text-zinc-300">{product.description}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.12em] text-zinc-400">
        {isUnavailable ? "Currently unavailable" : `In stock: ${product.stockQuantity}`}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-semibold text-zinc-100">${product.price.toFixed(2)}</span>
        <button
          className="gg-btn-primary hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          disabled={isUnavailable}
          onClick={handleAdd}
          type="button"
        >
          {isUnavailable ? "Sold Out" : added ? "Added" : "Add"}
        </button>
      </div>
    </article>
  );
}

import type { Product } from "@/types";
import logo from "@/assets/grave_goods_logo.png";

interface ProductCardProps {
  product: Product;
  onAdd: (id: string) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <article className="rounded-2xl border border-white/15 bg-zinc-900/90 p-4 shadow-2xl shadow-black/70">
      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl border border-white/20 bg-[linear-gradient(150deg,#111,#050505)]">
        {product.imageUrl ? (
          <img alt={product.name} className="h-full w-full object-cover" src={product.imageUrl} />
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
      <div className="mt-4 flex items-center justify-between">
        <span className="font-semibold text-zinc-100">${product.price.toFixed(2)}</span>
        <button
          className="rounded-full border border-white bg-white px-4 py-2 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-zinc-200"
          onClick={() => onAdd(product.id)}
          type="button"
        >
          Add
        </button>
      </div>
    </article>
  );
}

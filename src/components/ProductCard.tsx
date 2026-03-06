import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onAdd: (id: string) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <article className="rounded-2xl border border-white/15 bg-soot-700/90 p-4 shadow-glow">
      <div className="mb-4 aspect-[4/3] rounded-xl border border-white/20 bg-[radial-gradient(circle_at_top,_rgba(255,95,50,0.45),transparent_42%),linear-gradient(150deg,#260f09,#131313)]" />
      <p className="text-xs uppercase tracking-[0.2em] text-ember-300">{product.type}</p>
      <h3 className="mt-1 font-display text-xl text-amber-50">{product.name}</h3>
      <p className="mt-2 text-sm text-stone-300">{product.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-semibold text-amber-100">${product.price.toFixed(2)}</span>
        <button
          className="rounded-full bg-ember-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ember-700"
          onClick={() => onAdd(product.id)}
          type="button"
        >
          Add
        </button>
      </div>
    </article>
  );
}

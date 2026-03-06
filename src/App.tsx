import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCard } from "@/components/ProductCard";
import { createOrder, fetchProducts } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import type { ProductType } from "@/types";

const filters: Array<{ label: string; value: ProductType | "all" }> = [
  { label: "All", value: "all" },
  { label: "Stickers", value: "sticker" },
  { label: "Buttons", value: "button" },
  { label: "Bundles", value: "bundle" }
];

export default function App() {
  const [activeFilter, setActiveFilter] = useState<ProductType | "all">("all");
  const [isCartOpen, setCartOpen] = useState(false);

  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts
  });

  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") {
      return products;
    }
    return products.filter((product) => product.type === activeFilter);
  }, [activeFilter, products]);

  const itemCount = Object.values(items).reduce((sum, count) => sum + count, 0);

  const orderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (result) => {
      clearCart();
      setCartOpen(false);
      alert(`Order ${result.orderId} saved to Postgres.`);
    },
    onError: (error) => {
      alert(error instanceof Error ? error.message : "Unable to place order");
    }
  });

  function handleCheckout() {
    const payload = {
      customerName: "Demo Customer",
      customerEmail: "demo@gravegoods.local",
      items: Object.entries(items).map(([productId, quantity]) => ({ productId, quantity }))
    };

    orderMutation.mutate(payload);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(255,95,50,0.22),transparent_36%),radial-gradient(circle_at_90%_0%,rgba(124,54,31,0.35),transparent_30%),linear-gradient(140deg,#080808,#141312_50%,#0d0d0d)] text-stone-100">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.08)_0.7px,transparent_0.7px)] [background-size:2px_2px]" />

      <header className="sticky top-0 z-20 border-b border-white/15 bg-black/65 backdrop-blur">
        <div className="mx-auto flex w-[min(1120px,92vw)] items-center justify-between py-4">
          <h1 className="font-display text-2xl uppercase tracking-[0.15em] text-amber-50">Grave Goods</h1>
          <button
            className="rounded-full border border-white/20 px-4 py-2 text-sm hover:border-ember-300"
            onClick={() => setCartOpen(true)}
            type="button"
          >
            Cart ({itemCount})
          </button>
        </div>
      </header>

      <main className="mx-auto w-[min(1120px,92vw)] py-10">
        <section className="mb-10 grid gap-4">
          <p className="text-xs uppercase tracking-[0.2em] text-ember-300">Home-Based Sticker & Button Studio</p>
          <p className="max-w-3xl font-display text-4xl leading-tight md:text-6xl">
            Small-batch spooky-cute goods made by hand, built to be seen.
          </p>
          <p className="max-w-2xl text-stone-300">
            Grave Goods is an ecommerce shop for premium vinyl stickers and collectible pin buttons. Fast shipping,
            durable finishes, and rotating themed drops.
          </p>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  activeFilter === filter.value
                    ? "border-transparent bg-ember-500 text-white"
                    : "border-white/20 bg-black/20 text-stone-200"
                }`}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {isLoading && <p>Loading products...</p>}
          {isError && <p>Could not load products. Start the API server and try again.</p>}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={(id) => {
                  addItem(id);
                  setCartOpen(true);
                }}
              />
            ))}
          </div>
        </section>
      </main>

      <CartDrawer
        open={isCartOpen}
        products={products}
        items={items}
        onClose={() => setCartOpen(false)}
        onAdd={addItem}
        onDecrement={decrementItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
